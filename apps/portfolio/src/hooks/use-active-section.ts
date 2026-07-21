import { useEffect, useState } from "react";

import { isSectionId, type SectionId } from "@/lib/navigation";

export function useActiveSection(defaultSection: SectionId): SectionId {
  const [activeSection, setActiveSection] = useState<SectionId>(defaultSection);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && isSectionId(entry.target.id)) {
            setActiveSection(entry.target.id);
          }
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1,
      },
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return activeSection;
}
