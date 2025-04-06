import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
const defaultCenter = [19.0760, 72.8777];
const defaultZoom = 12;
// Helper component to handle map zooming
function MapZoomHandler({ selectedLawyer }) {
  const map = useMap();
  const DEFAULT_CENTER = [19.0760, 72.8777]; // Mumbai coordinates
  const DEFAULT_ZOOM = 12;

  useEffect(() => {
    if (selectedLawyer && selectedLawyer.lat && selectedLawyer.lon) {
      map.flyTo([selectedLawyer.lat, selectedLawyer.lon], 14, {
        duration: 1
      });
    }
  }, [selectedLawyer, map]);

  return null;
}

const LawyerSearchMap = () => {
  // State variables
  const [searchParams, setSearchParams] = useState({
    specialty: 'Any',
    location: 'Any',
    experience: 'Any',
    keywords: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter options
  const commonSpecialties = [
    "Any", "Corporate Law", "Criminal Law", "Property Law", "Family Law", 
    "IP Law", "Labor Law", "Tax Law", "Cyber Law", "Civil Litigation", 
    "Arbitration", "Banking Law", "Consumer Law", "Environmental Law", 
    "Immigration Law", "Media Law", "Public Interest Litigation", "General Practice"
  ];

  const commonLocations = [
    "Any", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", 
    "Hyderabad", "Pune", "Ahmedabad", "Gurgaon", "Noida", "Jaipur", 
    "Lucknow", "Kochi", "Chandigarh", "Bhopal"
  ];

  const expLevels = ["Any", "5+ Years", "10+ Years", "15+ Years", "20+ Years"];

  // Gender detection function (simple heuristic)
  const detectGender = (name) => {
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
  const getRandomCoordinates = (city) => {
    // Default coordinates (Mumbai)
    let lat = 19.0760;
    let lon = 72.8777;
    
    // City-specific base coordinates
    const cityCoordinates = {
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
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
      const simplifiedResults = searchData.organic?.map(result => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        position: result.position || 0
      })) || [];
      
      const geminiPrompt = `
      Analyze these lawyer search results and extract structured information about individual lawyers or law firms.
      For each lawyer/firm you can identify, provide:
      1. Name
      2. Specialty (from: ${commonSpecialties.join(', ')})
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
        throw new Error(`Gemini API Error: ${geminiResponse.status} - ${await geminiResponse.text()}`);
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
      const resultsWithCoords = parsedResults.map((lawyer) => {
        const city = lawyer.location || (searchParams.location !== "Any" ? searchParams.location : "Mumbai");
        const coords = getRandomCoordinates(city);
        
        // If gender wasn't detected by Gemini, try to detect it from name
        if (!lawyer.gender || lawyer.gender === 'unknown') {
          lawyer.gender = detectGender(lawyer.name);
        }
        
        return {
          ...lawyer,
          lat: coords.lat,
          lon: coords.lon,
          id: Math.random().toString(36).substring(7)
        };
      });
      
      setSearchResults(resultsWithCoords.filter(l => l.name));
      setIsLoading(false);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Custom icons based on gender
  const getLawyerIcon = (gender) => {
    const iconUrls = {
      male: 'https://cdn-icons-png.flaticon.com/128/11905/11905640.png',
      female: 'https://cdn-icons-png.flaticon.com/128/3611/3611204.png',
      unknown: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    };
    
    return new L.Icon({
      iconUrl: iconUrls[gender] || iconUrls.unknown,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      shadowSize: [41, 41]
    });
  };

  // Default center (Mumbai)
  const defaultCenter = [19.0760, 72.8777];

  return (
    <div className="lawyer-search-container">
      <h1>🌐 Lawyer Search and Mapping Tool</h1>
      
      <div className="search-controls">
        <div className="filter-row">
          <div className="filter-group">
            <label>Specialty:</label>
            <select 
              name="specialty" 
              value={searchParams.specialty}
              onChange={handleInputChange}
            >
              {commonSpecialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Location:</label>
            <select 
              name="location" 
              value={searchParams.location}
              onChange={handleInputChange}
            >
              {commonLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Experience:</label>
            <select 
              name="experience" 
              value={searchParams.experience}
              onChange={handleInputChange}
            >
              {expLevels.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-group keywords">
            <label>Additional Keywords:</label>
            <input
              type="text"
              name="keywords"
              value={searchParams.keywords}
              onChange={handleInputChange}
              placeholder="e.g., firm name, specific skill"
            />
          </div>
          
          <button 
            className="search-button"
            onClick={searchLawyers}
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search for Lawyers'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      <div className="results-layout">
        <div className="lawyers-list">
          <h2>Search Results</h2>
          
          {isLoading ? (
            <div className="loading-message">Loading lawyer information...</div>
          ) : searchResults.length === 0 ? (
            <div className="info-message">
              No lawyers found yet. Use the filters above to search.
            </div>
          ) : (
            <div className="results-container">
              {searchResults.map((lawyer) => (
                <div 
                  key={lawyer.id} 
                  className={`lawyer-card ${selectedLawyer?.id === lawyer.id ? 'selected' : ''}`}
                  onClick={() => setSelectedLawyer(lawyer)}
                >
                  <div className="lawyer-card-header">
                    <img 
                      src={lawyer.gender === 'male' ? 
                        'https://cdn-icons-png.flaticon.com/128/11905/11905640.png' : 
                        lawyer.gender === 'female' ? 
                        'https://cdn-icons-png.flaticon.com/128/3611/3611204.png' : 
                        'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                      alt={lawyer.gender === 'male' ? 'Male lawyer' : lawyer.gender === 'female' ? 'Female lawyer' : 'Lawyer'}
                      className="lawyer-avatar"
                    />
                    <h3>{lawyer.name}</h3>
                  </div>
                  <p><strong>Specialty:</strong> {lawyer.specialty || 'Not specified'}</p>
                  <p><strong>Location:</strong> {lawyer.location || 'Not specified'}</p>
                  {lawyer.experience && <p><strong>Experience:</strong> {lawyer.experience}</p>}
                  {lawyer.contact && <p><strong>Contact:</strong> {lawyer.contact}</p>}
                  {lawyer.link && (
                    <p>
                      <strong>Website:</strong> 
                      <a href={lawyer.link} target="_blank" rel="noopener noreferrer">
                        Visit
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="map-section">
          <h2>Lawyer Locations</h2>
          <div className="map-wrapper">
            <MapContainer 
              center={[19.0723, 72.8976]} 
              zoom={13} 
              style={{ height: '600px', width: '100%' }}
            >
              <MapZoomHandler selectedLawyer={selectedLawyer} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {searchResults.filter(l => l.lat && l.lon).map((lawyer) => (
                <Marker 
                  key={`marker-${lawyer.id}`} 
                  position={[lawyer.lat, lawyer.lon]} 
                  icon={getLawyerIcon(lawyer.gender)}
                  eventHandlers={{
                    click: () => setSelectedLawyer(lawyer)
                  }}
                >
                  <Popup>
                    <div className="popup-content">
                      <img 
                        src={lawyer.gender === 'male' ? 
                          'https://cdn-icons-png.flaticon.com/128/11905/11905640.png' : 
                          lawyer.gender === 'female' ? 
                          'https://cdn-icons-png.flaticon.com/128/3611/3611204.png' : 
                          'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                        alt={lawyer.gender}
                        className="popup-avatar"
                      />
                      <b>{lawyer.name}</b><br />
                      {lawyer.specialty && <span>Specialty: {lawyer.specialty}<br /></span>}
                      {lawyer.location && <span>Location: {lawyer.location}<br /></span>}
                      {lawyer.contact && <span>Contact: {lawyer.contact}<br /></span>}
                      {lawyer.link && (
                        <a href={lawyer.link} target="_blank" rel="noopener noreferrer">
                          More info
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          
          {selectedLawyer && (
            <div className="selected-lawyer-details">
              <h3>Selected Lawyer Details</h3>
              <div className="details-content">
                <div className="selected-lawyer-header">
                  <img 
                    src={selectedLawyer.gender === 'male' ? 
                      'https://cdn-icons-png.flaticon.com/128/11905/11905640.png' : 
                      selectedLawyer.gender === 'female' ? 
                      'https://cdn-icons-png.flaticon.com/128/3611/3611204.png' : 
                      'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                    alt={selectedLawyer.gender}
                    className="selected-lawyer-avatar"
                  />
                  <div>
                    <p><strong>Name:</strong> {selectedLawyer.name}</p>
                    <p><strong>Gender:</strong> {selectedLawyer.gender || 'Not specified'}</p>
                  </div>
                </div>
                <p><strong>Specialty:</strong> {selectedLawyer.specialty || 'Not specified'}</p>
                <p><strong>Location:</strong> {selectedLawyer.location || 'Not specified'}</p>
                {selectedLawyer.experience && <p><strong>Experience:</strong> {selectedLawyer.experience}</p>}
                {selectedLawyer.contact && <p><strong>Contact:</strong> {selectedLawyer.contact}</p>}
                {selectedLawyer.address && <p><strong>Address:</strong> {selectedLawyer.address}</p>}
                {selectedLawyer.link && (
                  <p>
                    <strong>Website:</strong> 
                    <a href={selectedLawyer.link} target="_blank" rel="noopener noreferrer">
                      {selectedLawyer.link}
                    </a>
                  </p>
                )}
                {selectedLawyer.lat && selectedLawyer.lon && (
                  <p>
                    <strong>Coordinates:</strong> 
                    {selectedLawyer.lat.toFixed(4)}, {selectedLawyer.lon.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .lawyer-search-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
        }
        
        h1, h2, h3 {
          color: #333;
        }
        
        .search-controls {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .filter-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .filter-group {
          flex: 1;
          min-width: 200px;
        }
        
        .filter-group.keywords {
          flex: 3;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #555;
        }
        
        select, input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .search-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 10px 0;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.3s;
          align-self: flex-end;
        }
        
        .search-button:hover {
          background-color: #45a049;
        }
        
        .search-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .results-layout {
          display: flex;
          gap: 20px;
          margin-top: 20px;
        }
        
        .lawyers-list {
          flex: 1;
          min-width: 350px;
          max-height: 800px;
          overflow-y: auto;
        }
        
        .map-section {
          flex: 2;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .map-wrapper {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .results-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .lawyer-card {
          padding: 15px;
          border-radius: 5px;
          background: #fff;
          border: 1px solid #ddd;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .lawyer-card:hover {
          border-color: #4CAF50;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .lawyer-card.selected {
          border-left: 4px solid #4CAF50;
          background-color: #f0fff0;
        }
        
        .lawyer-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .lawyer-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .lawyer-card h3 {
          margin: 0;
          color: #2c3e50;
        }
        
        .lawyer-card p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .lawyer-card a {
          color: #3498db;
          text-decoration: none;
        }
        
        .lawyer-card a:hover {
          text-decoration: underline;
        }
        
        .selected-lawyer-details {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-top: 10px;
        }
        
        .selected-lawyer-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .selected-lawyer-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .details-content {
          font-size: 14px;
        }
        
        .details-content p {
          margin: 8px 0;
        }
        
        .popup-content {
          text-align: center;
        }
        
        .popup-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-bottom: 10px;
        }
        
        .loading-message, .info-message, .error-message {
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }
        
        .loading-message {
          background: #e3f2fd;
          color: #0d47a1;
        }
        
        .info-message {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .error-message {
          background: #ffebee;
          color: #c62828;
        }
        
        @media (max-width: 768px) {
          .results-layout {
            flex-direction: column;
          }
          
          .lawyers-list {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default LawyerSearchMap;