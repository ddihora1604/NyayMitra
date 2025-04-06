"use client";

import { Globe, Users, FileText, BarChart3, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Navbar } from "@/components/navbar";

const caseData = [
  { month: 'Jan', cases: 65 },
  { month: 'Feb', cases: 59 },
  { month: 'Mar', cases: 80 },
  { month: 'Apr', cases: 81 },
  { month: 'May', cases: 56 },
  { month: 'Jun', cases: 55 },
  { month: 'Jul', cases: 40 },
  { month: 'Aug', cases: 70 },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-white">
      <Navbar title="Dashboard" />
      
      <div className="p-8 max-w-9xl mx-auto mt-8">
        {/* Global Justice Section */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
            Law Meets <span className="text-amber-400">Intelligence</span>
            </h2>
            <p className="text-gray-600 mb-4">
            Exploring how artificial intelligence can revolutionize legal research and documentation in India
            </p>
            <div className="flex gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-amber-700">2,347</div>
                <div className="text-gray-500">Legal Experts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-700">92%</div>
                <div className="text-gray-500">Legal Document Parsing</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button>Join Our Mission</Button>
              <Button variant="outline">Explore More</Button>
            </div>
          </div>
          <div className="relative bg-amber-50 rounded-lg shadow-sm overflow-hidden h-64">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80')] opacity-15 rounded-lg"></div>
            <div className="h-full p-4 flex items-end">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={caseData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="cases" 
                      stroke="#f59e0b" 
                      fillOpacity={1} 
                      fill="url(#colorCases)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Justice Network Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-amber-800">Legal Justice Network</h2>
          <p className="text-gray-600 mb-6">
            Collaboratively providing essential legal support to underserved communities globally.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                label: "Accuracy in Legal Document Parsing",
                value: "92%",
                change: "+2.3% this month",
                icon: BarChart3,
              },
            ].map((stat, i) => (
              <Card key={i} className="p-6 border border-amber-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-amber-600 mb-2">{stat.label}</div>
                    <div className="text-2xl font-bold mb-2 text-amber-800">{stat.value}</div>
                    <div className="flex items-center text-green-600 text-sm">
                      <TrendingUp size={14} className="mr-1" />
                      {stat.change}
                    </div>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-full">
                    <stat.icon size={20} className="text-amber-600" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card className="p-6 border border-amber-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-amber-800">Active Legal Initiatives</h3>
                <p className="text-gray-600 text-sm mb-4">
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
                    <div key={i} className="flex items-center justify-between p-4 bg-amber-50/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 font-semibold">
                          {initiative.icon}
                        </div>
                        <div>
                          <div className="font-medium">{initiative.title}</div>
                          <div className="text-sm text-gray-500">{initiative.location}</div>
                        </div>
                      </div>
                      <Badge variant={initiative.status === "Active" ? "default" : 
                                      initiative.status === "Planning" ? "secondary" : "outline"}>
                        {initiative.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <Card className="p-6 border border-amber-100 shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-amber-800">Upcoming Forums</h3>
              <p className="text-gray-600 text-sm mb-4">
                Key advocacy events and educational workshops
              </p>
              <div className="space-y-4">
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
                  <div key={i} className="flex items-center gap-4 border-b border-amber-50 pb-3 last:border-0 last:pb-0">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{event.title}</div>
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