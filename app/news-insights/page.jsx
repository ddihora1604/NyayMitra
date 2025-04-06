"use client";

import { useState } from "react";
import { Newspaper, ExternalLink, Clock, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock news data (in a real app, this would come from the GNEWS API)
const newsData = [
  {
    id: 1,
    title: "Supreme Court Ruling Strengthens Environmental Protection Laws",
    source: "Legal Times",
    date: "May 12, 2023",
    category: "Environmental Law",
    summary: "In a landmark decision, the Supreme Court ruled 6-3 to uphold stricter enforcement of environmental protection standards, affecting industries nationwide.",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    readTime: "4 min read"
  },
  {
    id: 2,
    title: "New Legal Aid Initiative Launched for Underserved Communities",
    source: "Justice Daily",
    date: "April 28, 2023",
    category: "Access to Justice",
    summary: "A coalition of law firms announced a $50 million initiative to provide pro bono legal services to underserved communities in urban and rural areas.",
    imageUrl: "https://images.unsplash.com/photo-1589394693328-543b1078a6c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    readTime: "3 min read"
  },
  {
    id: 3,
    title: "Digital Rights Framework Adopted by International Coalition",
    source: "Tech Law Journal",
    date: "March 15, 2023",
    category: "Digital Rights",
    summary: "An international coalition of 42 countries adopted a comprehensive framework for digital rights protection, setting new standards for online privacy.",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    readTime: "5 min read"
  },
  {
    id: 4,
    title: "Housing Rights Victory for Tenants in Major Metropolitan Area",
    source: "Urban Policy Review",
    date: "February 22, 2023",
    category: "Housing Law",
    summary: "A class action lawsuit resulted in significant protections for tenants facing eviction, creating precedent for similar cases across the country.",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    readTime: "4 min read"
  }
];

// Insights data
const insightsData = [
  {
    id: 1,
    title: "The Future of Legal Tech in Access to Justice",
    author: "Maya Johnson",
    position: "Legal Innovation Director",
    readTime: "8 min read",
    tags: ["Legal Tech", "Access to Justice", "Future"]
  },
  {
    id: 2,
    title: "Climate Litigation: Trends and Strategic Approaches",
    author: "Dr. James Chen",
    position: "Environmental Law Professor",
    readTime: "12 min read",
    tags: ["Climate Change", "Litigation", "Environmental Law"]
  },
  {
    id: 3,
    title: "Building Effective Pro Bono Programs in Law Firms",
    author: "Sarah Winters",
    position: "Pro Bono Coordinator",
    readTime: "6 min read",
    tags: ["Pro Bono", "Law Firms", "Best Practices"]
  }
];

export default function NewsInsightsPage() {
  const [activeNewsFilter, setActiveNewsFilter] = useState("All");
  
  // Categories for news filters
  const categories = ["All", "Environmental Law", "Access to Justice", "Digital Rights", "Housing Law"];
  
  // Filtered news based on selected category
  const filteredNews = activeNewsFilter === "All" 
    ? newsData 
    : newsData.filter(item => item.category === activeNewsFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-white">
      <div className="p-8 max-w-9xl mx-auto mt-8">
        <section>
          <div className="mb-6">
            <p className="text-gray-600">
              Stay informed about the latest legal developments and expert insights relevant to justice advocacy.
            </p>
          </div>
          
          {/* News Section */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-amber-700">
                <Newspaper className="inline-block mr-2 w-5 h-5" /> 
                Latest Legal News
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {categories.map(category => (
                  <Badge 
                    key={category} 
                    variant={activeNewsFilter === category ? "default" : "outline"}
                    className={`cursor-pointer ${activeNewsFilter === category ? "bg-amber-500" : "hover:bg-amber-100"}`}
                    onClick={() => setActiveNewsFilter(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.map(news => (
                <Card key={news.id} className="overflow-hidden border border-amber-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col h-full">
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={news.imageUrl} 
                        alt={news.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <Badge className="absolute top-3 left-3 bg-amber-500 text-white">{news.category}</Badge>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                        <span>{news.source}</span>
                        <span>{news.date}</span>
                      </div>
                      <h4 className="font-semibold text-lg mb-2 line-clamp-2">{news.title}</h4>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{news.summary}</p>
                      <div className="mt-auto flex justify-between items-center pt-2 border-t border-amber-50">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {news.readTime}
                        </span>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-amber-600 hover:text-amber-800">
                          Read more <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {filteredNews.length === 0 && (
              <div className="bg-amber-50 p-8 rounded-lg text-center">
                <p className="text-amber-800">No news articles found in this category.</p>
              </div>
            )}
          </div>
          
          {/* Insights Section */}
          <div>
            <h3 className="text-xl font-semibold text-amber-700 mb-4 flex items-center">
              <BookOpen className="mr-2 w-5 h-5" />
              Expert Insights & Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insightsData.map(insight => (
                <Card key={insight.id} className="p-6 border border-amber-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col h-full">
                    <div className="flex gap-1 flex-wrap mb-3">
                      {insight.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-amber-50 text-amber-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h4 className="font-semibold text-lg mb-4">{insight.title}</h4>
                    <div className="mt-auto flex justify-between items-center pt-3 border-t border-amber-50">
                      <div>
                        <p className="font-medium text-sm">{insight.author}</p>
                        <p className="text-xs text-gray-500">{insight.position}</p>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {insight.readTime}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Subscribe Card */}
              <Card className="p-6 border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50 flex flex-col justify-center">
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-4 text-amber-800">Stay Updated</h4>
                  <p className="text-sm text-amber-700 mb-6">Subscribe to receive our monthly legal insights digest directly to your inbox.</p>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">Subscribe to Insights</Button>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 