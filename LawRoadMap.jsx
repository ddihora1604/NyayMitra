import React from "react";
import Flow from "./Flow.jsx";
import {
  Book,
  Map,
  CornerDownRight,
  Settings,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

const LawRoadMap = () => {
  const resources = [
    {
      title: "Legal Textbooks",
      description: "Access foundational legal concepts and principles",
      icon: <Book />,
      link: "#",
    },
    {
      title: "Practice Areas",
      description: "Explore specialized fields of legal practice",
      icon: <Map />,
      link: "#",
    },
    {
      title: "Case Studies",
      description: "Learn from real-world legal precedents and examples",
      icon: <CornerDownRight />,
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 border-b border-blue-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Law RoadMap
              </h1>
              <p className="mt-2 text-blue-100 max-w-xl">
                Navigate the complex landscape of legal education and career
                pathways
              </p>
            </div>

            <div className="flex space-x-2">
              <button className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center">
                <HelpCircle size={16} className="mr-1.5" />
                Get Started
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
                Resources
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            <button className="px-5 py-4 text-blue-600 border-b-2 border-blue-600 font-medium whitespace-nowrap">
              Roadmap
            </button>
            <button className="px-5 py-4 text-gray-600 hover:text-gray-800 whitespace-nowrap">
              Course Plans
            </button>
            <button className="px-5 py-4 text-gray-600 hover:text-gray-800 whitespace-nowrap">
              Resources
            </button>
            <button className="px-5 py-4 text-gray-600 hover:text-gray-800 whitespace-nowrap">
              Career Paths
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Interactive Legal Career Roadmap
            </h2>
            <p className="text-gray-600 mb-4">
              Explore different paths in the legal profession through our
              interactive flowchart. Select categories to visualize specific
              career trajectories and requirements.
            </p>
            <div className="flex items-center text-sm text-blue-600">
              <span className="mr-2">Learn how to use this tool</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {/* Flow Component */}
          <div className="mb-8 h-96">
            <Flow />
          </div>

          {/* Usage Guide */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center mb-4">
              <Settings size={20} className="text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">
                How to Use This Tool
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    1
                  </span>
                  Select a Category
                </h3>
                <p className="text-gray-600 text-sm">
                  Choose from different legal paths including litigation,
                  transactional law, and public service.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    2
                  </span>
                  Explore the Flow
                </h3>
                <p className="text-gray-600 text-sm">
                  Click nodes to see detailed information. Drag to rearrange and
                  use the minimap for navigation.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                    3
                  </span>
                  Save Your Path
                </h3>
                <p className="text-gray-600 text-sm">
                  Bookmark or export your customized legal career roadmap for
                  future reference.
                </p>
              </div>
            </div>
          </div>

          {/* Resources Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Book size={22} className="mr-2 text-blue-600" />
              Additional Resources
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.link}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
                >
                  <div className="text-blue-600 mb-3">{resource.icon}</div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600">{resource.description}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-white text-xl font-bold mb-2">Law RoadMap</h2>
              <p className="text-gray-400 text-sm">
                Your guide to navigating legal education and career paths
              </p>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Law RoadMap. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LawRoadMap;