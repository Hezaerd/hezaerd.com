"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function BadAppleSecret() {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Congratulations! 🎉",
      description: "You found the bad apple!",
    });
  }, [toast]);

  return (
    <video
      src="videos/bad_apple.mov"
      className="h-full w-full object-cover"
      autoPlay
      loop
      muted
      playsInline
    />
  );
}
