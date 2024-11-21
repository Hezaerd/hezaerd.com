"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Apple } from "lucide-react";

export function BadAppleButton() {
  const router = useRouter();

  const handleClick = async () => {
    const response = await fetch("/api/generate-secret");
    const { secret } = await response.json();

    router.push(`/badapple?secret=${secret}`);
  };

  return (
    <Button onClick={handleClick} variant="ghost">
      <Apple className="h-4 w-4" />
    </Button>
  );
}
