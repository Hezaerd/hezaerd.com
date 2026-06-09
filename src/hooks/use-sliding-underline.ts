import type { SectionId } from "@/lib/navigation";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

type UnderlineStyle = {
  left: number;
  width: number;
};

export function useSlidingUnderline(activeId: SectionId) {
  const navListRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Partial<Record<SectionId, HTMLButtonElement>>>({});
  const [underline, setUnderline] = useState<UnderlineStyle>({ left: 0, width: 0 });

  const updateUnderline = useCallback(() => {
    const navList = navListRef.current;
    const activeItem = itemRefs.current[activeId];
    if (!navList || !activeItem) return;

    const navListRect = navList.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();

    setUnderline({
      left: activeRect.left - navListRect.left,
      width: activeRect.width,
    });
  }, [activeId]);

  const setItemRef = useCallback(
    (id: SectionId) => (el: HTMLButtonElement | null) => {
      if (el) {
        itemRefs.current[id] = el;
      }
    },
    [],
  );

  useLayoutEffect(() => {
    updateUnderline();

    const navList = navListRef.current;
    if (!navList) return;

    const resizeObserver = new ResizeObserver(updateUnderline);
    resizeObserver.observe(navList);

    window.addEventListener("resize", updateUnderline);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateUnderline);
    };
  }, [updateUnderline]);

  return { navListRef, setItemRef, underline };
}
