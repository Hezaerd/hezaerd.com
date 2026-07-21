export const navigation = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "resume", label: "Resume" },
] as const satisfies readonly { id: string; label: string }[];

export type SectionId = (typeof navigation)[number]["id"];

export const DEFAULT_SECTION: SectionId = "home";

export function sectionHref(id: SectionId): `#${SectionId}` {
  return `#${id}`;
}

export function isSectionId(value: string): value is SectionId {
  return navigation.some((item) => item.id === value);
}

export function scrollToSection(id: SectionId) {
  document.querySelector(sectionHref(id))?.scrollIntoView({ behavior: "smooth" });
}
