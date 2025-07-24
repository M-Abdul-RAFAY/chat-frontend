"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import BusinessManagement from "./BusinessManagement";
import ReviewsManagement from "./ReviewsManagement";
import { Building2, MessageSquare, BarChart3, Settings } from "lucide-react";

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState("business");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Podium Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your business reviews and customer communications
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                activeTab === "business"
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : ""
              }`}
              onClick={() => setActiveTab("business")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Business Management</h3>
                    <p className="text-sm text-gray-600">
                      Manage business profiles
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                activeTab === "reviews" ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Reviews</h3>
                    <p className="text-sm text-gray-600">Monitor and respond</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                activeTab === "analytics"
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : ""
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Analytics</h3>
                    <p className="text-sm text-gray-600">Review insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                activeTab === "settings"
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Settings className="h-8 w-8 text-gray-600" />
                  <div>
                    <h3 className="font-semibold">Settings</h3>
                    <p className="text-sm text-gray-600">Configure platform</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {activeTab === "business" && <BusinessManagement />}
            {activeTab === "reviews" && <ReviewsManagement />}
            {activeTab === "analytics" && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
                <p className="text-gray-600">
                  Analytics features coming soon...
                </p>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Platform Settings</h2>
                <p className="text-gray-600">Settings panel coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
