import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { animationVariants } from "~/utils/animationUtils";
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

const fruits = ['Apple', 'Banana', 'Orange', 'Grape', 'Strawberry', 'Mango'];

const SortingPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [items, setItems] = useState(fruits);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const handleNext = () => {
    void router.push("/Final");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-6">
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
                Sort Your Favorite Fruits
              </h1>
              <p className="text-gray-600">Drag and drop to rank from best to worst.</p>
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
                <div className="space-y-2">
                  {items.map(id => (
                    <SortableItem key={id} id={id}>
                      <div className="cursor-grab rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm active:cursor-grabbing">
                        {id}
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <div className="cursor-grabbing rounded-lg border border-gray-200 bg-white p-4 text-center shadow-lg">
                    {activeId}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            <div className="mt-8 flex justify-center">
              <motion.button
                onClick={handleNext}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default SortingPage;
