import { motion } from "framer-motion";

const languageColors: { [key: string]: string } = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3776AB",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#CC342D",
  Go: "#00ADD8",
  Rust: "#DEA584",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Shell: "#89E051",
  Vue: "#41B883",
  React: "#61DAFB",
  Svelte: "#FF3E00",
};

interface ProjectLanguageProps {
  language: string;
}

export function ProjectLanguage({ language }: ProjectLanguageProps) {
  const languageColor = language
    ? languageColors[language] || "#6e7681"
    : "#6e7681";

  return (
    <span className="flex items-center gap-1">
      <span
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: languageColor }}
      />
      {language}
    </span>
  );
}
