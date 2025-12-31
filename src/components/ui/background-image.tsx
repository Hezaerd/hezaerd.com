import type * as React from 'react';
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
  // Use theme image if provided, otherwise fall back to src
  const imageSrc = theme ? THEME_IMAGES[theme] : src;

  if (!imageSrc) {
    console.warn('BackgroundImage: No src or theme provided');
    return null;
  }

  return (
    <div className={cn(fixed ? 'fixed inset-0 z-[-1]' : 'absolute inset-0', 'overflow-hidden', className)} {...props}>
      {/* Color overlay for moody forest effect */}
      {overlay && <div className={cn('absolute inset-0 z-10 bg-primary/30 mix-blend-color', overlayClassName)} />}

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 z-10 bg-linear-to-t from-background/80 via-background/20 to-transparent" />

      {/* Background image */}
      <img
        src={imageSrc}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover brightness-[0.4] saturate-[1.2] select-none pointer-events-none"
      />

      {children}
    </div>
  );
}
