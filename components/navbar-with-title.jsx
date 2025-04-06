"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from "@/components/navbar";

export function NavbarWithTitle() {
  const pathname = usePathname();
  let title = "NyayMitra";
  
  // Map routes to titles
  if (pathname === '/dashboard') title = "Dashboard";
  else if (pathname === '/news-insights') title = "News & Insights";
  else if (pathname === '/document-analyzer') title = "Document Analyzer";
  else if (pathname === '/case-status') title = "Case Status";
  else if (pathname === '/contracts-draft') title = "Contracts Draft";
  else if (pathname === '/legal-assistance') title = "Legal Assistance";
  else if (pathname === '/chatbot') title = "Chatbot";
  else if (pathname === '/find-lawyer') title = "Find Lawyer";
  else if (pathname === '/pathway') title = "Pathway";
  
  return <Navbar title={title} />;
} 