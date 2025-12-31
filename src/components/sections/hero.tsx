import { Section } from '@/components/ui/section'
import { BackgroundImage } from '@/components/ui/background-image'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motions'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { ME } from '@/data/me'

export function Hero() {
  return (
    <Section size="fullscreen" layout="centered" className="overflow-hidden">
      {/* Background */}
      <BackgroundImage src="/images/forest-1.jpg" alt="Moody forest background" />

      {/* Content */}
      <div className="relative z-20 px-6 text-center">
        <StaggerContainer className="flex flex-col items-center gap-6">
          {/* Name */}
          <StaggerItem>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">{ME.name}</h1>
          </StaggerItem>

          {/* Tagline */}
          <StaggerItem>
            <p className="text-lg md:text-xl text-muted-foreground font-sans max-w-md">
              {ME.role}
            </p>
          </StaggerItem>

          {/* CTA */}
          <StaggerItem>
            <FadeIn delay={0.4}>
              <Button
                size="lg"
                className="mt-4 glass-moss hover:scale-105 transition-transform duration-300"
              >
                View My Work
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </FadeIn>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </Section>
  )
}
