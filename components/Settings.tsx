"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Building,
  MessageSquare,
  Settings as SettingsIcon,
  Search,
  RefreshCw,
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  ExternalLink,
  Brain,
  Bot,
  Sparkles,
  Save,
  Trash2,
  Smartphone,
  MessageCircle,
  Lightbulb,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { googlePlacesAPI } from "@/lib/googlePlaces";
import { showToast } from "@/lib/toast";

interface BusinessInfo {
  place_id: string;
  name?: string;
  formattedAddress?: string;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  types?: string[];
  photos?: Array<{ photoReference: string }>;
  openingHours?: {
    openNow?: boolean;
    periods?: Array<{
      open?: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
  };
}

interface BusinessSuggestion {
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface UserSettings {
  aiGeneratedResponse: boolean;
  whatsapp: boolean;
  sms: boolean;
  socialMediaAI: {
    facebook: boolean;
    instagram: boolean;
    twitter: boolean;
  };
}

interface AITrainingData {
  _id?: string;
  customerScenario: string;
  desiredResponse: string;
  tone: "professional" | "friendly" | "casual" | "formal";
  category: string;
}

interface BackendTrainingData {
  _id?: string;
  question: string;
  answer: string;
  category: string;
  isActive?: boolean;
  createdAt?: string;
}

export default function Settings() {
  const { user } = useUser();
  const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Business Information State
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [showBusinessSearch, setShowBusinessSearch] = useState(false);
  const [businessSearchQuery, setBusinessSearchQuery] = useState("");
  const [businessSuggestions, setBusinessSuggestions] = useState<
    BusinessSuggestion[]
  >([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // User Settings State
  const [userSettings, setUserSettings] = useState<UserSettings>({
    aiGeneratedResponse: true,
    whatsapp: false,
    sms: true,
    socialMediaAI: {
      facebook: false,
      instagram: false,
      twitter: false,
    },
  });

  // AI Training State
  const [aiTrainingData, setAiTrainingData] = useState<AITrainingData[]>([]);
  const [newTrainingData, setNewTrainingData] = useState<AITrainingData>({
    customerScenario: "",
    desiredResponse: "",
    tone: "professional",
    category: "general",
  });
  const [showTrainingForm, setShowTrainingForm] = useState(false);

  // Business brand guidelines
  const [brandGuidelines, setBrandGuidelines] = useState({
    brandVoice: {
      tone: "professional",
      style: "",
      personality: "",
    },
    communicationStyle: {
      formalityLevel: "",
      responseLength: "",
      useEmojis: false,
      language: "English",
    },
    businessSpecific: {
      keyMessages: [] as string[],
      avoidTopics: [] as string[],
      specialInstructions: "",
    },
    responseGuidelines: {
      greetingStyle: "",
      closingStyle: "",
      escalationTriggers: [] as string[],
      customResponses: [] as Array<{ trigger: string; response: string }>,
    },
  });

  useEffect(() => {
    fetchUserSettings();
    fetchBusinessInfo();
    fetchAITrainingData();
    fetchBrandGuidelines();
  }, [user?.id]);

  const fetchUserSettings = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/user-settings?userId=${user.id}`);
      if (response.ok) {
        const settings = await response.json();
        setUserSettings({
          aiGeneratedResponse: settings.aiGeneratedResponse ?? true,
          whatsapp: settings.whatsapp ?? false,
          sms: settings.sms ?? true,
          socialMediaAI: {
            facebook: settings.socialMediaAI?.facebook ?? false,
            instagram: settings.socialMediaAI?.instagram ?? false,
            twitter: settings.socialMediaAI?.twitter ?? false,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  const fetchBusinessInfo = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/business-info?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.businessInfo) {
          setBusinessInfo(data.businessInfo);
        }
      }
    } catch (error) {
      console.error("Error fetching business info:", error);
    }
  };

  const fetchAITrainingData = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/ai-training?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Backend returns { success: true, data: aiTraining } or { trainingData: ... }
        const backendTrainingData =
          data.data?.trainingData || data.trainingData || [];

        // Map backend data structure to frontend structure
        const mappedTrainingData = backendTrainingData.map(
          (item: BackendTrainingData) => ({
            customerScenario: item.question || "",
            desiredResponse: item.answer || "",
            category: item.category || "general",
            tone: "professional" as const, // Default tone since backend doesn't store this
            _id: item._id,
          })
        );

        setAiTrainingData(mappedTrainingData);
      }
    } catch (error) {
      console.error("Error fetching AI training data:", error);
    }
  };

  const fetchBrandGuidelines = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/brand-guidelines?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Backend returns { success: true, data: guidelines } or { guidelines: ... }
        const guidelines = data.data?.guidelines || data.guidelines;
        if (guidelines) {
          setBrandGuidelines(guidelines);
        }
      }
    } catch (error) {
      console.error("Error fetching brand guidelines:", error);
    }
  };

  const saveUserSettings = async (settingKey: string, value: boolean) => {
    if (!user?.id) return;

    let updatedSettings = { ...userSettings, [settingKey]: value };

    // Handle mutual exclusivity between WhatsApp and SMS
    if (settingKey === "whatsapp" && value === true) {
      updatedSettings = { ...updatedSettings, sms: false };
    } else if (settingKey === "sms" && value === true) {
      updatedSettings = { ...updatedSettings, whatsapp: false };
    }

    setUserSettings(updatedSettings);

    try {
      const response = await fetch("/api/user-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...updatedSettings,
        }),
      });

      if (response.ok) {
        showToast.success("Settings saved successfully");
      }
    } catch (error) {
      console.error("Error saving user settings:", error);
      showToast.error("Failed to save settings");
    }
  };

  const saveSocialMediaAISetting = async (platform: string, value: boolean) => {
    if (!user?.id) return;

    const updatedSettings = {
      ...userSettings,
      socialMediaAI: {
        ...userSettings.socialMediaAI,
        [platform]: value,
      },
    };

    setUserSettings(updatedSettings);

    try {
      const response = await fetch("/api/user-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...updatedSettings,
        }),
      });

      if (response.ok) {
        showToast.success(
          `${
            platform.charAt(0).toUpperCase() + platform.slice(1)
          } AI setting saved successfully`
        );
      }
    } catch (error) {
      console.error("Error saving social media AI settings:", error);
      showToast.error("Failed to save AI settings");
    }
  };

  const handleBusinessSearch = async (query: string) => {
    setBusinessSearchQuery(query);

    if (query.length < 3) {
      setBusinessSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const suggestions = await googlePlacesAPI.getPlaceSuggestions(query);
      setBusinessSuggestions(suggestions);
    } catch (error) {
      console.error("Error searching businesses:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleBusinessSelection = async (suggestion: BusinessSuggestion) => {
    try {
      const details = await googlePlacesAPI.getPlaceDetails(
        suggestion.place_id
      );

      if (!details) {
        throw new Error("Failed to get business details");
      }

      const businessData: BusinessInfo = {
        place_id: suggestion.place_id,
        name: details.name,
        formattedAddress: details.formatted_address,
        phoneNumber: details.formatted_phone_number,
        website: details.website,
        rating: details.rating,
        userRatingsTotal: details.user_ratings_total,
        types: details.types,
        photos:
          details.photos?.map((photo: { photo_reference: string }) => ({
            photoReference: photo.photo_reference,
          })) || [],
        openingHours: details.opening_hours
          ? {
              openNow: details.opening_hours.open_now,
              periods: [],
            }
          : undefined,
      };

      setBusinessInfo(businessData);
      setShowBusinessSearch(false);
      setBusinessSearchQuery("");
      setBusinessSuggestions([]);

      // Save to backend
      if (user?.id) {
        await fetch("/api/business-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            businessInfo: businessData,
          }),
        });
      }
    } catch (error) {
      console.error("Error selecting business:", error);
      showToast.error("Failed to save business information");
    } finally {
      setLoading(false);
    }
  };

  const clearBusinessInfo = () => {
    setBusinessInfo(null);
    setShowBusinessSearch(true);
  };

  const saveAITrainingData = async () => {
    if (
      !user?.id ||
      !newTrainingData.customerScenario ||
      !newTrainingData.desiredResponse
    ) {
      showToast.error(
        "Please fill in both customer scenario and desired response"
      );
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/ai-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          question: newTrainingData.customerScenario,
          answer: newTrainingData.desiredResponse,
          category: newTrainingData.category,
        }),
      });

      if (response.ok) {
        const updatedData = [...aiTrainingData, newTrainingData];
        setAiTrainingData(updatedData);
        setNewTrainingData({
          customerScenario: "",
          desiredResponse: "",
          tone: "professional",
          category: "general",
        });
        setShowTrainingForm(false);
        showToast.success("Training data added successfully");
      } else {
        throw new Error("Failed to save training data");
      }
    } catch (error) {
      console.error("Error saving training data:", error);
      showToast.error("Failed to save training data");
    } finally {
      setSaving(false);
    }
  };

  const deleteTrainingData = async (index: number) => {
    if (!user?.id || !aiTrainingData[index]) return;

    if (!confirm("Are you sure you want to delete this training data?")) {
      return;
    }

    try {
      setSaving(true);
      const dataToDelete = aiTrainingData[index];

      const response = await fetch("/api/ai-training", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          trainingDataId: dataToDelete._id || index, // Use _id if available, otherwise use index
        }),
      });

      if (response.ok) {
        // Remove from local state immediately for better UX
        setAiTrainingData((prev) => prev.filter((_, i) => i !== index));
        showToast.success("Training data deleted successfully");
      } else {
        throw new Error("Failed to delete training data");
      }
    } catch (error) {
      console.error("Error deleting training data:", error);
      showToast.error("Failed to delete training data");
    } finally {
      setSaving(false);
    }
  };

  const saveBrandGuidelines = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const response = await fetch("/api/brand-guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          guidelines: brandGuidelines,
        }),
      });

      if (response.ok) {
        showToast.success("Brand guidelines saved successfully");
      } else {
        throw new Error("Failed to save brand guidelines");
      }
    } catch (error) {
      console.error("Error saving brand guidelines:", error);
      showToast.error("Failed to save brand guidelines");
    } finally {
      setSaving(false);
    }
  };

  const deleteBrandGuidelines = async () => {
    if (!user?.id) return;

    if (
      !confirm(
        "Are you sure you want to delete all brand guidelines? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/brand-guidelines", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        // Reset to default values
        setBrandGuidelines({
          brandVoice: { tone: "professional", style: "", personality: "" },
          communicationStyle: {
            formalityLevel: "",
            responseLength: "",
            useEmojis: false,
            language: "English",
          },
          businessSpecific: {
            keyMessages: [] as string[],
            avoidTopics: [] as string[],
            specialInstructions: "",
          },
          responseGuidelines: {
            greetingStyle: "",
            closingStyle: "",
            escalationTriggers: [] as string[],
            customResponses: [] as Array<{ trigger: string; response: string }>,
          },
        });
        showToast.success("Brand guidelines deleted successfully");
      } else {
        throw new Error("Failed to delete brand guidelines");
      }
    } catch (error) {
      console.error("Error deleting brand guidelines:", error);
      showToast.error("Failed to delete brand guidelines");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Configure your business information, AI behavior, and communication
            preferences
          </p>
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
                  and contact you easily.
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

          {/* Platform & AI Settings */}
          <Card className="p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Communication Settings
                </h2>
                <p className="text-gray-600">
                  Configure AI responses and messaging platforms
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Bot className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Auto AI Response
                      </h3>
                      <p className="text-sm text-gray-600">
                        Automatically generate AI responses to customer messages
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={userSettings.aiGeneratedResponse}
                    onCheckedChange={(checked: boolean) =>
                      saveUserSettings("aiGeneratedResponse", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                      <p className="text-sm text-gray-600">
                        Enable WhatsApp messaging integration
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={userSettings.whatsapp}
                    onCheckedChange={(checked: boolean) =>
                      saveUserSettings("whatsapp", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">SMS</h3>
                      <p className="text-sm text-gray-600">
                        Enable SMS messaging integration
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={userSettings.sms}
                    onCheckedChange={(checked: boolean) =>
                      saveUserSettings("sms", checked)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Settings Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userSettings.aiGeneratedResponse
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-gray-700">
                      AI Responses:{" "}
                      {userSettings.aiGeneratedResponse
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userSettings.whatsapp ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span className="text-gray-700">
                      WhatsApp: {userSettings.whatsapp ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userSettings.sms ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span className="text-gray-700">
                      SMS: {userSettings.sms ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Social Media AI Settings */}
          <Card className="p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Social Media AI Settings
                </h2>
                <p className="text-gray-600">
                  Enable AI-powered auto-replies for customer messages on your
                  social media platforms. Responses are generated instantly when
                  customers send messages.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Facebook AI Toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Facebook AI</h3>
                    <p className="text-sm text-gray-600">
                      AI instantly replies to customer messages on Facebook
                    </p>
                  </div>
                </div>
                <Switch
                  checked={userSettings.socialMediaAI.facebook}
                  onCheckedChange={(checked: boolean) =>
                    saveSocialMediaAISetting("facebook", checked)
                  }
                />
              </div>

              {/* Instagram AI Toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Bot className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Instagram AI
                    </h3>
                    <p className="text-sm text-gray-600">
                      AI instantly replies to customer DMs on Instagram
                    </p>
                  </div>
                </div>
                <Switch
                  checked={userSettings.socialMediaAI.instagram}
                  onCheckedChange={(checked: boolean) =>
                    saveSocialMediaAISetting("instagram", checked)
                  }
                />
              </div>

              {/* Twitter AI Toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Twitter AI</h3>
                    <p className="text-sm text-gray-600">
                      Auto-generate responses for Twitter messages
                    </p>
                  </div>
                </div>
                <Switch
                  checked={userSettings.socialMediaAI.twitter}
                  onCheckedChange={(checked: boolean) =>
                    saveSocialMediaAISetting("twitter", checked)
                  }
                />
              </div>
            </div>

            {/* Status Overview */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Social Media AI Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      userSettings.socialMediaAI.facebook
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className="text-gray-700">
                    Facebook:{" "}
                    {userSettings.socialMediaAI.facebook
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      userSettings.socialMediaAI.instagram
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className="text-gray-700">
                    Instagram:{" "}
                    {userSettings.socialMediaAI.instagram
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      userSettings.socialMediaAI.twitter
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className="text-gray-700">
                    Twitter:{" "}
                    {userSettings.socialMediaAI.twitter
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Brand Guidelines Section */}
          <Card className="p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Brand Guidelines
                  </h2>
                  <p className="text-gray-600">
                    Define your brand voice and communication style for AI
                    responses
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Company Description
                  </label>
                  <textarea
                    value={brandGuidelines.businessSpecific.specialInstructions}
                    onChange={(e) =>
                      setBrandGuidelines({
                        ...brandGuidelines,
                        businessSpecific: {
                          ...brandGuidelines.businessSpecific,
                          specialInstructions: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Briefly describe what your company does and your mission..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Brand Voice Tone
                  </label>
                  <select
                    value={brandGuidelines.brandVoice.tone}
                    onChange={(e) =>
                      setBrandGuidelines({
                        ...brandGuidelines,
                        brandVoice: {
                          ...brandGuidelines.brandVoice,
                          tone: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="enthusiastic">Enthusiastic</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Key Values & Messages
                  </label>
                  <textarea
                    value={brandGuidelines.businessSpecific.keyMessages.join(
                      "\n"
                    )}
                    onChange={(e) =>
                      setBrandGuidelines({
                        ...brandGuidelines,
                        businessSpecific: {
                          ...brandGuidelines.businessSpecific,
                          keyMessages: e.target.value
                            .split("\n")
                            .filter((msg) => msg.trim()),
                        },
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List your key values and important messages (one per line)..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Preferred Greeting
                  </label>
                  <input
                    type="text"
                    value={brandGuidelines.responseGuidelines.greetingStyle}
                    onChange={(e) =>
                      setBrandGuidelines({
                        ...brandGuidelines,
                        responseGuidelines: {
                          ...brandGuidelines.responseGuidelines,
                          greetingStyle: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="How should AI greet customers? e.g., 'Hello! How can I help you today?'"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Do Not Mention
                  </label>
                  <textarea
                    value={brandGuidelines.businessSpecific.avoidTopics.join(
                      "\n"
                    )}
                    onChange={(e) =>
                      setBrandGuidelines({
                        ...brandGuidelines,
                        businessSpecific: {
                          ...brandGuidelines.businessSpecific,
                          avoidTopics: e.target.value
                            .split("\n")
                            .filter((topic) => topic.trim()),
                        },
                      })
                    }
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Topics, competitors, or phrases to avoid..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Escalation Triggers
                  </label>
                  <textarea
                    value={brandGuidelines.responseGuidelines.escalationTriggers.join(
                      "\n"
                    )}
                    onChange={(e) =>
                      setBrandGuidelines({
                        ...brandGuidelines,
                        responseGuidelines: {
                          ...brandGuidelines.responseGuidelines,
                          escalationTriggers: e.target.value
                            .split("\n")
                            .filter((trigger) => trigger.trim()),
                        },
                      })
                    }
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="When should AI escalate to human? e.g., complaints, refunds, technical issues..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button
                onClick={deleteBrandGuidelines}
                disabled={saving}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 hover:scale-105 transition-all px-6 py-3"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
              <Button
                onClick={saveBrandGuidelines}
                disabled={saving}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 hover:scale-105 transition-all px-8 py-3"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Guidelines
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* AI Training Data Section */}
          <Card className="p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    AI Training Data
                  </h2>
                  <p className="text-gray-600">
                    Train the AI with specific scenarios and desired responses
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowTrainingForm(!showTrainingForm)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Add Training Data
              </Button>
            </div>

            {showTrainingForm && (
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl animate-in slide-in-from-top-4 duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  New Training Scenario
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Customer Scenario
                      </label>
                      <textarea
                        value={newTrainingData.customerScenario}
                        onChange={(e) =>
                          setNewTrainingData({
                            ...newTrainingData,
                            customerScenario: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="What might a customer say? e.g., 'I'm having trouble with my order...'"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Category
                      </label>
                      <select
                        value={newTrainingData.category}
                        onChange={(e) =>
                          setNewTrainingData({
                            ...newTrainingData,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="general">General</option>
                        <option value="support">Support</option>
                        <option value="sales">Sales</option>
                        <option value="billing">Billing</option>
                        <option value="technical">Technical</option>
                        <option value="returns">Returns & Refunds</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Desired Response
                      </label>
                      <textarea
                        value={newTrainingData.desiredResponse}
                        onChange={(e) =>
                          setNewTrainingData({
                            ...newTrainingData,
                            desiredResponse: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="How should the AI respond? Be specific about tone and content..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Response Tone
                      </label>
                      <select
                        value={newTrainingData.tone}
                        onChange={(e) =>
                          setNewTrainingData({
                            ...newTrainingData,
                            tone: e.target.value as
                              | "professional"
                              | "friendly"
                              | "casual"
                              | "formal",
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="casual">Casual</option>
                        <option value="formal">Formal</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    onClick={() => setShowTrainingForm(false)}
                    variant="outline"
                    className="hover:scale-105 transition-transform"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveAITrainingData}
                    disabled={
                      saving ||
                      !newTrainingData.customerScenario ||
                      !newTrainingData.desiredResponse
                    }
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Training Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {aiTrainingData.length > 0 ? (
              <div className="space-y-4">
                {aiTrainingData.map((data, index) => (
                  <div
                    key={index}
                    className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          {data.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          {data.tone}
                        </span>
                      </div>
                      <Button
                        onClick={() => deleteTrainingData(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        Delete
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Customer Scenario:
                        </h4>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                          {data.customerScenario}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Desired Response:
                        </h4>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                          {data.desiredResponse}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 animate-in fade-in duration-500">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No training data yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Add training scenarios to help the AI learn your preferred
                  responses to different customer situations.
                </p>
                <Button
                  onClick={() => setShowTrainingForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Add First Training Data
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
