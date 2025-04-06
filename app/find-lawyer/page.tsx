"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Search, 
  MapPin, 
  AlertCircle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

// Common specialty options
const commonSpecialties = [
  "Any", "Corporate Law", "Criminal Law", "Property Law", "Family Law", "IP Law",
  "Labor Law", "Tax Law", "Cyber Law", "Civil Litigation", "Arbitration",
  "Banking Law", "Consumer Law", "Environmental Law", "Immigration Law",
  "Media Law", "Public Interest Litigation", "General Practice"
];

// Common location options
const commonLocations = [
  "Any", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Ahmedabad", "Gurgaon", "Noida", "Jaipur", "Lucknow",
  "Kochi", "Chandigarh", "Bhopal"
];

// Experience level options
const expLevels = ["Any", "5+ Years", "10+ Years", "15+ Years", "20+ Years"];

// Update LawyerSearchMap component to use dynamic import with ssr: false
const LawyerSearchMap = dynamic(
  () => import('../../components/LawyerSearchMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg h-full">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading map interface...</p>
        </div>
      </div>
    )
  }
);

export default function FindLawyerPage() {
  // State for search parameters
  const [searchParams, setSearchParams] = useState({
    specialty: 'Any',
    location: 'Any',
    experience: 'Any',
    keywords: ''
  });
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<any | null>(null);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSearchSubmitted(true);
    setError(null);
    // Search is handled by the LawyerSearchMap component
  };

  // Reference to the LawyerSearchMap component to get results from it
  const mapRef = useRef<any>(null);

  // Handle receiving search results from the map component
  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    setIsLoading(false);
  };

  // Add useEffect to set global Leaflet CSS
  useEffect(() => {
    // Ensure Leaflet CSS is properly applied after component mount
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    
    // Only add if not already present
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      document.head.appendChild(link);
    }
    
    return () => {
      // Optional cleanup if needed
      const leafletLink = document.querySelector('link[href*="leaflet.css"]');
      if (leafletLink && link === leafletLink) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">Find Lawyer</h1>
        <p className="text-gray-600 max-w-3xl">
          Search for qualified lawyers across India based on specialty, location, and experience.
          Our interactive map helps you locate legal professionals near you.
        </p>
      </div>

      {!isSearchSubmitted ? (
        <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <h2 className="text-xl font-semibold text-amber-700 mb-6 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Lawyer Search Criteria
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Specialty Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Specialty
                </label>
                <select 
                  name="specialty"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={searchParams.specialty}
                  onChange={handleInputChange}
                >
                  {commonSpecialties.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              
              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2 text-amber-600" />
                  Location
                </label>
                <select 
                  name="location"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={searchParams.location}
                  onChange={handleInputChange}
                >
                  {commonLocations.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              
              {/* Experience Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Experience
                </label>
                <select 
                  name="experience"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={searchParams.experience}
                  onChange={handleInputChange}
                >
                  {expLevels.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Additional Keywords */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Keywords (Optional)
              </label>
              <input
                type="text"
                name="keywords"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={searchParams.keywords}
                onChange={handleInputChange}
                placeholder="e.g., specific firm name, particular skill"
              />
            </div>
            
            {/* Search Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  flex items-center gap-2 py-3 px-6 rounded-lg font-medium text-white transition-colors
                  ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"}
                `}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Search for Lawyers
                  </>
                )}
              </button>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 text-sm text-gray-500 text-center max-w-2xl mx-auto">
              <p>Results are based on web search and are not endorsements. Please conduct your own due diligence.</p>
            </div>
          </form>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Search Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <button
            onClick={() => setIsSearchSubmitted(false)}
            className="flex items-center gap-2 text-amber-600 hover:text-amber-800 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Search
          </button>
          
          {/* Side-by-side layout for lawyer list and map */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Lawyer Listing Panel */}
            <div className="lg:w-2/5">
              <div className="bg-white rounded-xl shadow-md border border-amber-100 overflow-hidden">
                <div className="border-b border-amber-100 px-4 py-3 bg-amber-50">
                  <h2 className="text-lg font-semibold text-amber-800 flex items-center">
                    <Search className="h-5 w-5 mr-2 text-amber-600" />
                    Search Results
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {searchParams.specialty !== 'Any' ? searchParams.specialty : 'All specialties'} in {searchParams.location !== 'Any' ? searchParams.location : 'India'}
                  </p>
                </div>

                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block animate-spin mr-2 h-6 w-6 text-amber-600">
                        <RefreshCw size={24} />
                      </div>
                      <p className="text-gray-600 mt-2">Searching for lawyers...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 text-red-700">
                      <p>{error}</p>
                      <button 
                        onClick={() => setIsSearchSubmitted(false)} 
                        className="mt-2 text-amber-600 hover:text-amber-800"
                      >
                        Try another search
                      </button>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No lawyers found</p>
                      <p className="mt-2">Try adjusting your search criteria</p>
                    </div>
                  ) : (
                    searchResults.map((lawyer) => (
                      <div 
                        key={lawyer.id}
                        onClick={() => setSelectedLawyer(lawyer)}
                        className={`p-4 hover:bg-amber-50 cursor-pointer transition-colors ${selectedLawyer?.id === lawyer.id ? 'bg-amber-50 border-l-4 border-amber-500' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${lawyer.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                            {lawyer.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{lawyer.name}</h3>
                            <p className="text-sm text-gray-500">{lawyer.specialty || 'General Law'} {lawyer.experience ? `• ${lawyer.experience}` : ''}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin size={14} className="mr-1 text-amber-500" />
                              <span className="truncate">{lawyer.location || 'India'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button className="text-xs text-amber-600 hover:text-amber-800 font-medium">
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Map Display */}
            <div className="lg:w-3/5">
              <div className="bg-white rounded-xl shadow-md border border-amber-100 overflow-hidden h-[600px]">
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <LawyerSearchMap 
                    searchParams={searchParams} 
                    selectedLawyer={selectedLawyer}
                    onSearchResults={handleSearchResults}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Override z-index for map controls */}
          <style jsx global>{`
            .leaflet-control-container .leaflet-top,
            .leaflet-control-container .leaflet-bottom {
              z-index: 999 !important;
            }
            
            /* Force proper map dimensions */
            .map-container,
            .leaflet-container {
              width: 100% !important;
              height: 100% !important;
              border-radius: 0.75rem;
            }
          `}</style>
        </>
      )}
    </div>
  );
} 