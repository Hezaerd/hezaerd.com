'use client';

import useSWR from "swr";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonIcon } from "@radix-ui/react-icons";


export default function NavbarProfile() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data } = useSWR("https://api.github.com/users/hezaerd", fetcher);

  return (
    <HoverCard>
      <HoverCardTrigger asChild className="hover:cursor-pointer">
        <a href="https://github.com/hezaerd" target="_blank" rel="noopener noreferrer">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">Hezaerd</div>
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://github.com/hezaerd.png" alt="Hezaerd" className="mx-auto" />
              <AvatarFallback>
                <Skeleton className="h-9 w-9 rounded-full" />
              </AvatarFallback>
            </Avatar>
          </div>
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="self-center">
            <Avatar className="h-16 w-16">
              <a href="https://github.com/hezaerd" target="_blank" rel="noopener noreferrer">
                <AvatarImage src="https://github.com/hezaerd.png" alt="Hezaerd" className="mx-auto" />
              </a>
              <AvatarFallback>
                <Skeleton className="h-16 w-16 rounded-full" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-1 items-center">
            <a href="https://github.com/hezaerd" target="_blank" rel="noopener noreferrer">
              <h4 className="text-sm font-semibold">@hezaerd</h4>
            </a>
            <p className="text-sm">
              {data ? data.bio : "Loading..."}
            </p>
            <div className="flex items-center pt-2">
              <PersonIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
                {data ? data.followers : "..."} followers
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}