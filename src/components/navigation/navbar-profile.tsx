"use client";

import useSWR from "swr";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RepositoryIcon } from "@/components/icons/repository-icon";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import TickerNumber from "@/components/ui/TickerNumber";

export default function NavbarProfile() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data } = useSWR("https://api.github.com/users/hezaerd", fetcher);

  return (
    <HoverCard>
      <HoverCardTrigger asChild className="hover:cursor-pointer">
        <a
          href="https://github.com/hezaerd"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src="https://github.com/hezaerd.png"
              alt="Hezaerd"
              className="mx-auto"
            />
            <AvatarFallback>
              <Skeleton className="h-9 w-9 rounded-full" />
            </AvatarFallback>
          </Avatar>
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="self-center">
            <GitHubLogoIcon className="h-16 w-16" />
          </div>
          <div className="items-center space-y-1">
            <a
              href="https://github.com/hezaerd"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h4 className="text-sm font-semibold">@hezaerd</h4>
            </a>
            <p className="text-sm">{data ? data.bio : "Loading..."}</p>
            <div className="flex items-center pt-2">
              <a
                href="https://github.com/Hezaerd?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <RepositoryIcon color="#a1a1aa" />
                <span className="text-xs text-muted-foreground">
                  <TickerNumber
                    number={data ? data.public_repos : 0}
                    duration={0}
                    doOnce={true}
                    className="text-xs text-muted-foreground"
                  />{" "}
                  public repositories
                </span>
              </a>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
