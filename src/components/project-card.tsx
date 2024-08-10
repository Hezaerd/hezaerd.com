import { cn } from "@/lib/utils";

export interface Project {
  title: string;
  description: string;

  // Optional properties
  header?: React.ReactNode;
  icon?: React.ReactNode;

  // Optional properties
  className?: string;

  // Optional properties
  href?: string;
}

export function ProjectCard({
  title,
  description,
  header,
  icon,
  className,
  href,
}: Project) {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-transparent bg-white p-4 shadow-input transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none",
        className,
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mb-2 mt-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-neutral-600 dark:text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
}
