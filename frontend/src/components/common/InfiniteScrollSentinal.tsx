import { useEffect, useRef } from 'react';

interface InfiniteScrollSentinelProps {
  onIntersect: () => void;
  enabled: boolean;
}

export const InfiniteScrollSentinel = ({ onIntersect, enabled }: InfiniteScrollSentinelProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return <div ref={ref} aria-hidden="true" className="h-1 w-full" />;
};
