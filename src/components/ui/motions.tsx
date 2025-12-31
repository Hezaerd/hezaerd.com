'use client'

import { motion } from 'motion/react'
import type * as React from 'react'
import { cn } from '@/lib/utils'

// Animation variants
export const fadeInUpVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

// FadeIn component - fades in with upward motion
interface FadeInProps extends React.ComponentProps<typeof motion.div> {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeIn({ children, className, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// StaggerContainer - staggers children animations
interface StaggerContainerProps extends React.ComponentProps<typeof motion.div> {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.15,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// StaggerItem - child of StaggerContainer
interface StaggerItemProps extends React.ComponentProps<typeof motion.div> {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <motion.div variants={fadeInUpVariants} className={cn(className)} {...props}>
      {children}
    </motion.div>
  )
}

// Export motion for direct use
export { motion }
