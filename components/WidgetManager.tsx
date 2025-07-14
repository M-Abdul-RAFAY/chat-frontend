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

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Create toast element
        const toast = document.createElement("div");
        toast.textContent = "Copied to clipboard!";
        toast.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      background-color: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

        // Add to DOM
        document.body.appendChild(toast);

        // Fade in
        setTimeout(() => {
          toast.style.opacity = "1";
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
          toast.style.opacity = "0";
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);
      })
      .catch((err) => {
        // Handle clipboard write failure
        console.error("Failed to copy text: ", err);

        // Show error toast
        const errorToast = document.createElement("div");
        errorToast.textContent = "Failed to copy to clipboard";
        errorToast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #f44336;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

        document.body.appendChild(errorToast);

        setTimeout(() => {
          errorToast.style.opacity = "1";
        }, 10);

        setTimeout(() => {
          errorToast.style.opacity = "0";
          setTimeout(() => {
            document.body.removeChild(errorToast);
          }, 300);
        }, 3000);
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
      await widgetAPI.updateBusinessInfo(null, user?.id);
      setBusinessInfo(null);
      setConfig((prev) => ({ ...prev, companyName: "Your Company" }));
    } catch (error) {
      console.error("Error clearing business info:", error);
      setError("Failed to clear business information. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">
          Loading widget configuration...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Widget Manager</h2>
        {error && (
          <Button onClick={retryGeneration} disabled={loading} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Business Information Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building className="w-5 h-5" />
            Business Information
          </h3>
          {businessInfo ? (
            <Button onClick={clearBusinessInfo} variant="outline" size="sm">
              Change Business
            </Button>
          ) : (
            <Button onClick={() => setShowBusinessSearch(true)} size="sm">
              Add Business Info
            </Button>
          )}
        </div>

        {businessInfo ? (
          /* Display selected business info */
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {businessInfo.photos && businessInfo.photos.length > 0 && (
                <Image
                  src={googlePlacesAPI.getPhotoUrl(
                    businessInfo.photos[0].photoReference,
                    100
                  )}
                  alt={businessInfo.name || "Business"}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{businessInfo.name}</h4>
                {businessInfo.rating && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{businessInfo.rating}</span>
                    {businessInfo.userRatingsTotal && (
                      <span>({businessInfo.userRatingsTotal} reviews)</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessInfo.formattedAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <span className="text-sm text-gray-700">
                    {businessInfo.formattedAddress}
                  </span>
                </div>
              )}

              {businessInfo.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {businessInfo.phoneNumber}
                  </span>
                </div>
              )}

              {businessInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a
                    href={businessInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}

              {businessInfo.openingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span
                    className={`text-sm ${
                      businessInfo.openingHours.openNow
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {businessInfo.openingHours.openNow ? "Open Now" : "Closed"}
                  </span>
                </div>
              )}
            </div>

            {businessInfo.types && businessInfo.types.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {businessInfo.types.slice(0, 3).map((type, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {type.replace(/_/g, " ").toLowerCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : showBusinessSearch ? (
          /* Business search interface */
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for your business..."
                value={businessSearchQuery}
                onChange={(e) => handleBusinessSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {loadingSuggestions && (
                <RefreshCw className="w-4 h-4 animate-spin absolute right-3 top-3 text-gray-400" />
              )}
            </div>

            {businessSuggestions.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {businessSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    onClick={() => handleBusinessSelection(suggestion)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">
                      {suggestion.structured_formatting.main_text}
                    </div>
                    <div className="text-sm text-gray-600">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setShowBusinessSearch(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* Default state - no business info */
          <div className="text-center py-8 text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="mb-2">No business information added yet</p>
            <p className="text-sm">
              Add your business info to help customers find and contact you
              easily.
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Widget Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.companyName}
                onChange={(e) => {
                  setConfig({ ...config, companyName: e.target.value });
                  // Trigger business search if no business info exists
                  if (!businessInfo && e.target.value.length > 2) {
                    handleBusinessSearch(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your company name..."
              />

              {/* Show suggestions if typing and no business info exists */}
              {!businessInfo &&
                businessSuggestions.length > 0 &&
                config.companyName.length > 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {businessSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        onClick={() => handleBusinessSelection(suggestion)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        type="button"
                      >
                        <div className="font-medium text-sm">
                          {suggestion.structured_formatting.main_text}
                        </div>
                        <div className="text-xs text-gray-600">
                          {suggestion.structured_formatting.secondary_text}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>
            {!businessInfo && (
              <p className="text-xs text-gray-500 mt-1">
                Start typing to search for your business on Google Maps
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Welcome Message
            </label>
            <textarea
              value={config.welcomeMessage}
              onChange={(e) =>
                setConfig({ ...config, welcomeMessage: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) =>
                setConfig({ ...config, primaryColor: e.target.value })
              }
              className="w-20 h-10 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={config.isActive}
              onChange={(e) =>
                setConfig({ ...config, isActive: e.target.checked })
              }
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Widget Active
            </label>
          </div>
          <div>
            <Button onClick={updateConfig} disabled={saving}>
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </Card>

      {widgetId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Widget Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Widget ID
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono">
                    {widgetId}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(widgetId)}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview URL
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono truncate">
                    {window.location.origin}/widget?id={widgetId}
                  </code>
                  <Button
                    onClick={() =>
                      window.open(`/widget?id=${widgetId}`, "_blank")
                    }
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Embed Code</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Copy this code to your website
                </label>
                <div className="relative">
                  <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                    <code>{embedCode}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(embedCode)}
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Paste this code before the closing &lt;/body&gt; tag on your
                website. The widget will appear as a floating chat bubble in the
                bottom-right corner.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
