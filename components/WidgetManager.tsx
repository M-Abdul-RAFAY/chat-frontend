"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Copy,
  Eye,
  RefreshCw,
  MapPin,
  Star,
  Phone,
  Globe,
  Clock,
  Building,
  Search,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Settings,
  Palette,
  MessageSquare,
  MessageCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { widgetAPI } from "@/lib/api";
import { googlePlacesAPI, GooglePlaceSuggestion } from "@/lib/googlePlaces";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

interface WidgetConfig {
  companyName: string;
  welcomeMessage: string;
  primaryColor: string;
  isActive: boolean;
}

interface BusinessInfo {
  placeId?: string;
  name?: string;
  address?: string;
  formattedAddress?: string;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  businessStatus?: string;
  types?: string[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photoReference: string;
    width: number;
    height: number;
  }>;
  openingHours?: {
    openNow: boolean;
    periods: unknown[];
    weekdayText: string[];
  };
}

export default function WidgetManager() {
  const { user } = useUser();
  const [widgetId, setWidgetId] = useState<string>("");
  const [embedCode, setEmbedCode] = useState<string>("");
  const [config, setConfig] = useState<WidgetConfig>({
    companyName: "Your Company",
    welcomeMessage: "Hi! How can we help you today?",
    primaryColor: "#3B82F6",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<string>("");

  // Business info states
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [showBusinessSearch, setShowBusinessSearch] = useState(false);
  const [businessSearchQuery, setBusinessSearchQuery] = useState("");
  const [businessSuggestions, setBusinessSuggestions] = useState<
    GooglePlaceSuggestion[]
  >([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const initializeWidget = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Load business info first
      try {
        const businessData = await widgetAPI.getBusinessInfo(user?.id);
        if (businessData.success && businessData.businessInfo) {
          setBusinessInfo(businessData.businessInfo);
          setConfig((prev) => ({
            ...prev,
            companyName: businessData.companyName || prev.companyName,
          }));
        }
      } catch {
        console.log("No existing business info found");
      }

      // First try to get existing widget config
      const data = await widgetAPI.getWidgetConfig(user?.id);
      setWidgetId(data.widgetId);
      setConfig(data.config);
      generateEmbedCode(data.widgetId);
    } catch (error) {
      console.error("No existing widget found, generating new one:", error);
      // If no existing widget, try to generate a new one
      try {
        const data = await widgetAPI.generateWidget(user?.id);
        setWidgetId(data.widgetId);
        setEmbedCode(data.embedCode);
      } catch (generateError) {
        console.error("Error generating widget:", generateError);
        setError("Failed to initialize widget. Please try again.");
        // Generate fallback widget when both API calls fail
        const fallbackWidgetId = `widget_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        setWidgetId(fallbackWidgetId);
        generateEmbedCode(fallbackWidgetId);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    initializeWidget();
  }, [initializeWidget]);

  const updateConfig = async () => {
    try {
      setSaving(true);
      await widgetAPI.updateWidgetConfig(config, user?.id);

      // Show success animation
      setCopySuccess("Configuration saved successfully!");
      setTimeout(() => setCopySuccess(""), 3000);
    } catch (error) {
      console.error("Error updating widget config:", error);
      setError("Failed to save configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const retryGeneration = async () => {
    await initializeWidget();
  };

  const generateEmbedCode = (id: string) => {
    console.log("Generating embed code for widget ID:", id);
    const frontendUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";
    const code = `<iframe
  src="${frontendUrl}/widget?id=${id}"
  style="
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    height: 500px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 9999;
  "
  allowtransparency="true"
></iframe>`;
    setEmbedCode(code);
  };

  const copyToClipboard = (text: string, type: string = "text") => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopySuccess(`${type} copied to clipboard!`);
        setTimeout(() => setCopySuccess(""), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        setError("Failed to copy to clipboard");
        setTimeout(() => setError(""), 3000);
      });
  };

  // Handle business search
  const handleBusinessSearch = async (query: string) => {
    setBusinessSearchQuery(query);

    if (query.length < 2) {
      setBusinessSuggestions([]);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const suggestions = await googlePlacesAPI.getPlaceSuggestions(query);
      setBusinessSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching business suggestions:", error);
      setBusinessSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Handle business selection
  const handleBusinessSelection = async (suggestion: GooglePlaceSuggestion) => {
    try {
      setLoadingSuggestions(true);
      const details = await googlePlacesAPI.getPlaceDetails(
        suggestion.place_id
      );

      if (details) {
        setConfig((prev) => ({
          ...prev,
          companyName: details.name || prev.companyName,
        }));
        setBusinessSearchQuery(details.name || "");
        setBusinessSuggestions([]);

        // Save business info to backend
        const businessInfoData = {
          placeId: details.place_id,
          name: details.name,
          address: details.formatted_address,
          formattedAddress: details.formatted_address,
          phoneNumber: details.formatted_phone_number,
          website: details.website,
          rating: details.rating,
          userRatingsTotal: details.user_ratings_total,
          businessStatus: details.business_status,
          types: details.types,
          geometry: details.geometry,
          photos: details.photos?.map((photo) => ({
            photoReference: photo.photo_reference,
            width: photo.width,
            height: photo.height,
          })),
          openingHours: details.opening_hours
            ? {
                openNow: details.opening_hours.open_now,
                periods: details.opening_hours.periods,
                weekdayText: details.opening_hours.weekday_text,
              }
            : undefined,
        };

        await widgetAPI.updateBusinessInfo(businessInfoData, user?.id);
        setBusinessInfo(businessInfoData);
        setShowBusinessSearch(false);

        setCopySuccess("Business information saved successfully!");
        setTimeout(() => setCopySuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error selecting business:", error);
      setError("Failed to save business information. Please try again.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Clear business info
  const clearBusinessInfo = async () => {
    try {
      console.log("Attempting to clear business info for user:", user?.id);
      await widgetAPI.updateBusinessInfo(null, user?.id);
      setBusinessInfo(null);
      setConfig((prev) => ({ ...prev, companyName: "Your Company" }));

      setCopySuccess("Business information cleared successfully!");
      setTimeout(() => setCopySuccess(""), 3000);
    } catch (error) {
      console.error("Error clearing business info:", error);
      setError("Failed to clear business information. Please try again.");
      setTimeout(() => setError(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Loading Widget Configuration
            </h3>
            <p className="text-gray-500">
              Setting up your personalized chat widget...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Success/Error Toast */}
      {(copySuccess || error) && (
        <div
          className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ${
            copySuccess || error
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              copySuccess ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {copySuccess ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{copySuccess || error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Widget Manager
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create and customize your chat widget to engage with customers
            seamlessly
          </p>
          {error && (
            <div className="mt-4 flex items-center justify-center">
              <Button
                onClick={retryGeneration}
                disabled={loading}
                className="animate-pulse"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Setup
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Business Information Section */}
          <Card className="p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Business Information
                  </h2>
                  <p className="text-gray-600">
                    Connect your Google Business Profile for enhanced customer
                    experience
                  </p>
                </div>
              </div>
              {businessInfo ? (
                <Button
                  onClick={clearBusinessInfo}
                  variant="outline"
                  className="hover:scale-105 transition-transform"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Change Business
                </Button>
              ) : (
                <Button
                  onClick={() => setShowBusinessSearch(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Add Business Info
                </Button>
              )}
            </div>

            {businessInfo ? (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  {businessInfo.photos && businessInfo.photos.length > 0 && (
                    <div className="relative group">
                      <Image
                        src={googlePlacesAPI.getPhotoUrl(
                          businessInfo.photos[0].photoReference,
                          100
                        )}
                        alt={businessInfo.name || "Business"}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-300"></div>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl text-gray-900 mb-2">
                      {businessInfo.name}
                    </h3>
                    {businessInfo.rating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(businessInfo.rating!)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {businessInfo.rating}
                        </span>
                        {businessInfo.userRatingsTotal && (
                          <span className="text-gray-600">
                            ({businessInfo.userRatingsTotal} reviews)
                          </span>
                        )}
                      </div>
                    )}
                    {businessInfo.types && businessInfo.types.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {businessInfo.types.slice(0, 3).map((type, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white bg-opacity-70 text-gray-700 text-sm rounded-full font-medium shadow-sm"
                          >
                            {type.replace(/_/g, " ").toLowerCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {businessInfo.formattedAddress && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">
                          Address
                        </p>
                        <p className="text-gray-700">
                          {businessInfo.formattedAddress}
                        </p>
                      </div>
                    </div>
                  )}

                  {businessInfo.phoneNumber && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Phone</p>
                        <p className="text-gray-700">
                          {businessInfo.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {businessInfo.website && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">
                          Website
                        </p>
                        <a
                          href={businessInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                        >
                          Visit Website
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {businessInfo.openingHours && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Status</p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                            businessInfo.openingHours.openNow
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              businessInfo.openingHours.openNow
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          {businessInfo.openingHours.openNow
                            ? "Open Now"
                            : "Closed"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : showBusinessSearch ? (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for your business on Google..."
                    value={businessSearchQuery}
                    onChange={(e) => handleBusinessSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-200"
                  />
                  {loadingSuggestions && (
                    <RefreshCw className="w-5 h-5 animate-spin absolute right-4 top-4 text-gray-400" />
                  )}
                </div>

                {businessSuggestions.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg max-h-80 overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                    {businessSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.place_id}
                        onClick={() => handleBusinessSelection(suggestion)}
                        className="w-full text-left p-4 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:scale-[1.01] transform"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="font-semibold text-gray-900 mb-1">
                          {suggestion.structured_formatting.main_text}
                        </div>
                        <div className="text-sm text-gray-600">
                          {suggestion.structured_formatting.secondary_text}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowBusinessSearch(false)}
                    variant="outline"
                    className="hover:scale-105 transition-transform"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 animate-in fade-in duration-500">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Building className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No business information yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Connect your Google Business Profile to help customers find
                  and contact you easily through the widget.
                </p>
                <Button
                  onClick={() => setShowBusinessSearch(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search for Business
                </Button>
              </div>
            )}
          </Card>

          {/* Widget Configuration */}
          <Card className="p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Widget Configuration
                </h2>
                <p className="text-gray-600">
                  Customize your widget&#39;s appearance and behavior
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Building className="w-4 h-4" />
                    Company Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={config.companyName}
                      onChange={(e) => {
                        setConfig({ ...config, companyName: e.target.value });
                        if (!businessInfo && e.target.value.length > 2) {
                          handleBusinessSearch(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your company name..."
                    />

                    {!businessInfo &&
                      businessSuggestions.length > 0 &&
                      config.companyName.length > 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                          {businessSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.place_id}
                              onClick={() =>
                                handleBusinessSelection(suggestion)
                              }
                              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                              type="button"
                            >
                              <div className="font-medium text-sm">
                                {suggestion.structured_formatting.main_text}
                              </div>
                              <div className="text-xs text-gray-600">
                                {
                                  suggestion.structured_formatting
                                    .secondary_text
                                }
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                  {!businessInfo && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Start typing to search for your business on Google Maps
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MessageSquare className="w-4 h-4" />
                    Welcome Message
                  </label>
                  <textarea
                    value={config.welcomeMessage}
                    onChange={(e) =>
                      setConfig({ ...config, welcomeMessage: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Enter a friendly welcome message..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Palette className="w-4 h-4" />
                    Primary Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) =>
                        setConfig({ ...config, primaryColor: e.target.value })
                      }
                      className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) =>
                          setConfig({ ...config, primaryColor: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Widget Status
                    </label>
                    <p className="text-xs text-gray-500">
                      Enable or disable the widget on your website
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.isActive}
                      onChange={(e) =>
                        setConfig({ ...config, isActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Live Preview
                </h3>
                <div className="bg-gray-100 rounded-xl p-6 min-h-[300px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50"></div>
                  <div className="relative">
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium shadow-lg animate-pulse"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Text Us
                    </div>
                    <div className="mt-4 bg-white rounded-lg p-4 shadow-sm max-w-xs">
                      <p className="text-sm text-gray-800">
                        {config.welcomeMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={updateConfig}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all px-8 py-3"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Widget Information & Embed Code */}
          {widgetId && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 transform hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Widget Information
                    </h3>
                    <p className="text-gray-600">
                      Your widget details and preview
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Widget ID
                    </label>
                    <div className="flex items-center space-x-3">
                      <code className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm font-mono border">
                        {widgetId}
                      </code>
                      <Button
                        onClick={() => copyToClipboard(widgetId, "Widget ID")}
                        size="sm"
                        variant="outline"
                        className="hover:scale-105 transition-transform"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preview URL
                    </label>
                    <div className="flex items-center space-x-3">
                      <code className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm font-mono truncate border">
                        {window.location.origin}/widget?id={widgetId}
                      </code>
                      <Button
                        onClick={() =>
                          window.open(`/widget?id=${widgetId}`, "_blank")
                        }
                        size="sm"
                        variant="outline"
                        className="hover:scale-105 transition-transform"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 transform hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Copy className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Embed Code
                    </h3>
                    <p className="text-gray-600">Add this to your website</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Copy this code to your website
                    </label>
                    <div className="relative">
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto border font-mono max-h-48">
                        <code>{embedCode}</code>
                      </pre>
                      <Button
                        onClick={() => copyToClipboard(embedCode, "Embed code")}
                        size="sm"
                        className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 border-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-blue-100 rounded">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">
                          Installation Instructions
                        </h4>
                        <p className="text-sm text-blue-800">
                          Paste this code before the closing &lt;/body&gt; tag
                          on your website. The widget will appear as a floating
                          chat bubble in the bottom-right corner.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
