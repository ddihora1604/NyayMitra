"use client";

import { Globe, Users, FileText, BarChart3, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-white">
      <div className="p-8 max-w-7xl mx-auto mt-6">
        {/* Global Justice Section */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-2">
            <h2 className="text-3xl font-bold mb-3 text-gray-800">
              Law Meets <span className="text-amber-500">Intelligence</span>
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Exploring how artificial intelligence can revolutionize legal research and documentation in India
            </p>
            <div className="flex gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold text-amber-600">2,347</div>
                <div className="text-gray-500 font-medium">Legal Experts</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600">92%</div>
                <div className="text-gray-500 font-medium">Document Accuracy</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl transition-all">Join Our Mission</Button>
              <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 px-6 py-2 rounded-xl transition-all">Explore More</Button>
            </div>
          </div>
          <div className="relative bg-white rounded-xl shadow-md overflow-hidden h-[320px] group transition-all duration-300 hover:shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1589994965851-a8f479c573a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
              alt="Indian Legal System"
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/95 via-amber-500/80 to-transparent"></div>
            <div className="absolute inset-0 flex items-center p-8">
              <div className="max-w-md">
                <div className="bg-white/95 p-6 rounded-xl shadow-lg border border-amber-100 transition-all duration-300 group-hover:shadow-xl">
                  <h3 className="text-xl font-semibold text-amber-600 mb-3">The Constitution of India</h3>
                  <p className="text-gray-700 mb-4">The document that lays down the framework of fundamental rights, directive principles and duties of citizens in India.</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 flex-shrink-0 bg-amber-100 rounded-full flex items-center justify-center shadow-sm">
                      <FileText className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm text-gray-500">Enacted on</div>
                      <div className="text-base font-medium text-gray-800">26 January 1950</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Justice Network Section */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-amber-700">Legal Justice Network</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Collaboratively providing essential legal support to underserved communities globally.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              {
                label: "Legal Experts",
                value: "2,347",
                change: "+12% this month",
                icon: Users,
              },
              {
                label: "Cases Supported",
                value: "856",
                change: "+8% this month",
                icon: FileText,
              },
              {
                label: "Communities Reached",
                value: "182",
                change: "+5% this month",
                icon: Globe,
              },
              {
                label: "Document Accuracy",
                value: "92%",
                change: "+2.3% this month",
                icon: BarChart3,
              },
            ].map((stat, i) => (
              <Card key={i} className="p-6 border border-amber-100 hover:border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-amber-500 mb-2 font-medium">{stat.label}</div>
                    <div className="text-2xl font-bold mb-2 text-gray-800">{stat.value}</div>
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <TrendingUp size={14} className="mr-1" />
                      {stat.change}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-full">
                    <stat.icon size={22} className="text-amber-500" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <Card className="p-6 border border-amber-100 hover:border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl bg-white">
                <h3 className="text-xl font-bold mb-3 text-amber-600">Active Legal Initiatives</h3>
                <p className="text-gray-600 text-base mb-6">
                  Current priority cases our network is actively supporting
                </p>
                <div className="space-y-4">
                  {[
                    {
                      title: "Environmental Protection Act Advocacy",
                      location: "Sierra County, CA",
                      status: "In Progress",
                      icon: "E"
                    },
                    {
                      title: "Disability Rights Awareness",
                      location: "Austin, TX",
                      status: "Planning",
                      icon: "D"
                    },
                    {
                      title: "Housing Justice Initiative",
                      location: "Chicago, IL",
                      status: "Active",
                      icon: "H"
                    }
                  ].map((initiative, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-amber-50/70 hover:bg-amber-50 rounded-xl transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-semibold shadow-sm">
                          {initiative.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{initiative.title}</div>
                          <div className="text-sm text-gray-500">{initiative.location}</div>
                        </div>
                      </div>
                      <Badge variant={initiative.status === "Active" ? "default" : 
                                      initiative.status === "Planning" ? "secondary" : "outline"}
                             className={`px-3 py-1 rounded-md ${
                                initiative.status === "Active" ? "bg-amber-500 hover:bg-amber-600 text-white" : 
                                initiative.status === "Planning" ? "bg-amber-100 text-amber-700" : 
                                "border-amber-300 text-amber-600"
                              }`}>
                        {initiative.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <Card className="p-6 border border-amber-100 hover:border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl bg-white">
              <h3 className="text-xl font-bold mb-3 text-amber-600">Upcoming Forums</h3>
              <p className="text-gray-600 text-base mb-6">
                Key advocacy events and educational workshops
              </p>
              <div className="space-y-5">
                {[
                  {
                    title: "International Human Rights Summit",
                    date: "Mar 15, 2025",
                    location: "Geneva"
                  },
                  {
                    title: "Legal Aid Workshop",
                    date: "Apr 28, 2025",
                    location: "New York"
                  },
                  {
                    title: "Environmental Law Symposium",
                    date: "May 10, 2025",
                    location: "San Francisco"
                  }
                ].map((event, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-amber-100 pb-4 last:border-0 last:pb-0 hover:bg-amber-50/30 p-2 rounded-lg transition-all">
                    <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
                    <div>
                      <div className="font-medium text-gray-800">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.date} • {event.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
} 