import * as React from "react";
import { DiscordLogoIcon, GithubLogoIcon, LinkedinLogoIcon } from "@phosphor-icons/react";

export interface Social {
    platform: string;
    url: string;
    icon: React.ElementType;
}

export const SOCIALS = [
    {
        platform: "linkedin",
        url: "https://www.linkedin.com/in/hezaerd/",
        icon: LinkedinLogoIcon,
    },
    {
        platform: "github",
        url: "https://github.com/hezaerd",
        icon: GithubLogoIcon,
    },
    {
        platform: "discord",
        url: "https://discord.com/users/hezaerd",
        icon: DiscordLogoIcon,
    },
] as const satisfies Array<Social>;