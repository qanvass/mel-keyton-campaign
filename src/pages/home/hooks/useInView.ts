
import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  /** Intersection threshold (0‑1). Defaults to 0.1 */
  threshold?: number;
  /** Root margin for the observer. Defaults to '0px' */
  rootMargin?: string;
}

/**
 * Hook that reports whether the attached element is currently visible
 * in the viewport using the IntersectionObserver API.
 *
 * @param options Configuration for the observer. If omitted, defaults are used.
 * @returns An object containing the `ref` to attach to the target element
 *          and a boolean `isInView` that reflects its visibility.
 */
export function useInView(
  options: UseInViewOptions = {}
): { ref: React.RefObject<HTMLElement>; isInView: boolean } {
  const { threshold = 0.1, rootMargin = '0px' } = options;

  // Ref that will be attached to the DOM element we want to observe
  const ref = useRef<HTMLElement>(null);

  // State that tracks visibility
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    // If the ref hasn't been attached yet, there's nothing to observe.
    if (!element) {
      return;
    }

    // Guard against browsers that don't support IntersectionObserver
    if (typeof IntersectionObserver === 'undefined') {
      // Assume element is in view if we cannot observe it.
      setIsInView(true);
      return;
    }

    // Create observer with proper options
    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry can be undefined in rare edge‑cases, guard against it.
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { threshold, rootMargin }
    );

    // Start observing the element
    observer.observe(element);

    // Cleanup observer on unmount or when options change
    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
    // Re‑run effect only when observer options change
  }, [threshold, rootMargin]);

  return { ref, isInView };
}
