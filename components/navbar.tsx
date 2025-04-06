"use client";

import { Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPanel } from "@/components/notification-panel";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-amber-100 py-4 px-8 flex justify-between items-center">
      <h1 className="text-3xl font-bold text-amber-800">
        {title} <span className="text-amber-600"></span>
      </h1>
      <div className="flex items-center gap-2">
        <NotificationPanel />
        {/* <Button van>riant="outline">Begin</Button */}
        {/* <Button variant="outline" className="px-2">
          {/* <Globe2 size={20} /> */}
        {/* </Button> */}
      </div>
    </header>
  );
} 