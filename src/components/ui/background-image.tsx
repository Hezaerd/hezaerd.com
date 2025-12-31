import type * as React from 'react';
import { useTheme } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';

export type BackgroundTheme = 'moody-forest' | 'sunny-forest';

const THEME_IMAGES: Record<BackgroundTheme, string> = {
  'moody-forest': '/images/forest-moody.jpg',
  'sunny-forest': '/images/forest-sunny.jpg',
};

interface BackgroundImageProps extends React.ComponentProps<'div'> {
  src?: string;
  theme?: BackgroundTheme;
  alt?: string;
  overlay?: boolean;
  overlayClassName?: string;
  className?: string;
  fixed?: boolean;
  children?: React.ReactNode;
}

export function BackgroundImage({
  src,
  theme,
  alt = 'Background image',
  overlay = true,
  overlayClassName,
  className,
  fixed = false,
  children,
  ...props
}: BackgroundImageProps) {
  const { theme: uiTheme } = useTheme();

  // Use theme image if provided, otherwise fall back to src
  const imageSrc = theme ? THEME_IMAGES[theme] : src;

  if (!imageSrc) {
    console.warn('BackgroundImage: No src or theme provided');
    return null;
  }

  // Adjust image styling based on UI theme
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

      {/* Background image */}
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'absolute inset-0 h-full w-full object-cover select-none pointer-events-none transition-all duration-500',
          isDark ? 'brightness-[0.4] saturate-[1.2]' : 'brightness-[0.85] saturate-[1.1]',
        )}
      />

      {children}
    </div>
  );
}
