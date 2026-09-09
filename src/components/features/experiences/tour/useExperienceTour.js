import { useEffect, useRef } from 'react';
import { ExperienceTour } from './ExperienceTour';

export const useExperienceTour = ({ scene, pannellumRef, isReady = true, lang = 'es' }) => {
  const tourRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Wait until basic conditions are met
    if (!scene || !isReady || initializedRef.current) return;

    // Check if we should even instantiate it
    const completed = localStorage.getItem('cotecmar360_experience_tour_v1');
    if (completed === 'completed') return;

    // Add a slight delay to ensure the DOM elements are fully rendered
    const timeoutId = setTimeout(() => {
      // Check again to prevent strict mode double execution
      if (initializedRef.current) return;
      
      const tour = new ExperienceTour(lang);
      
      // We only start if it hasn't been completed yet (which the class also checks)
      if (!tour.isCompleted()) {
        initializedRef.current = true;
        tourRef.current = tour;
        tour.init();
      }
    }, 1000); // 1s delay to let Pannellum and UI settle

    return () => {
      clearTimeout(timeoutId);
    };
  }, [scene, isReady, lang]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (tourRef.current) {
        tourRef.current.cleanup();
      }
    };
  }, []);
};
