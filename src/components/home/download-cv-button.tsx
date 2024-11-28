"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
] as const;

type Language = (typeof LANGUAGES)[number]["code"];

export function DownloadCVButton() {
  const defaultLang = useLang();
  const [selectedLang, setSelectedLang] = useState<Language>(
    defaultLang as Language,
  );

  const handleDownload = (lang: Language) => {
    setSelectedLang(lang);
    const cvUrl = `/cv/cv_${lang}.pdf`;
    window.open(cvUrl, "_blank");
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        <Button
          variant="outline"
          className="relative z-10 flex items-center gap-2 rounded-r-none border-r text-primary"
          onClick={() => handleDownload(selectedLang)}
        >
          <Download className="h-4 w-4" />
          Get my resume
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="z-10 rounded-l-none">
            <Button
              variant="outline"
              className="rounded-l-none px-2 text-primary"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {LANGUAGES.map(({ code, label }) => (
              <DropdownMenuItem
                key={code}
                onClick={() => handleDownload(code)}
                className="cursor-pointer"
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
