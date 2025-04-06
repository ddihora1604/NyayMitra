"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Book, 
  Map, 
  CornerDownRight, 
  Settings, 
  HelpCircle, 
  ChevronRight,
  Activity,
  Command,
  Info,
  RotateCcw
} from "lucide-react";

// Dynamically import React Flow to avoid SSR issues
const Flow = dynamic(() => import("../../Flow.jsx"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 font-medium">Loading flowchart component...</p>
    </div>
  ) 
});
import { categoryStyles, categoryDescriptions } from "../../category.js";

export default function PathwayPage() {
  const [activeTab, setActiveTab] = useState("flowchart");
  const [showFlow, setShowFlow] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("category2");
  const [loading, setLoading] = useState(false);
  const [flowKey, setFlowKey] = useState(0);

  const resources = [
    {
      title: "Legal Textbooks",
      description: "Access foundational legal concepts and principles",
      icon: <Book size={22} className="flex-shrink-0" />,
      link: "#",
    },
    {
      title: "Practice Areas",
      description: "Explore specialized fields of legal practice",
      icon: <Map size={22} className="flex-shrink-0" />,
      link: "#",
    },
    {
      title: "Case Studies",
      description: "Learn from real-world legal precedents and examples",
      icon: <CornerDownRight size={22} className="flex-shrink-0" />,
      link: "#",
    },
  ];

  const handleGenerateClick = () => {
    setLoading(true);
    setShowFlow(false);

    // Simulate data loading/processing
    setTimeout(() => {
      setLoading(false);
      setShowFlow(true);
      setFlowKey(prev => prev + 1);
    }, 2500); // Faster loading for better UX
  };

  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setShowFlow(false);
  };

  const resetFlow = () => {
    setShowFlow(false);
    setTimeout(() => {
      setFlowKey(prev => prev + 1);
      setShowFlow(true);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      {/* <header className="bg-gradient-to-r from-amber-600 to-amber-700 border-b border-amber-500">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Law Pathway
              </h1>
              <p className="mt-2 text-amber-100 max-w-xl">
                Navigate the complex landscape of legal education and career
                pathways
              </p>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setActiveTab("flowchart")}
                className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center whitespace-nowrap min-w-[180px] justify-center"
              >
                <Activity size={16} className="mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">Interactive Flowchart</span>
              </button>
              <button 
                onClick={() => setActiveTab("resources")}
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg shadow-sm transition-colors min-w-[120px] text-sm font-medium whitespace-nowrap"
              >
                Resources
              </button>
            </div>
          </div>
        </div>
      </header> */}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-5 py-3 font-medium whitespace-nowrap text-sm ${
                activeTab === "overview" 
                  ? "text-amber-600 border-b-2 border-amber-600" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("flowchart")}
              className={`px-5 py-3 font-medium whitespace-nowrap text-sm ${
                activeTab === "flowchart" 
                  ? "text-amber-600 border-b-2 border-amber-600" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Interactive Flowchart
            </button>
            <button 
              onClick={() => setActiveTab("resources")}
              className={`px-5 py-3 font-medium whitespace-nowrap text-sm ${
                activeTab === "resources" 
                  ? "text-amber-600 border-b-2 border-amber-600" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Resources
            </button>
            <button 
              onClick={() => setActiveTab("careers")}
              className={`px-5 py-3 font-medium whitespace-nowrap text-sm ${
                activeTab === "careers" 
                  ? "text-amber-600 border-b-2 border-amber-600" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Career Paths
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Legal Career and Education Pathway
              </h2>
              <p className="text-gray-600 mb-4">
                Welcome to the Law Pathway tool, your comprehensive guide to navigating
                legal education, career options, and practical steps for various legal scenarios.
                Use the tabs above to explore different aspects of your legal journey.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div onClick={() => setActiveTab("flowchart")} className="bg-white rounded-xl p-5 shadow-sm border border-amber-100 hover:shadow-md transition-shadow group cursor-pointer h-full">
                  <div className="text-amber-600 mb-3 flex items-center justify-center md:justify-start">
                    <Activity size={22} className="flex-shrink-0" />
                  </div>
                  <h3 className="font-semibold text-base text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">
                    Interactive Flowcharts
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Visualize legal processes and decision paths for various scenarios
                    with our interactive flowchart tool.
                  </p>
                </div>
                <div onClick={() => setActiveTab("resources")} className="bg-white rounded-xl p-5 shadow-sm border border-amber-100 hover:shadow-md transition-shadow group cursor-pointer h-full">
                  <div className="text-amber-600 mb-3 flex items-center justify-center md:justify-start">
                    <Book size={22} className="flex-shrink-0" />
                  </div>
                  <h3 className="font-semibold text-base text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">
                    Legal Resources
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Access foundational legal concepts, textbooks, and learning materials
                    to build your legal knowledge.
                  </p>
                </div>
                <div onClick={() => setActiveTab("careers")} className="bg-white rounded-xl p-5 shadow-sm border border-amber-100 hover:shadow-md transition-shadow group cursor-pointer h-full">
                  <div className="text-amber-600 mb-3 flex items-center justify-center md:justify-start">
                    <Map size={22} className="flex-shrink-0" />
                  </div>
                  <h3 className="font-semibold text-base text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">
                    Career Paths
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Explore various legal career options, from litigation to corporate
                    law, public service, and specialized practice areas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Flowchart Tab */}
          {activeTab === "flowchart" && (
            <>
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Category Selection Sidebar */}
                <div className="lg:w-1/4">
                  <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4 mb-6">
                    <div className="flex items-center mb-4">
                      <Command className="text-amber-600 mr-2" size={18} />
                      <h3 className="text-lg font-semibold">Legal Scenarios</h3>
                    </div>
                    
                    <div className="space-y-2.5">
                      {Object.entries(categoryStyles).map(([cat, { label, base, active }]) => (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className={`w-full px-4 py-2.5 rounded-lg font-medium text-left transition-all duration-200 text-sm flex items-center ${
                            selectedCategory === cat
                              ? cat === "category1" ? "bg-amber-600 text-white" 
                              : cat === "category2" ? "bg-amber-600 text-white"
                              : cat === "category3" ? "bg-amber-600 text-white"
                              : cat === "category4" ? "bg-amber-600 text-white"
                              : "bg-amber-600 text-white"
                              : base.replace(/blue/g, 'amber')
                          }`}
                        >
                          <span className="truncate">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4 mb-6">
                    <div className="flex items-center mb-3">
                      <Info className="text-amber-600 mr-2" size={16} />
                      <h3 className="text-sm font-semibold">Description</h3>
                    </div>
                    <p className="text-sm text-gray-700 p-2 bg-amber-50 rounded border border-amber-200">
                      {categoryDescriptions[selectedCategory]}
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateClick}
                    disabled={loading}
                    className="w-full bg-amber-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm hover:bg-amber-700 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mb-3 h-11"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0"></div>
                        <span className="text-sm whitespace-nowrap">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Activity size={18} className="mr-2 flex-shrink-0" />
                        <span className="text-sm whitespace-nowrap">Generate Flowchart</span>
                      </>
                    )}
                  </button>

                  {showFlow && (
                    <button
                      onClick={resetFlow}
                      className="w-full border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-amber-50 transition duration-200 flex items-center justify-center h-10 text-sm"
                    >
                      <RotateCcw size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                      <span className="whitespace-nowrap">Reset</span>
                    </button>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="lg:w-3/4">
                  <div className="bg-white rounded-lg shadow-sm border border-amber-100 overflow-hidden">
                    <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                      <div className="text-lg font-medium text-gray-800">
                        {selectedCategory && categoryStyles[selectedCategory]?.label} Flow
                      </div>
                      {showFlow && (
                        <div className="text-xs bg-amber-50 text-gray-600 px-3 py-1.5 rounded flex items-center whitespace-nowrap">
                          <Info size={12} className="mr-1.5 flex-shrink-0" />
                          Drag to reposition • Scroll to zoom
                        </div>
                      )}
                    </div>
                    
                    <div className="h-[600px] relative">
                      {loading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
                          <p className="text-gray-600 font-medium">
                            Generating your flowchart...
                          </p>
                          <p className="text-gray-500 text-sm mt-2">
                            This may take a moment
                          </p>
                        </div>
                      ) : !showFlow ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gray-50">
                          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                            <Activity size={42} className="text-amber-500" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-700 mb-2">
                            No Flowchart Generated Yet
                          </h3>
                          <p className="text-gray-500 max-w-md">
                            Select a category and click &quot;Generate
                            Flowchart&quot; to visualize the process flow
                          </p>
                        </div>
                      ) : (
                        <div className="h-full" key={flowKey}>
                          <Flow
                            selectedCategory={selectedCategory}
                          />
                        </div>
                      )}
                    </div>

                    {showFlow && (
                      <div className="border-t border-gray-200 p-4">
                        <div className="flex items-center mb-2">
                          <Command className="text-amber-600 mr-2" size={16} />
                          <h3 className="text-base font-medium">Flow Categories</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium whitespace-nowrap">
                            Rent Maintainance Issue
                          </div>
                          <div className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium whitespace-nowrap">
                            Corporate Threat
                          </div>
                          <div className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium whitespace-nowrap">
                            Wrong Accusation
                          </div>
                          <div className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium whitespace-nowrap">
                            Divorce
                          </div>
                          <div className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium whitespace-nowrap">
                            Non-consensual Disclosure
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                  <Book size={22} className="mr-2 text-amber-600" />
                  Legal Resources
                </h2>
                <p className="text-gray-600 mb-4">
                  Access comprehensive legal resources to support your understanding of
                  legal concepts, principles, and practical applications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.link}
                    className="bg-white rounded-xl p-5 shadow-sm border border-amber-100 hover:shadow-md transition-shadow group h-full"
                  >
                    <div className="text-amber-600 mb-3 flex items-center">
                      <span className="flex-shrink-0">
                        {resource.icon}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {resource.description}
                    </p>
                  </a>
                ))}
              </div>
            </>
          )}

          {/* Career Paths Tab */}
          {activeTab === "careers" && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Legal Career Pathways
                </h2>
                <p className="text-gray-600 mb-4">
                  Explore diverse career options in the legal field, from traditional practice to
                  specialized and emerging areas of law.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                  <h3 className="text-xl font-bold text-amber-800 mb-4">Traditional Legal Practice</h3>
                  <ul className="space-y-3">
                    <li className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-amber-700 text-sm">Litigation</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Represent clients in civil and criminal court proceedings.
                      </p>
                    </li>
                    <li className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-amber-700 text-sm">Corporate Law</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Advise businesses on legal rights and responsibilities.
                      </p>
                    </li>
                    <li className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-amber-700 text-sm">Family Law</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Handle legal matters related to family relationships.
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                  <h3 className="text-xl font-bold text-amber-800 mb-4">Specialized Areas</h3>
                  <ul className="space-y-3">
                    <li className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-amber-700 text-sm">Intellectual Property</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Protect creations of the mind and intellectual assets.
                      </p>
                    </li>
                    <li className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-amber-700 text-sm">Environmental Law</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Address legal issues related to environmental protection.
                      </p>
                    </li>
                    <li className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-amber-700 text-sm">Healthcare Law</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Navigate regulations governing healthcare providers.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-white text-xl font-bold mb-2">Law Pathway</h2>
              <p className="text-gray-400 text-sm">
                Your guide to navigating legal education and career paths
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm py-1 px-2 whitespace-nowrap">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm py-1 px-2 whitespace-nowrap">Contact</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm py-1 px-2 whitespace-nowrap">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm py-1 px-2 whitespace-nowrap">Terms</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Law Pathway. All rights reserved.
          </div>
        </div>
      </footer> */}
    </div>
  );
} 