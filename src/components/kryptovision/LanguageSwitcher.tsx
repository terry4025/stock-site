"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";
import { Languages } from "lucide-react";
import { useEffect } from "react";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative overflow-hidden group border-2 border-slate-600/50 bg-slate-800/30 backdrop-blur-sm text-slate-200 hover:border-orange-400 hover:text-white transition-all duration-500 shadow-lg hover:shadow-orange-500/30 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/30 group-hover:to-orange-500/10 transition-all duration-500"></div>
          <Languages className="h-[1.2rem] w-[1.2rem] relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
          <span className="sr-only">{t('toggle_language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-800/95 backdrop-blur-md border-2 border-slate-600/50 shadow-2xl rounded-xl p-1">
        <DropdownMenuItem 
          onClick={() => setLanguage("en")} 
          className="text-slate-200 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-orange-400/20 hover:text-white transition-all duration-300 rounded-lg font-medium border border-transparent hover:border-orange-400/30"
        >
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("kr")} 
          className="text-slate-200 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-orange-400/20 hover:text-white transition-all duration-300 rounded-lg font-medium border border-transparent hover:border-orange-400/30"
        >
          🇰🇷 한국어
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
