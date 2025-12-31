import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';

const sectionVariants = cva('relative w-full', {
  variants: {
    size: {
      default: 'py-16 md:py-24',
      sm: 'py-8 md:py-12',
      lg: 'py-24 md:py-32',
      fullscreen: 'min-h-screen',
    },
    layout: {
      default: '',
      centered: 'flex flex-col items-center justify-center',
      start: 'flex flex-col items-center justify-start',
    },
  },
  defaultVariants: {
    size: 'default',
    layout: 'default',
  },
})

interface SectionProps
  extends React.ComponentProps<'section'>, VariantProps<typeof sectionVariants> {
  className?: string
  children: React.ReactNode
}

export function Section({ className, children, size, layout, ...props }: SectionProps) {
  return (
    <section className={cn(sectionVariants({ size, layout }), className)} {...props}>
      {children}
    </section>
  )
}
