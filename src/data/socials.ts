import { Github } from "lucide-react";
import type { ElementType } from "react";
import { FaDiscord, FaSpotify } from "react-icons/fa";

export interface Social {
	name: string;
	url: string;
	icon: ElementType;
}

export const socials: Social[] = [
	{
		name: "Github",
		url: "https://github.com/hezaerd",
		icon: Github,
	},
	{
		name: "Discord",
		url: "https://discord.com/users/225942632050720768",
		icon: FaDiscord,
	},
	{
		name: "Spotify",
		url: "https://open.spotify.com/user/31pzfqspsr5e4rwe3vwbs2wudeki",
		icon: FaSpotify,
	},
];
