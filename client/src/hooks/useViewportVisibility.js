import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect if an element is visible in the viewport
 * Used for viewport-based rendering optimization
 * 
 * @param {Object} options - IntersectionObserver options
 * @returns {Array} [ref, isVisible] - Ref to attach to element and visibility state
 */
export const useViewportVisibility = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options]);

  return [elementRef, isVisible];
};
