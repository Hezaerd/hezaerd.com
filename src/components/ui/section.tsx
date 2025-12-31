import * as React from 'react';
import { cn } from "@/lib/utils";

interface SectionProps extends React.ComponentProps<'section'> {
  className?: string;
  children: React.ReactNode;
}

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section className={cn('section', className)} {...props} {...props}>
      {children}
    </section>
  )
}