'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw } from 'lucide-react';

// Fix Leaflet icon issues with Next.js
const fixLeafletIcons = () => {
  // Only run on client
  if (typeof window !== 'undefined') {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }
};

// Helper component to handle map zooming
function MapZoomHandler({ selectedLawyer }: { selectedLawyer: Lawyer | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLawyer && selectedLawyer.lat && selectedLawyer.lon) {
      // When a lawyer is selected, zoom to their location with a smoother animation
      map.flyTo([selectedLawyer.lat, selectedLawyer.lon], 14, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedLawyer, map]);

  return null;
}

// Types
interface SearchParams {
  specialty: string;
  location: string;
  experience: string;
  keywords: string;
}

interface Lawyer {
  id: string;
  name: string;
  specialty: string;
  location: string;
  experience: string;
  contact: string;
  address: string;
  link: string;
  gender: string;
  info: string;
  lat: number;
  lon: number;
  distance_km: number;
}

const LawyerSearchMap = React.forwardRef(({ 
  searchParams,
  selectedLawyer: externalSelectedLawyer = null,
  onSearchResults
}: { 
  searchParams: SearchParams;
  selectedLawyer?: any | null;
  onSearchResults?: (results: Lawyer[]) => void;
}, ref) => {
  // State variables
  const [searchResults, setSearchResults] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update selectedLawyer when external prop changes
  useEffect(() => {
    if (externalSelectedLawyer) {
      // Find the matching lawyer in our search results if available
      const matchingLawyer = searchResults.find(lawyer => lawyer.id === externalSelectedLawyer.id);
      if (matchingLawyer) {
        setSelectedLawyer(matchingLawyer);
      } else {
        // If the externally provided lawyer isn't in our results yet, use it directly
        setSelectedLawyer(externalSelectedLawyer);
      }
    }
  }, [externalSelectedLawyer, searchResults]);

  // Fix Leaflet icons issue
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // Gender detection function (simple heuristic)
  const detectGender = (name: string): string => {
    const femaleIndicators = ['a', 'i', 'e', 'ya', 'ka', 'priya', 'sharma', 'devi', 'kumari'];
    const maleIndicators = ['kumar', 'singh', 'raj', 'verma', 'patel', 'reddy', 'nath'];
    
    const lowercaseName = name.toLowerCase();
    
    // Check for female indicators first
    if (femaleIndicators.some(ind => lowercaseName.includes(ind))) {
      return 'female';
    }
    
    // Then check for male indicators
    if (maleIndicators.some(ind => lowercaseName.includes(ind))) {
      return 'male';
    }
    
    // Default to unknown
    return 'unknown';
  };

  // Function to generate random coordinates within a city's general area
  const getRandomCoordinates = (city: string) => {
    // Default coordinates (Mumbai)
    let lat = 19.0760;
    let lon = 72.8777;
    
    // City-specific base coordinates
    const cityCoordinates: Record<string, {lat: number, lon: number}> = {
      "Mumbai": { lat: 19.0760, lon: 72.8777 },
      "Delhi": { lat: 28.6139, lon: 77.2090 },
      "Bangalore": { lat: 12.9716, lon: 77.5946 },
      "Chennai": { lat: 13.0827, lon: 80.2707 },
      "Kolkata": { lat: 22.5726, lon: 88.3639 },
      "Hyderabad": { lat: 17.3850, lon: 78.4867 },
      "Pune": { lat: 18.5204, lon: 73.8567 },
      "Ahmedabad": { lat: 23.0225, lon: 72.5714 },
      "Gurgaon": { lat: 28.4595, lon: 77.0266 },
      "Noida": { lat: 28.5355, lon: 77.3910 },
      "Jaipur": { lat: 26.9124, lon: 75.7873 },
      "Lucknow": { lat: 26.8467, lon: 80.9462 },
      "Kochi": { lat: 9.9312, lon: 76.2673 },
      "Chandigarh": { lat: 30.7333, lon: 76.7794 },
      "Bhopal": { lat: 23.2599, lon: 77.4126 }
    };
    
    // If we have coordinates for the city, use them as base
    if (city && cityCoordinates[city]) {
      lat = cityCoordinates[city].lat;
      lon = cityCoordinates[city].lon;
    }
    
    // Add random offset (0.01 to 0.05 degrees) to create markers in the general area
    const latOffset = (Math.random() * 0.08 - 0.04); // -0.04 to +0.04
    const lonOffset = (Math.random() * 0.08 - 0.04); // -0.04 to +0.04
    
    return {
      lat: lat + latOffset,
      lon: lon + lonOffset
    };
  };

  // Haversine distance calculation
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Search for lawyers
  const searchLawyers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Construct search query
      const queryParts = ["Lawyers in"];
      
      if (searchParams.specialty !== "Any") {
        queryParts.push(searchParams.specialty);
      }
      
      if (searchParams.location !== "Any") {
        queryParts.push(`in ${searchParams.location}`);
      } else {
        queryParts.push("India");
      }
      
      if (searchParams.experience !== "Any") {
        queryParts.push(`with ${searchParams.experience} experience`);
      }
      
      if (searchParams.keywords) {
        queryParts.push(searchParams.keywords);
      }
      
      const searchQuery = queryParts.join(" ");
      
      // Step 1: Call Serper API
      const serperResponse = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': '00bed6629055f888ce9b8a4d47d1f17dab6214d7',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: searchQuery,
          num: 10
        })
      });
      
      if (!serperResponse.ok) {
        throw new Error(`API Error: ${serperResponse.status}`);
      }
      
      const searchData = await serperResponse.json();
      
      // Step 2: Process with Gemini API
      const simplifiedResults = searchData.organic?.map((result: any) => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        position: result.position || 0
      })) || [];
      
      const geminiPrompt = `
      Analyze these lawyer search results and extract structured information about individual lawyers or law firms.
      For each lawyer/firm you can identify, provide:
      1. Name
      2. Specialty (if mentioned)
      3. Location (city)
      4. Experience (if mentioned)
      5. Contact info (if available)
      6. Website/source link
      7. Gender (male/female/unknown - based on name if not specified)
      
      Format the response as a JSON array of objects with these properties:
      - name (string)
      - specialty (string)
      - location (string)
      - experience (string)
      - contact (string)
      - link (string)
      - address (string if available)
      - gender (string: male/female/unknown)
      
      Search results to analyze:
      ${JSON.stringify(simplifiedResults, null, 2)}
      `;
      
      const geminiApiKey = "AIzaSyABP0FhpPcNotV7TqlUw38Qm0YpAovfoIY";
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: geminiPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 8192
          }
        })
      });
      
      if (!geminiResponse.ok) {
        throw new Error(`Gemini API Error: ${geminiResponse.status}`);
      }
      
      const geminiData = await geminiResponse.json();
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '[]'; 
      
      let parsedResults = [];
      try {
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        parsedResults = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
      } catch (e) {
        console.error("Error parsing Gemini response:", e);
        throw new Error("Could not parse lawyer information from the API response");
      }
      
      // Step 3: Add random coordinates based on location and detect gender if not provided
      const userCoords = { lat: 19.0445, lon: 72.8826 }; // Default KJ Somaiya coords
      
      const resultsWithCoords = parsedResults.map((lawyer: any) => {
        const city = lawyer.location || (searchParams.location !== "Any" ? searchParams.location : "Mumbai");
        const coords = getRandomCoordinates(city);
        const distance = haversine(userCoords.lat, userCoords.lon, coords.lat, coords.lon);
        
        // If gender wasn't detected by Gemini, try to detect it from name
        if (!lawyer.gender || lawyer.gender === 'unknown') {
          lawyer.gender = detectGender(lawyer.name);
        }
        
        return {
          ...lawyer,
          lat: coords.lat,
          lon: coords.lon,
          distance_km: distance,
          id: Math.random().toString(36).substring(7),
          info: lawyer.info || `Specializes in ${lawyer.specialty || 'general legal services'}`
        };
      });
      
      setSearchResults(resultsWithCoords.filter((l: any) => l.name));
      // Notify parent component of search results
      if (onSearchResults) {
        onSearchResults(resultsWithCoords.filter((l: any) => l.name));
      }
      setIsLoading(false);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message);
      // Notify parent component of empty results due to error
      if (onSearchResults) {
        onSearchResults([]);
      }
      setIsLoading(false);
    }
  };

  // Call search on first load or when search params change
  useEffect(() => {
    searchLawyers();
  }, [searchParams]);

  // Custom icons based on gender
  const getLawyerIcon = (gender: string, isSelected: boolean = false) => {
    const iconUrls: Record<string, string> = {
      male: 'https://cdn-icons-png.flaticon.com/128/11905/11905640.png',
      female: 'https://cdn-icons-png.flaticon.com/128/3611/3611204.png',
      unknown: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    };
    
    return new L.Icon({
      iconUrl: iconUrls[gender] || iconUrls.unknown,
      iconSize: isSelected ? [42, 42] : [32, 32],
      iconAnchor: isSelected ? [21, 42] : [16, 32],
      popupAnchor: [0, -32],
      className: isSelected ? 'selected-lawyer-icon' : ''
    });
  };

  // Default center (Mumbai)
  const defaultCenter: [number, number] = [19.0760, 72.8777];
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fix Leaflet not redrawing properly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resize'));
    }
    
    // Give time for the map to initialize
    const timer = setTimeout(() => {
      setMapLoaded(true);
      const mapElement = document.getElementById('lawyer-map');
      if (mapElement) {
        // Force browser to recalculate layout
        mapElement.style.display = 'none';
        // This triggers a reflow
        void mapElement.offsetHeight;
        mapElement.style.display = 'block';
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchResults]);

  // Map Load Handler Component
  const MapLoadHandler = () => {
    const map = useMap();
    
    useEffect(() => {
      // Invalidate size when map is loaded
      map.invalidateSize();
    }, [map]);
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-10 w-10 text-amber-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-amber-700 mb-2">Searching for Lawyers</h3>
            <p className="text-gray-600">Please wait while we search for lawyers matching your criteria...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6">
      <h2 className="text-xl font-semibold text-amber-700 mb-6">Lawyer Search Results</h2>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column - Lawyer list */}
        <div className="w-full lg:w-1/3">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Available Lawyers</h3>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {searchResults.length === 0 ? (
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-amber-800">No lawyers found matching your criteria. Try adjusting your search parameters.</p>
              </div>
            ) : (
              searchResults.map((lawyer) => (
                <div 
                  key={lawyer.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedLawyer?.id === lawyer.id 
                      ? 'border-amber-500 bg-amber-50 shadow-md' 
                      : 'border-gray-200 hover:border-amber-200 hover:bg-amber-50/50'
                  }`}
                  onClick={() => {
                    setSelectedLawyer(lawyer);
                    // Add a small delay to allow state update before map animation
                    setTimeout(() => {
                      document.querySelector('.map-container')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'nearest'
                      });
                    }, 100);
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src={
                        lawyer.gender === 'male'
                          ? 'https://cdn-icons-png.flaticon.com/128/11905/11905640.png'
                          : lawyer.gender === 'female'
                            ? 'https://cdn-icons-png.flaticon.com/128/3611/3611204.png'
                            : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                      }
                      alt={`${lawyer.gender} lawyer`}
                      className={`w-10 h-10 rounded-full ${selectedLawyer?.id === lawyer.id ? 'ring-2 ring-amber-500' : ''}`}
                    />
                    <h4 className="font-medium text-amber-800">{lawyer.name}</h4>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    {lawyer.specialty && <p><span className="font-medium">Specialty:</span> {lawyer.specialty}</p>}
                    {lawyer.location && <p><span className="font-medium">Location:</span> {lawyer.location}</p>}
                    {lawyer.experience && <p><span className="font-medium">Experience:</span> {lawyer.experience}</p>}
                    <p><span className="font-medium">Distance:</span> {lawyer.distance_km.toFixed(2)} km</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Right column - Map */}
        <div className="w-full lg:w-2/3">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Location Map</h3>
          
          <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200 map-container" id="lawyer-map">
            <MapContainer 
              center={defaultCenter}
              zoom={12} 
              style={{ height: '100%', width: '100%' }}
            >
              <MapZoomHandler selectedLawyer={selectedLawyer} />
              <MapLoadHandler />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* User location marker */}
              <Marker position={[19.0445, 72.8826]}>
                <Popup>
                  <div className="text-center">
                    <strong>Your Location</strong><br />
                    KJ Somaiya, Mumbai
                  </div>
                </Popup>
              </Marker>
              
              {/* Lawyer markers */}
              {searchResults.map((lawyer) => (
                <Marker 
                  key={`marker-${lawyer.id}`}
                  position={[lawyer.lat, lawyer.lon]}
                  icon={getLawyerIcon(lawyer.gender, selectedLawyer?.id === lawyer.id)}
                  eventHandlers={{
                    click: () => setSelectedLawyer(lawyer)
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <img 
                        src={
                          lawyer.gender === 'male'
                            ? 'https://cdn-icons-png.flaticon.com/128/11905/11905640.png'
                            : lawyer.gender === 'female'
                              ? 'https://cdn-icons-png.flaticon.com/128/3611/3611204.png'
                              : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                        }
                        alt={`${lawyer.gender} lawyer`}
                        className="w-12 h-12 rounded-full mx-auto mb-2"
                      />
                      <strong>{lawyer.name}</strong><br />
                      {lawyer.specialty && <span>Specialty: {lawyer.specialty}<br /></span>}
                      <span>Distance: {lawyer.distance_km.toFixed(2)} km</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          
          {/* Selected lawyer details */}
          {selectedLawyer && (
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-800 mb-2">Selected Lawyer Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Name:</span> {selectedLawyer.name}</p>
                  {selectedLawyer.specialty && <p><span className="font-medium">Specialty:</span> {selectedLawyer.specialty}</p>}
                  {selectedLawyer.location && <p><span className="font-medium">Location:</span> {selectedLawyer.location}</p>}
                  {selectedLawyer.experience && <p><span className="font-medium">Experience:</span> {selectedLawyer.experience}</p>}
                </div>
                
                <div>
                  {selectedLawyer.contact && <p><span className="font-medium">Contact:</span> {selectedLawyer.contact}</p>}
                  {selectedLawyer.address && <p><span className="font-medium">Address:</span> {selectedLawyer.address}</p>}
                  {selectedLawyer.link && (
                    <p>
                      <span className="font-medium">Website:</span> 
                      <a href={selectedLawyer.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Site
                      </a>
                    </p>
                  )}
                  <p><span className="font-medium">Distance:</span> {selectedLawyer.distance_km.toFixed(2)} km</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for map interactions */}
      <style jsx global>{`
        .selected-lawyer-icon {
          filter: drop-shadow(0 0 6px rgba(217, 119, 6, 0.8));
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .leaflet-container {
          font-family: inherit;
        }
        
        .leaflet-popup-content {
          margin: 12px;
          min-width: 150px;
        }
      `}</style>
    </div>
  );
});

// Add display name
LawyerSearchMap.displayName = 'LawyerSearchMap';

export default LawyerSearchMap; 