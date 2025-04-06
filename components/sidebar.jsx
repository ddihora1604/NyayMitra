"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  FileBarChart2, 
  ScrollText, 
  MapPin, 
  Route, 
  MessageSquareText, 
  Newspaper, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Github, 
  Linkedin, 
  Mail, 
  Briefcase 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

// New color scheme variables
const colors = {
  primary: "text-amber-500",
  primaryHover: "hover:text-amber-600",
  primaryBg: "bg-amber-50",
  primaryBgHover: "hover:bg-amber-50",
  primaryBgActive: "bg-amber-100",
  primaryBorder: "border-amber-200",
  accent: "text-amber-500",
  accentBg: "bg-amber-500",
  profileBg: "bg-amber-100",
  profileText: "text-amber-600",
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Update document CSS variable for the main content margin
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      isCollapsed ? '5rem' : '16rem'
    );
  }, [isCollapsed]);

  return (
    <>
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white/95 backdrop-blur-xl border-r border-amber-100 shadow-sm flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Main content container with flex to ensure proper spacing */}
        <div className="flex flex-col h-full p-4 pt-1">
          {/* Logo section with more precise positioning */}
          <div className="flex justify-center items-center w-full mb-6">
            <div className={cn(
              "flex justify-center items-center transition-all duration-300 ease-in-out transform-gpu",
              isCollapsed ? "w-full" : "w-full"
            )}>
              <Image 
                src="/Logo.png" 
                alt="Law4All Logo" 
                width={isCollapsed ? 40 : 140} 
                height={isCollapsed ? 40 : 40} 
                className="h-auto object-contain transition-all duration-300 ease-in-out"
                priority
              />
            </div>
          </div>
          
          {/* Navigation sections with consistent spacing */}
          {/* Primary navigation */}
          <div className="mb-4">
            <nav className="space-y-1">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-amber-500 bg-amber-50 rounded-xl">
                <LayoutDashboard size={20} className="flex-shrink-0" />
                <span className={cn(
                  "transform-gpu transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap text-[15px] font-medium",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}>
                  Dashboard
                </span>
              </Link>
              <Link href="/legal-assistance" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-amber-50 hover:text-amber-500 rounded-xl transition-all">
                <Briefcase size={20} className="flex-shrink-0" />
                <span className={cn(
                  "transform-gpu transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap text-[15px] font-medium", 
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}>
                  Legal Assistance
                </span>
              </Link>
              <Link href="/contracts-draft" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-amber-50 hover:text-amber-500 rounded-xl transition-all">
                <ScrollText size={20} className="flex-shrink-0" />
                <span className={cn(
                  "transform-gpu transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap text-[15px] font-medium", 
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}>
                  Contracts Draft
                </span>
              </Link>
            </nav>
          </div>

          {/* Law section */}
          <div className="mb-4">
            <nav className="space-y-1">
              {[
                { icon: Route, label: "Pathway" },
                { icon: MessageSquareText, label: "Chatbot", href: "/chatbot" },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href || "#"}
                  className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-amber-50 hover:text-amber-500 rounded-xl transition-all"
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className={cn(
                    "transform-gpu transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap text-[15px] font-medium",
                    isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  )}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User section */}
          <div className="mb-4">
            <nav className="space-y-1">
              {[
                { icon: Newspaper, label: "News & Insights", href: "/news-insights" },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-amber-50 hover:text-amber-500 rounded-xl transition-all"
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className={cn(
                    "transform-gpu transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap text-[15px] font-medium",
                    isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  )}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Spacer to push toggle and profile to bottom */}
          <div className="flex-grow"></div>
          
          {/* Toggle button centered above profile */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-500 transition-all duration-300"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className="relative w-[18px] h-[18px]">
                <ChevronLeft 
                  size={18} 
                  className={cn(
                    "absolute inset-0 transition-all duration-300 transform-gpu",
                    isCollapsed ? "opacity-0 rotate-180" : "opacity-100 rotate-0"
                  )} 
                />
                <ChevronRight 
                  size={18} 
                  className={cn(
                    "absolute inset-0 transition-all duration-300 transform-gpu",
                    isCollapsed ? "opacity-100 rotate-0" : "opacity-0 rotate-180"
                  )} 
                />
              </div>
            </button>
          </div>

          {/* Simplified profile section */}
          <div>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-full rounded-xl hover:bg-amber-50 transition-all flex items-center py-1.5 px-2"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 font-medium flex-shrink-0 border border-amber-200 overflow-hidden">
                <span className="text-sm">DD</span>
              </div>
              <div className={cn(
                "text-left overflow-hidden transition-all duration-300 ease-in-out transform-gpu flex-grow whitespace-nowrap", 
                isCollapsed ? "opacity-0 w-0 max-w-0" : "opacity-100 w-auto max-w-[150px] ml-2.5"
              )}>
                <div className="font-medium text-sm text-gray-800 truncate">Darshan Dihora</div>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Profile Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 z-50 h-screen bg-white shadow-xl w-80 transform transition-transform duration-300 ease-in-out",
          isProfileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Back button for profile */}
          <button 
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center gap-2 text-amber-500 hover:text-amber-600 mb-5 group"
          >
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <ChevronLeft size={18} className="flex-shrink-0" />
            </div>
            <span className="text-sm font-medium">Darshan Dihora</span>
          </button>

          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 text-2xl font-bold mb-3 border-2 border-amber-200 overflow-hidden">
              <span>DD</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Darshan Dihora</h3>
            <p className="text-amber-500">Legal Associate</p>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto">
            <div>
              <h4 className="text-sm font-medium text-amber-500 uppercase">About</h4>
              <p className="mt-2 text-gray-700">
                Experienced legal professional specializing in constitutional law and human rights advocacy with 5+ years of experience in the field.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-amber-500 uppercase">Contact</h4>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail size={16} className="text-amber-500" />
                  <span>darshan.dihora@example.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Briefcase size={16} className="text-amber-500" />
                  <span>NyayMitra Legal Solutions</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-amber-500 uppercase">Expertise</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">Constitutional Law</span>
                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">Human Rights</span>
                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">Legal Research</span>
                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">Case Management</span>
                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">Legal Writing</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-amber-500 uppercase">Social</h4>
              <div className="mt-2 flex gap-3">
                <a href="#" className="p-2 bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition-colors">
                  <Linkedin size={18} />
                </a>
                <a href="#" className="p-2 bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition-colors">
                  <Github size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 bg-amber-900/10 z-40 backdrop-blur-sm"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
} 