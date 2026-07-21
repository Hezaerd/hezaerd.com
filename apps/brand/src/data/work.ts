export type WorkItem = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  role?: string;
  duration?: string;
  releaseUrl?: string;
  previewImage?: string;
  features?: string[];
  technologies?: string[];
};

export const work: WorkItem[] = [
  {
    slug: "yleoture",
    title: "yleoture.com",
    description:
      "SEO optimized landing page for an independant acupuncturist to showcase her services and her practice",
    tags: ["Web", "Next.JS"],
    role: "Developer & Designer",
    duration: "2 days",
    releaseUrl: "https://yleoture.com",
    previewImage: "/images/yleoture.jpg",
    features: ["Responsive design", "SEO optimization", "Performance optimization"],
    technologies: [
      "Next.JS",
      "TailwindCSS",
      "Framer Motion",
      "TypeScript",
      "Shadcn/UI",
      "Vercel",
      "Git",
    ],
  },
];

export function getWork(): readonly WorkItem[] {
  return work;
}

export function getWorkItem(slug: string): WorkItem | undefined {
  return work.find((item) => item.slug === slug);
}
