'use client';

import { useEffect, useState } from 'react';

interface UseScrolledOptions {
  threshold?: number;
}

export function useScrolled({ threshold = 50 }: UseScrolledOptions = {}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}
