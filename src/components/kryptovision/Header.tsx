"use client";

import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { BarChart3, TrendingUp, Activity } from "lucide-react";

export default function Header() {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-slate-900/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-3 font-semibold">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            학썜의리딩방
          </span>
          <span className="text-xs text-slate-400 -mt-1">
            AI 투자 분석 플랫폼
          </span>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
