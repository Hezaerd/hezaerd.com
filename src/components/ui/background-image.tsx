import * as React from 'react'
import { cn } from '@/lib/utils'

interface BackgroundImageProps extends React.ComponentProps<'div'> {
  src: string
  alt?: string
  overlay?: boolean
  overlayClassName?: string
  className?: string
  children?: React.ReactNode
}

export function BackgroundImage({
  src,
  alt = 'Background image',
  overlay = true,
  overlayClassName,
  className,
  children,
  ...props
}: BackgroundImageProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)} {...props}>
      {/* Color overlay for moody forest effect */}
      {overlay && (
        <div
          className={cn('absolute inset-0 z-10 bg-primary/30 mix-blend-color', overlayClassName)}
        />
      )}

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

      {/* Background image */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover brightness-[0.4] saturate-[1.2]"
      />

      {children}
    </div>
  )
}
