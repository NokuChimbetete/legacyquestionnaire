import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { animationVariants, interactions } from "~/utils/animationUtils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from '~/components/SortableItem';
import { useLegacies, getLegacyGroups, type Legacy } from '~/utils/legacies';
import ProgressBar from '~/components/ProgressBar';

const SortingPage: React.FC = () => {
  const router = useRouter();
  const { responseId } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const legacies = useLegacies();
  const [legacyGroups, setLegacyGroups] = useState<Legacy[][]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (legacies.length > 0) {
      const groups = getLegacyGroups(legacies);
      setLegacyGroups(groups);
      const currentGroup = groups[currentGroupIndex];
      if (currentGroup) {
        setItems(currentGroup.map((legacy) => legacy.name));
      }
    }
  }, [legacies, currentGroupIndex]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.indexOf(active.id as string);
        const newIndex = currentItems.indexOf(over.id as string);
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

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

  const handleNext = async () => {
    if (!user || !responseId) {
      console.error("User or responseId not available");
      return;
    }

    setIsSubmitting(true);

    const groupKey = `sorting_group_${currentGroupIndex}`;
    const sortedData = {
      order: items,
      timestamp: new Date(),
    };

    try {
      await updateDoc(doc(db, "responses", responseId as string), {
        [groupKey]: sortedData,
        lastUpdated: new Date(),
      });

      if (currentGroupIndex < legacyGroups.length - 1) {
        const nextGroupIndex = currentGroupIndex + 1;
        const nextGroup = legacyGroups[nextGroupIndex];
        if (nextGroup) {
          setItems(nextGroup.map(legacy => legacy.name));
        }
        setCurrentGroupIndex(nextGroupIndex);
      } else {
        await updateDoc(doc(db, "responses", responseId as string), {
          sortingCompleted: true,
          sortingCompletedAt: new Date(),
        });
        void router.push("/Final");
      }
    } catch (error) {
      console.error("Error saving sorted data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressMessage = () => {
    const progress = (currentGroupIndex + 1) / legacyGroups.length;
    if (progress < 0.25) {
      return "It's the last set!";
    }
    if (progress < 0.5) {
      return "Making good progress!";
    }
    if (progress < 0.75) {
      return "You're doing great!";
    }
    return "You're almost there!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <ProgressBar
        current={currentGroupIndex + 1}
        total={legacyGroups.length}
        isCompleted={currentGroupIndex === legacyGroups.length - 1 && isSubmitting}
      />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-6 pt-32">
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="rounded-xl bg-white p-8 shadow-xl"
            {...animationVariants.fadeIn}
          >
            <motion.div 
              className="mb-6 text-center"
              {...animationVariants.slideUp}
            >
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Sort Your Mottos!
              </h1>
                
                <p className="font-bold bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {getProgressMessage()}
                </p>
                <p className="text-gray-600 mt-2">
                  Drag and drop to rank the following statements.
                </p>
            </motion.div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {items.map((id, index) => (
                    <SortableItem key={id} id={id}>
                      <motion.div
                        layoutId={id}
                        className="group relative block cursor-grab rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm active:cursor-grabbing active:border-blue-500 active:bg-blue-50"
                        whileHover={interactions.cardHover}
                        whileTap={interactions.tap}
                      >
                        <div className="flex items-center">
                          <span className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-500 transition-colors group-active:bg-blue-100 group-active:text-blue-600">
                            {index + 1}
                          </span>
                          <span className="text-left text-lg leading-relaxed text-gray-800 group-hover:text-gray-900">
                            {legacyGroups[currentGroupIndex]?.find(legacy => legacy.name === id)?.text}
                          </span>
                        </div>
                      </motion.div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <motion.div
                    layoutId={activeId}
                    className="group relative block cursor-grabbing rounded-xl border-2 border-blue-500 bg-blue-50 p-6 text-center shadow-lg"
                  >
                    <span className="text-lg text-gray-800 leading-relaxed group-hover:text-gray-900">
                      {legacyGroups[currentGroupIndex]?.find(legacy => legacy.name === activeId)?.text}
                    </span>
                  </motion.div>
                ) : null}
              </DragOverlay>
            </DndContext>

            <div className="mt-8 flex justify-end">
              <motion.button
                onClick={handleNext}
                disabled={isSubmitting}
                className={`flex items-center space-x-2 rounded-xl px-8 py-4 font-semibold text-white shadow-lg transition-all duration-150 ${
                  !isSubmitting
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                whileHover={!isSubmitting ? interactions.buttonHover : {}}
                whileTap={!isSubmitting ? interactions.tap : {}}
              >
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : currentGroupIndex < legacyGroups.length - 1
                    ? "Next Group"
                    : "Submit Rankings"}
                </span>
                {!isSubmitting && (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default SortingPage;
