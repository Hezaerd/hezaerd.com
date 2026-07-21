export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  tags: readonly string[];
  /** Commercial showcase on the brand site */
  featuredOnBrand: boolean;
  /** Full case study lives on the portfolio site */
  portfolioPath: string;
  brandCanonicalPath?: string;
};

export const caseStudies = [
  {
    slug: "high-performance-tooling",
    title: "High-performance tooling",
    summary:
      "Performance-focused software for developers and creators — engines, tooling, and full-stack systems.",
    role: "Software engineer",
    tags: ["TypeScript", "Systems", "Tooling"],
    featuredOnBrand: true,
    portfolioPath: "/#projects",
    brandCanonicalPath: "/work/high-performance-tooling",
  },
  {
    slug: "game-systems",
    title: "Game systems & modding",
    summary:
      "Game development tools and Minecraft modding work spanning engines, gameplay systems, and tooling.",
    role: "Game developer",
    tags: ["Game engines", "Modding"],
    featuredOnBrand: true,
    portfolioPath: "/#projects",
    brandCanonicalPath: "/work/game-systems",
  },
] as const satisfies readonly CaseStudy[];

export function getBrandCaseStudies(): readonly CaseStudy[] {
  return caseStudies.filter((study) => study.featuredOnBrand);
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
