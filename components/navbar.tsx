"use client";

import { Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPanel } from "@/components/notification-panel";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 py-4 px-8 flex justify-between items-center shadow-sm">
      <h1 className="text-2xl font-bold text-amber-600">
        {title} <span className="text-amber-500"></span>
      </h1>
      <div className="flex items-center gap-3">
        <NotificationPanel />
        <Button variant="outline" className="border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-600 rounded-xl px-3 py-2 transition-all">
          <Globe2 size={20} />
        </Button>
      </div>
    </header>
  );
} 