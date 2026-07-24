import { useEffect, useState } from "react";

import { isSectionId, type SectionId } from "@/lib/navigation";

const SCROLLSPY_ROOT_MARGIN = "-20% 0px -70% 0px";

export function useActiveSection(defaultSection: SectionId): SectionId {
  const [activeSection, setActiveSection] = useState<SectionId>(defaultSection);

  useEffect(() => {
    const visible = new Map<SectionId, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!isSectionId(id)) continue;

          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRect.height);
          } else {
            visible.delete(id);
          }
        }

        if (visible.size === 0) return;

        let next = defaultSection;
        let bestHeight = -1;
        for (const [id, height] of visible) {
          if (height >= bestHeight) {
            bestHeight = height;
            next = id;
          }
        }
        setActiveSection(next);
      },
      {
        root: null,
        rootMargin: SCROLLSPY_ROOT_MARGIN,
        threshold: 0,
      },
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [defaultSection]);

  return activeSection;
}
