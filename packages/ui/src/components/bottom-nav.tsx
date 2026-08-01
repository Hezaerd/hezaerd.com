"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@hezaerd/ui/lib/utils";
import { cva } from "class-variance-authority";
import * as React from "react";

/** Matches `BottomNav` bar height (`h-14`) for main content padding. */
export const BOTTOM_NAV_HEIGHT = "3.5rem";

const bottomNavItemVariants = cva(
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] leading-none font-medium transition-colors",
  {
    variants: {
      active: {
        true: "text-foreground",
        false: "text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

function BottomNav({ className, children, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="bottom-nav"
      className={cn(
        "border-border bg-background fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)]",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch">{children}</div>
    </nav>
  );
}

function BottomNavItem({
  render,
  isActive = false,
  icon,
  label,
  className,
  ...props
}: useRender.ComponentProps<"a"> &
  React.ComponentProps<"a"> & {
    isActive?: boolean;
    icon?: React.ReactNode;
    label: string;
  }) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(bottomNavItemVariants({ active: isActive }), className),
        "aria-current": isActive ? ("page" as const) : undefined,
        children: (
          <>
            {icon ? (
              <span className="flex shrink-0 items-center justify-center [&_svg]:size-5">
                {icon}
              </span>
            ) : null}
            <span className="max-w-full truncate">{label}</span>
          </>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "bottom-nav-item",
      active: isActive,
    },
  });
}

export { BottomNav, BottomNavItem };
