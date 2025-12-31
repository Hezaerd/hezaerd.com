import { Section } from '@/components/ui/section'
import { BackgroundImage } from '@/components/ui/background-image'

export function Contact() {
    return (
        <Section size="fullscreen" layout="centered" className="overflow-hidden">
            <BackgroundImage src="/images/fern-1.jpg" alt="Moody forest background" />

            <div className="relative z-20 px-6 text-center">
            </div>
        </Section>
    )
}