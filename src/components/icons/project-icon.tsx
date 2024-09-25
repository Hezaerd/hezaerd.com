import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ProjectIcon = ({ src, alt }: { src: string; alt: string }) => (
  <Avatar className="h-9 w-9">
    <AvatarImage src={src} alt={alt} className="mx-auto" />
    <AvatarFallback>
      <Skeleton className="h-9 w-9 rounded-full" />
    </AvatarFallback>
  </Avatar>
);
