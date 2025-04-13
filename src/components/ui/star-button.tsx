"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Star, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function StarButton() {
  const pathname = usePathname();
  const router = useRouter();
  const isStargazePage = pathname === "/stargaze";
  const [previousPath, setPreviousPath] = useState("/");

  useEffect(() => {
    // Only update previousPath when not on stargaze page
    if (!isStargazePage) {
      setPreviousPath(pathname);
    }
  }, [pathname, isStargazePage]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isStargazePage) {
      router.push(previousPath);
    } else {
      router.push("/stargaze");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Button
        variant="outline"
        size="icon"
        className="rounded-full border-2 bg-background/20 backdrop-blur-sm hover:bg-accent/20"
        onClick={handleClick}
      >
        {isStargazePage ? (
          <ArrowLeft className="h-4 w-4" />
        ) : (
          <Star className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isStargazePage ? "Go back" : "Go to stargaze page"}
        </span>
      </Button>
    </motion.div>
  );
}