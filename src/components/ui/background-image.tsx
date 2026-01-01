import type * as React from 'react';
import { useTheme } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';

const THEME_IMAGES = {
  dark: '/images/forest-moody.jpg',
  light: '/images/forest-sunny.jpg',
} as const;

interface BackgroundImageProps extends React.ComponentProps<'div'> {
  alt?: string;
  overlay?: boolean;
  overlayClassName?: string;
  className?: string;
  fixed?: boolean;
  children?: React.ReactNode;
}

export function BackgroundImage({
  alt = 'Background image',
  overlay = true,
  overlayClassName,
  className,
  fixed = false,
  children,
  ...props
}: BackgroundImageProps) {
  const { theme: uiTheme } = useTheme();
  const isDark = uiTheme === 'dark';

  return (
    <div className={cn(fixed ? 'fixed inset-0 z-[-1]' : 'absolute inset-0', 'overflow-hidden', className)} {...props}>
      {/* Color overlay */}
      {overlay && (
        <div
          className={cn(
            'absolute inset-0 z-10 mix-blend-color transition-colors duration-500',
            isDark ? 'bg-primary/30' : 'bg-primary/10',
            overlayClassName,
          )}
        />
      )}

      {/* Gradient overlay for depth */}
      <div
        className={cn(
          'absolute inset-0 z-10 bg-linear-to-t transition-colors duration-500',
          isDark
            ? 'from-background/80 via-background/20 to-transparent'
            : 'from-background/60 via-background/10 to-transparent',
        )}
      />

      {/* Both images rendered - crossfade with opacity */}
      <img
        src={THEME_IMAGES.dark}
        alt={alt}
        className={cn(
          'absolute inset-0 h-full w-full object-cover select-none pointer-events-none',
          'transition-opacity duration-700 ease-in-out',
          'brightness-[0.4] saturate-[1.2]',
          isDark ? 'opacity-100' : 'opacity-0',
        )}
      />
      <img
        src={THEME_IMAGES.light}
        alt={alt}
        className={cn(
          'absolute inset-0 h-full w-full object-cover select-none pointer-events-none',
          'transition-opacity duration-700 ease-in-out',
          'brightness-[0.85] saturate-[1.1]',
          isDark ? 'opacity-0' : 'opacity-100',
        )}
      />

      {children}
    </div>
  );
}
