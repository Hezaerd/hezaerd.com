import { Section } from '@/components/ui/section'
import { BackgroundImage } from '@/components/ui/background-image'

export function Projects() {
    return (
        <Section size="fullscreen" layout="centered" className="overflow-hidden">
            <BackgroundImage src="/images/forest-1.jpg" alt="Moody forest background" />

            <div className="relative z-20 px-6 text-center"></div>
        </Section>
    )
}