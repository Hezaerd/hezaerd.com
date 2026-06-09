import type { SectionId } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type SectionProps = {
    id: SectionId;
    children: React.ReactNode;
    className?: string;
};

export function Section({ id, children, className }: SectionProps) {
    return (
        <section id={id} className={cn("scroll-mt-16", className)}>
            {children}
        </section>
    );
}