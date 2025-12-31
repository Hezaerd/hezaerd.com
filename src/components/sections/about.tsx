import { BriefcaseIcon, CodeIcon, EnvelopeIcon, GraduationCapIcon, MapPinIcon } from '@phosphor-icons/react';
import { StatItem, TimelineItem } from '@/components/about';
import { BackgroundImage } from '@/components/ui/background-image';
import { StaggerContainer, StaggerItem } from '@/components/ui/motions';
import { Section } from '@/components/ui/section';
import { EDUCATION, EXPERIENCE, ME, SKILLS, SOCIALS } from '@/data';

export function About() {
  return (
    <Section size="fullscreen" layout="centered" className="overflow-hidden">
      <BackgroundImage src="/images/fern-1.jpg" alt="Fern background" overlayClassName="bg-primary/20" />

      <div className="relative z-20 container mx-auto px-6">
        <StaggerContainer className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <StaggerItem className="lg:col-span-7">
            <div className="glass rounded-2xl p-8 h-full">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">About Me</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">{ME.bio}</p>

              {/* Location & Contact */}
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-primary" />
                  <span>{ME.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-primary" />
                  <a href={`mailto:${ME.email}`} className="hover:text-primary transition-colors">
                    {ME.email}
                  </a>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="lg:col-span-5">
            <div className="glass rounded-2xl p-8 h-full flex flex-col justify-center items-center">
              <h3 className="text-xl font-bold mb-6">Let's Connect</h3>
              <div className="flex gap-4">
                {SOCIALS.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-moss p-4 rounded-xl hover:scale-110 transition-all duration-300"
                  >
                    <social.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="lg:col-span-12">
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <CodeIcon className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-bold">Tech Stack</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {SKILLS.map((skill) => (
                  <span key={skill} className="glass-moss px-4 py-2 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="lg:col-span-6">
            <div className="glass rounded-2xl p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCapIcon className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-bold">Education</h3>
              </div>
              <div className="space-y-6">
                {EDUCATION.map((edu) => (
                  <TimelineItem
                    key={edu.degree}
                    title={edu.degree}
                    subtitle={edu.school}
                    period={edu.period}
                    description={edu.description}
                  />
                ))}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="lg:col-span-6">
            <div className="glass rounded-2xl p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <BriefcaseIcon className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-bold">Experience</h3>
              </div>
              <div className="space-y-6">
                {EXPERIENCE.map((exp) => (
                  <TimelineItem
                    key={exp.title}
                    title={exp.title}
                    subtitle={exp.company}
                    period={exp.period}
                    description={exp.description}
                  />
                ))}
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </Section>
  );
}
