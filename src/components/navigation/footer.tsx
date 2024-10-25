"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

const socials = [
  {
    name: "Github",
    url: "https://github.com/hezaerd",
    icon: Github,
  },
  {
    name: "Linkedin",
    url: "https://www.linkedin.com/in/swann-rouanet",
    icon: Linkedin,
  },
  {
    name: "Twitter",
    url: "https://twitter.com/hezaerd2",
    icon: Twitter,
  },
];

export const Footer = () => {
  const date = new Date().getFullYear();

  return (
    <footer className="bg-primary-700 flex h-24 w-full flex-col items-center justify-center border-t">
      <div className="flex space-x-4">
        {socials.map((social) => (
          <motion.a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-primary/50 hover:text-primary"
          >
            <social.icon size={24} aria-label={social.name} />
          </motion.a>
        ))}
      </div>
      <div className="mt-2 text-primary/50">
        <a>© Hezaerd {date}</a>
      </div>
    </footer>
  );
};
