"use client";

import { motion } from "framer-motion";
import { Github, Twitter } from "lucide-react";

const socials = [
  {
    name: "Github",
    url: "https://github.com/hezaerd",
    icon: Github,
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
    <footer className="flex h-24 w-full flex-col items-center justify-center border-t">
      <div className="flex flex-col items-center gap-2">
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
        <div className="text-primary/50">
          <a>© Hezaerd {date}</a>
        </div>
      </div>
    </footer>
  );
};
