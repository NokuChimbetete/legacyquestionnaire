import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "./../../../firebase";
import { doc, collection, updateDoc, addDoc, getDoc, query, where, getDocs } from "firebase/firestore";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./../../../firebase";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "../../components/ProgressBar";
import { sanitizeInput, validateInput, rateLimiter } from "../../utils/security";
import { animationVariants, interactions } from "~/utils/animationUtils";

interface QuestionData {
  ILO: string;
  Question: string;
  Group_A?: string;
  Group_B?: string;
  Group_C?: string;
  Group_D?: string;
  Group_E?: string;
  Option_A?: string;
  Option_B?: string;
  Option_C?: string;
  Option_D?: string;
  Option_E?: string;
}

type GroupedQuestions = Record<string, QuestionData[]>;

// Helper to fetch and parse CSV
const useQuestionsFromCSV = () => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  useEffect(() => {
    fetch("/legacy_questions.csv")
      .then((res) => res.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, { header: true });
        // Define ILO order to ensure consistent sequencing
        const iloOrder = ['CR', 'IC', 'PD', 'SW', 'IE'];
        
        // Group by ILO
        const grouped: GroupedQuestions = {};
        parsed.data.forEach((row: unknown) => {
          const questionRow = row as QuestionData;
          if (questionRow.ILO && questionRow.Question) { // Ensure valid row
            if (!grouped[questionRow.ILO]) grouped[questionRow.ILO] = [];
            grouped[questionRow.ILO]?.push(questionRow);
          }
        });
        
        // Take 5 random questions from each ILO
        const selected: QuestionData[] = [];
        iloOrder.forEach((ilo) => {
          const arr = grouped[ilo] ?? [];
          if (arr.length > 0) {
            // Shuffle questions within this ILO using Fisher-Yates algorithm
            const shuffledArr = [...arr];
            for (let i = shuffledArr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              const temp = shuffledArr[i];
              if (temp && shuffledArr[j]) {
                shuffledArr[i] = shuffledArr[j];
                shuffledArr[j] = temp;
              }
            }
            // Take up to 5 questions from this ILO
            const questionsFromThisILO = shuffledArr.slice(0, Math.min(5, shuffledArr.length));
            selected.push(...questionsFromThisILO);
            console.log(`Selected ${questionsFromThisILO.length} questions from ILO: ${ilo}`);
          }
        });
        
        // Randomize the order of all selected questions
        const finalQuestions = [...selected];
        for (let i = finalQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = finalQuestions[i];
          if (temp && finalQuestions[j]) {
            finalQuestions[i] = finalQuestions[j];
            finalQuestions[j] = temp;
          }
        }        
        console.log(`Total questions selected: ${finalQuestions.length}`);
        console.log('Randomized question sequence by ILO:', finalQuestions.map(q => q.ILO));
        setQuestions(finalQuestions);
      })
      .catch((error) => {
        console.error("Error loading questions:", error);
      });
  }, []);  
  return questions;
};

// Helper functions to safely access question properties
const getGroupValue = (question: QuestionData, option: string): string => {
  const key = `Group_${option}` as keyof QuestionData;
  return question[key] ?? '';
};

const getOptionValue = (question: QuestionData, option: string): string => {
  const key = `Option_${option}` as keyof QuestionData;
  return question[key] ?? '';
};

const QuestionPage: React.FC = () => {
  const router = useRouter();
  const { questionId } = router.query;
  const allQuestions = useQuestionsFromCSV();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [showAnswerLoaded, setShowAnswerLoaded] = useState(false);
  const [hasInitializedResponse, setHasInitializedResponse] = useState(false);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      // Reset initialization flag when user changes
      if (currentUser) {
        setHasInitializedResponse(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load existing response and questions when user is authenticated
  useEffect(() => {
    const loadExistingResponse = async () => {
      if (!user || allQuestions.length === 0 || hasInitializedResponse) {
        console.log("Skipping loadExistingResponse:", { 
          hasUser: !!user, 
          questionsLength: allQuestions.length, 
          hasInitialized: hasInitializedResponse 
        });
        return;
      }

      try {
        console.log("Starting loadExistingResponse for user:", user.uid);
        setHasInitializedResponse(true); // Prevent multiple executions
        
        // Check if user has an existing response document
        const responsesCollection = collection(db, "responses");
        const q = query(responsesCollection, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.docs.length > 1) {
          console.warn(`Found ${querySnapshot.docs.length} response documents for user ${user.uid}. Using the first one.`);
          // TODO: Consider implementing cleanup logic to remove duplicate documents
          // For now, we'll use the first document and log a warning
        }

        if (!querySnapshot.empty) {
          const existingDoc = querySnapshot.docs[0];
          if (existingDoc) {
            const existingData = existingDoc.data();
            console.log("Found existing response document:", existingDoc.id);
            setResponseId(existingDoc.id);

            // If questions are already stored, use them
            if (existingData.questions && Array.isArray(existingData.questions)) {
              console.log("Loading existing questions from response document");
              setQuestions(existingData.questions);
            } else {
              // First time user - store the generated questions
              console.log("First time user - storing generated questions in existing document");
              const questionsToStore = allQuestions.map((q, index) => ({
                ...q,
                questionIndex: index + 1
              }));
              
              await updateDoc(doc(db, "responses", existingDoc.id), {
                questions: questionsToStore,
                totalQuestions: questionsToStore.length,
                lastUpdated: new Date()
              });
              
              setQuestions(questionsToStore);
            }
          }
        } else {
          // No existing response - create one with generated questions
          console.log("No existing response found - creating new response document with generated questions");
          const questionsToStore = allQuestions.map((q, index) => ({
            ...q,
            questionIndex: index + 1
          }));
          
          const newResponseData = {
            userId: user.uid,
            userEmail: sanitizeInput.email(user.email ?? ''),
            startedAt: new Date(),
            lastUpdated: new Date(),
            totalQuestions: questionsToStore.length,
            questions: questionsToStore
          };
          
          const docRef = await addDoc(collection(db, "responses"), newResponseData);
          console.log("Created new response document:", docRef.id);
          setResponseId(docRef.id);
          setQuestions(questionsToStore);
        }
      } catch (error) {
        console.error("Error loading existing response:", error);
        // Fallback to using generated questions if there's an error
        setQuestions(allQuestions);
        setHasInitializedResponse(false); // Reset flag on error to allow retry
      } finally {
        setIsLoadingExisting(false);
      }
    };

    if (user && allQuestions.length > 0) {
      void loadExistingResponse();
    }
  }, [user, allQuestions, hasInitializedResponse]);

  // Cleanup effect to reset initialization flag on unmount
  useEffect(() => {
    return () => {
      setHasInitializedResponse(false);
    };
  }, []);

  // Load existing answer for current question
  useEffect(() => {
    const loadExistingAnswer = async () => {
      if (!responseId || !user || questions.length === 0) {
        // Reset selected option if we don't have the necessary data yet
        if (!responseId || questions.length === 0) {
          setSelectedOption("");
          setShowAnswerLoaded(false);
        }
        return;
      }

      try {
        const responseDoc = await getDoc(doc(db, "responses", responseId));
        if (responseDoc.exists()) {
          const data = responseDoc.data();
          const questionKey = `q${currentQuestion}_${questions[currentQuestion - 1]?.ILO}`;
          
          const questionData = data[questionKey] as { answer?: string } | undefined;
          if (questionData?.answer) {
            console.log(`Loading existing answer for question ${currentQuestion}:`, questionData.answer);
            setSelectedOption(questionData.answer);
            setShowAnswerLoaded(true);
            // Hide the indicator after 2 seconds
            setTimeout(() => setShowAnswerLoaded(false), 2000);
          } else {
            setSelectedOption("");
            setShowAnswerLoaded(false);
          }
        }
      } catch (error) {
        console.error("Error loading existing answer:", error);
        setSelectedOption("");
        setShowAnswerLoaded(false);
      }
    };

    if (responseId && questions.length > 0) {
      void loadExistingAnswer();
    }
  }, [responseId, currentQuestion, questions, user]);

  useEffect(() => {
    if (questionId) {
      const sanitizedQuestionId = sanitizeInput.text(questionId as string);
      const parsedQuestionId = parseInt(sanitizedQuestionId);
      
      if (!validateInput.questionId(sanitizedQuestionId) || isNaN(parsedQuestionId) || parsedQuestionId < 1) {
        // Invalid question ID, redirect to first question
        void router.replace('/questions/1');
        return;
      }
      
      setCurrentQuestion(parsedQuestionId);
    }
  }, [questionId, router]);

  useEffect(() => {
    if (questionId) {
      const parsedQuestionId = parseInt(questionId as string, 10);
      if (!isNaN(parsedQuestionId)) {
        setCurrentQuestion(parsedQuestionId);
        // Don't reset selectedOption here - let the loadExistingAnswer effect handle it
        // Smooth scroll to main content when question changes
        setTimeout(() => {
          const mainContent = document.querySelector('main');
          if (mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, [questionId]);

  const question = questions[currentQuestion - 1] ?? null;

  // Show loading while auth state is being determined or loading existing data
  if (authLoading || isLoadingExisting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your questionnaire...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    void router.push('/');
    return <div>Redirecting to login...</div>;
  }

  if (!question) {
    return <div>Loading questions...</div>;
  }

  const handleOptionChange = (value: string) => {
    const sanitizedValue = sanitizeInput.text(value);
    
    if (!validateInput.text(sanitizedValue, 1, 500)) {
      setValidationError("Please select a valid option");
      return;
    }
    
    setValidationError("");
    setSelectedOption(sanitizedValue);
  };

  const goToNextQuestion = async () => {
    if (!user) {
      setValidationError("You must be signed in to submit your answers.");
      return;
    }

    if (!selectedOption.trim()) {
      setValidationError("Please select an answer before continuing.");
      return;
    }

    if (!responseId) {
      setValidationError("Please wait while we prepare your questionnaire...");
      return;
    }

    // Rate limiting check
    const userId = user.uid;
    if (rateLimiter.isRateLimited(`question-${userId}`, 30, 60 * 1000)) {
      setValidationError("You're submitting answers too quickly. Please wait a moment.");
      return;
    }

    setIsSubmitting(true);
    setValidationError("");

    // Smooth scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Create a unique question identifier with sanitized data
    const sanitizedQuestionIndex = sanitizeInput.number(currentQuestion.toString());
    const sanitizedILO = sanitizeInput.text(question.ILO || '');
    const sanitizedAnswer = sanitizeInput.text(selectedOption);
    const sanitizedQuestion = sanitizeInput.text(question.Question || '');
    
    if (!sanitizedQuestionIndex || !sanitizedILO || !sanitizedAnswer || !sanitizedQuestion) {
      setValidationError("Invalid data detected. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const questionKey = `q${sanitizedQuestionIndex}_${sanitizedILO}`;
    
    const responseData = {
      [questionKey]: {
        answer: sanitizedAnswer,
        question: sanitizedQuestion,
        questionIndex: sanitizedQuestionIndex,
        ilo: sanitizedILO,
        timestamp: new Date()
      }
    };

    try {
      // Update existing response document
      const updateData = {
        ...responseData,
        lastUpdated: new Date()
      };
      
      await updateDoc(doc(db, "responses", responseId), updateData);
      console.log("Updated response document:", responseId);

      // Navigate to next question or sorting page
      const nextQuestionId = currentQuestion + 1;
      if (nextQuestionId <= questions.length) {
        void router.push(`/questions/${nextQuestionId}`);
      } else {
        // Mark as completed when going to sorting page
        await updateDoc(doc(db, "responses", responseId), {
          questionsCompletedAt: new Date(),
          questionsCompleted: true
        });
        void router.push(`/sorting?responseId=${responseId}`);
      }
    } catch (error) {
      console.error("Error saving response:", error);
      setValidationError("Failed to save response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      <ProgressBar
        current={currentQuestion}
        total={questions.length}
        isCompleted={currentQuestion === questions.length && isSubmitting}
      />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-6 pt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={`question-${currentQuestion}`}
            className="w-full max-w-2xl"
            {...animationVariants.scaleIn}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div 
              className="relative rounded-2xl bg-white p-8 shadow-xl border border-gray-100 backdrop-blur-sm"
            >
              {/* ILO Section Indicator */}
              <motion.div 
                className="mb-6 flex items-center justify-between"
                {...animationVariants.fadeIn}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Question {currentQuestion} of {questions.length}
                  </span>
                </div>
              </motion.div>

              <motion.h2 
                className="mb-6 text-3xl font-bold text-gray-900 leading-tight"
                {...animationVariants.slideUp}
              >
                {question.Question}
              </motion.h2>
              
              {/* Show indicator when existing answer is loaded */}
              {showAnswerLoaded && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 flex items-center justify-center space-x-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2"
                >
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">Previous answer loaded</span>
                </motion.div>
              )}

              <motion.form
                {...animationVariants.fadeIn}
              >
                <motion.div 
                  className="space-y-3"
                  variants={animationVariants.container}
                  initial="initial"
                  animate="animate"
                >
                  {["A","B","C","D","E"].map((opt, _index) => (
                    <motion.label
                      key={opt}
                      className={`group relative block cursor-pointer rounded-xl border-2 p-6 ${
                        selectedOption === getGroupValue(question, opt)
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 bg-white"
                      }`}
                      variants={animationVariants.item}
                      whileHover={interactions.cardHover}
                      whileTap={interactions.tap}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={`question${currentQuestion}`}
                          value={getGroupValue(question, opt)}
                          checked={selectedOption === getGroupValue(question, opt)}
                          onChange={() => handleOptionChange(getGroupValue(question, opt))}
                          className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-0 focus:outline-none mr-4 flex-shrink-0"
                        />
                        <span className="text-lg text-gray-800 leading-relaxed group-hover:text-gray-900">
                          {getOptionValue(question, opt)}
                        </span>
                      </div>
                    </motion.label>
                  ))}
                </motion.div>
              </motion.form>

              <motion.div
                className="mt-8 flex justify-between"
                {...animationVariants.slideUp}
              >
                {/* Previous Button */}
                {currentQuestion > 1 && (
                  <motion.button
                    onClick={() => {
                      const prevQuestionId = currentQuestion - 1;
                      void router.push(`/questions/${prevQuestionId}`);
                    }}
                    className="flex items-center space-x-2 rounded-xl px-8 py-4 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-lg transition-all duration-150"
                    whileHover={interactions.buttonHover}
                    whileTap={interactions.tap}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous Question</span>
                  </motion.button>
                )}
                
                {/* Spacer for centering when no previous button */}
                {currentQuestion === 1 && <div></div>}
                
                {/* Next Button */}
                <motion.button
                  onClick={goToNextQuestion}
                  disabled={!selectedOption || isSubmitting || !responseId}
                  className={`flex items-center space-x-2 rounded-xl px-8 py-4 font-semibold text-white shadow-lg transition-all duration-150 ${
                    selectedOption && !isSubmitting && responseId
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl" 
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                  whileHover={selectedOption && !isSubmitting && responseId ? interactions.buttonHover : {}}
                  whileTap={selectedOption && !isSubmitting && responseId ? interactions.tap : {}}
                >
                  <span>
                    {isSubmitting ? "Saving..." : !responseId ? "Preparing..." : currentQuestion === questions.length ? "Complete Survey" : "Next Question"}
                  </span>
                  {!isSubmitting && responseId && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </motion.button>
              </motion.div>
              
              {/* Error Message */}
              {validationError && (
                <motion.p
                  {...animationVariants.slideUp}
                  className="mt-4 text-sm text-red-600 text-center"
                >
                  {validationError}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default QuestionPage;
