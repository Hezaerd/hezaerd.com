export const site = {
  url: "https://portfolio.hezaerd.com",
  name: "Hezaerd",
  title: "Hezaerd — Personal portfolio",
  description:
    "Personal archive of projects, experiments, résumé, and creative work by Hezaerd.",
  keywords: "software engineer,game developer,game engine,full stack,minecraft modding",
  ogImagePath: "/og-image.png",
  authorUrl: "https://hezaerd.com",
  locale: "en_US",
} as const;

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${site.url}${normalized === "/" ? "" : normalized}` || site.url;
}

export function absoluteOgImage(path?: string): string {
  return absoluteUrl(path ?? site.ogImagePath);
}
