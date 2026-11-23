import { site } from "./site.ts";

export function homeMarkdown(): string {
  return [
    `# ${site.name}`,
    "",
    site.role,
    "",
    site.tagline,
    "",
    "## About",
    "",
    site.locationLine,
    "",
    site.about,
    "",
    ...site.stack.map(({ label, items }) => `- ${label}: ${items.join(", ")}`),
    "",
    "## Contact",
    "",
    `[${site.email}](mailto:${site.email})`,
    "",
    ...site.links.map(({ label, href }) => `- [${label}](${href})`),
    "",
  ].join("\n");
}
