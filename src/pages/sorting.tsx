import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "./../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { auth } from "./../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { animationVariants, interactions } from "~/utils/animationUtils";

interface DragItem {
  id: string;
  name: string;
  emoji: string;
}

const fruits: DragItem[] = [
  { id: "apple", name: "Apple", emoji: "🍎" },
  { id: "banana", name: "Banana", emoji: "🍌" },
  { id: "coconut", name: "Coconut", emoji: "🥥" },
  { id: "dragonfruit", name: "Dragonfruit", emoji: "🐉" },
  { id: "eggplant", name: "Eggplant", emoji: "🍆" },
];

const SortingPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sortedFruits, setSortedFruits] = useState<DragItem[]>([]);
  const [availableFruits, setAvailableFruits] = useState<DragItem[]>(fruits);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Show loading while auth state is being determined
  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    void router.push('/');
    return <div>Redirecting to login...</div>;
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: DragItem) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(item));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetArea: "sorted" | "available") => {
    e.preventDefault();
    const itemData = e.dataTransfer.getData("text/plain");
    const item: DragItem = JSON.parse(itemData);

    if (targetArea === "sorted" && !sortedFruits.find(f => f.id === item.id)) {
      setSortedFruits(prev => [...prev, item]);
      setAvailableFruits(prev => prev.filter(f => f.id !== item.id));
    } else if (targetArea === "available" && !availableFruits.find(f => f.id === item.id)) {
      setAvailableFruits(prev => [...prev, item]);
      setSortedFruits(prev => prev.filter(f => f.id !== item.id));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const moveFruitUp = (index: number) => {
    if (index === 0) return;
    const newSorted = [...sortedFruits];
    const current = newSorted[index];
    const previous = newSorted[index - 1];
    if (current && previous) {
      newSorted[index - 1] = current;
      newSorted[index] = previous;
      setSortedFruits(newSorted);
    }
  };

  const moveFruitDown = (index: number) => {
    if (index === sortedFruits.length - 1) return;
    const newSorted = [...sortedFruits];
    const current = newSorted[index];
    const next = newSorted[index + 1];
    if (current && next) {
      newSorted[index] = next;
      newSorted[index + 1] = current;
      setSortedFruits(newSorted);
    }
  };

  const handleSubmit = async () => {
    if (sortedFruits.length === 0) {
      setValidationError("Please rank at least one fruit before continuing.");
      return;
    }

    if (!user) {
      setValidationError("You must be signed in to submit your preferences.");
      return;
    }

    setIsSubmitting(true);
    setValidationError("");

    try {
      // Find the user's response document
      const responseQuery = await import("firebase/firestore").then(({ collection, query, where, getDocs }) => {
        return getDocs(query(collection(db, "responses"), where("userId", "==", user.uid)));
      });

      if (!responseQuery.empty) {
        const responseDoc = responseQuery.docs[0];
        if (responseDoc) {
          await updateDoc(doc(db, "responses", responseDoc.id), {
            fruitSorting: {
              preferences: sortedFruits.map((fruit, index) => ({
                ...fruit,
                rank: index + 1
              })),
              completedAt: new Date()
            },
            lastUpdated: new Date()
          });
        }
      }

      // Navigate to final page
      void router.push("/Final");
    } catch (error) {
      console.error("Error saving fruit preferences:", error);
      setValidationError("Failed to save preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-6">
        <motion.div
          className="w-full max-w-4xl"
          {...animationVariants.scaleIn}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div 
            className="relative rounded-2xl bg-white p-8 shadow-xl border border-gray-100 backdrop-blur-sm"
            {...animationVariants.fadeIn}
          >
            {/* Header */}
            <motion.div 
              className="mb-8 text-center"
              {...animationVariants.slideUp}
            >
              <h1 className="mb-4 text-4xl font-bold text-gray-900">
                🍎 Fruit Preference Sorting
              </h1>
              <p className="text-lg text-gray-600">
                Drag and drop the fruits below to rank them from most to least preferred
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Available Fruits */}
              <motion.div
                className="space-y-4"
                {...animationVariants.slideUp}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Available Fruits
                </h2>
                <div
                  className="min-h-[300px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 space-y-3"
                  onDrop={(e) => handleDrop(e, "available")}
                  onDragOver={handleDragOver}
                >
                  <AnimatePresence>
                    {availableFruits.map((fruit) => (
                      <motion.div
                        key={fruit.id}
                        className="flex items-center space-x-3 rounded-lg bg-white p-4 shadow-sm border cursor-move hover:shadow-md transition-shadow"
                        whileHover={interactions.cardHover}
                        whileTap={interactions.tap}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, fruit)}
                          className="flex items-center space-x-3 w-full"
                        >
                          <span className="text-2xl">{fruit.emoji}</span>
                          <span className="text-lg font-medium text-gray-800">{fruit.name}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {availableFruits.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      All fruits have been ranked!
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Sorted Fruits */}
              <motion.div
                className="space-y-4"
                {...animationVariants.slideUp}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Your Ranking (1st to last)
                </h2>
                <div
                  className="min-h-[300px] rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-4 space-y-3"
                  onDrop={(e) => handleDrop(e, "sorted")}
                  onDragOver={handleDragOver}
                >
                  <AnimatePresence>
                    {sortedFruits.map((fruit, index) => (
                      <motion.div
                        key={fruit.id}
                        className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border cursor-move hover:shadow-md transition-shadow"
                        whileHover={interactions.cardHover}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, fruit)}
                          className="flex items-center space-x-3 flex-1"
                        >
                          <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                            {index + 1}
                          </span>
                          <span className="text-2xl">{fruit.emoji}</span>
                          <span className="text-lg font-medium text-gray-800">{fruit.name}</span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => moveFruitUp(index)}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveFruitDown(index)}
                            disabled={index === sortedFruits.length - 1}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {sortedFruits.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Drag fruits here to rank them
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              className="mt-8 flex justify-center"
              {...animationVariants.slideUp}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={handleSubmit}
                disabled={sortedFruits.length === 0 || isSubmitting}
                className={`flex items-center space-x-2 rounded-xl px-8 py-4 font-semibold text-white shadow-lg transition-all duration-150 ${
                  sortedFruits.length > 0 && !isSubmitting
                    ? "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 hover:shadow-xl" 
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                whileHover={sortedFruits.length > 0 && !isSubmitting ? interactions.buttonHover : {}}
                whileTap={sortedFruits.length > 0 && !isSubmitting ? interactions.tap : {}}
              >
                <span>
                  {isSubmitting ? "Saving..." : "Complete Survey"}
                </span>
                {!isSubmitting && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </motion.button>
            </motion.div>

            {/* Instructions */}
            <motion.div
              className="mt-6 text-center text-sm text-gray-600"
              {...animationVariants.fadeIn}
              transition={{ delay: 0.3 }}
            >
              <p>💡 You can drag fruits between sections or use the arrow buttons to reorder</p>
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
      </main>
    </div>
  );
};

export default SortingPage;
