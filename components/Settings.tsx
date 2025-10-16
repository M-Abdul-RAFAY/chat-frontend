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
    whatsapp: boolean;
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
      whatsapp: false,
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
    businessInfo: {
      businessName: "",
      phoneNumber: "",
      email: "",
      websiteUrl: "",
      businessType: "",
      industry: "",
      targetAudience: "",
    },
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
            whatsapp: settings.socialMediaAI?.whatsapp ?? false,
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
        const backendTrainingData =
          data.data?.trainingData || data.trainingData || [];

        const mappedTrainingData = backendTrainingData.map(
          (item: BackendTrainingData) => ({
            customerScenario: item.question || "",
            desiredResponse: item.answer || "",
            category: item.category || "general",
            tone: "professional" as const,
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
          trainingDataId: dataToDelete._id || index,
        }),
      });

      if (response.ok) {
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
        setBrandGuidelines({
          businessInfo: {
            businessName: "",
            phoneNumber: "",
            email: "",
            websiteUrl: "",
            businessType: "",
            industry: "",
            targetAudience: "",
          },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl shadow-lg">
              <SettingsIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-lg text-gray-600 ml-1">
            Configure your business information, AI behavior, and communication
            preferences
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Settings */}
          <div className="xl:col-span-2 space-y-6">
            {/* Business Information Section */}
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Business Information
                    </h2>
                    <p className="text-sm text-gray-500">
                      Connect your Google Business Profile
                    </p>
                  </div>
                </div>
                {businessInfo ? (
                  <Button
                    onClick={clearBusinessInfo}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Change
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowBusinessSearch(true)}
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    <Search className="w-4 h-4 mr-1.5" />
                    Add Business
                  </Button>
                )}
              </div>

              {businessInfo ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                    {businessInfo.photos && businessInfo.photos.length > 0 && (
                      <Image
                        src={googlePlacesAPI.getPhotoUrl(
                          businessInfo.photos[0].photoReference,
                          100
                        )}
                        alt={businessInfo.name || "Business"}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover shadow-sm"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1.5">
                        {businessInfo.name}
                      </h3>
                      {businessInfo.rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(businessInfo.rating!)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-sm text-gray-900">
                            {businessInfo.rating}
                          </span>
                          {businessInfo.userRatingsTotal && (
                            <span className="text-sm text-gray-500">
                              ({businessInfo.userRatingsTotal})
                            </span>
                          )}
                        </div>
                      )}
                      {businessInfo.types && businessInfo.types.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {businessInfo.types.slice(0, 3).map((type, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded-md font-medium border border-gray-200"
                            >
                              {type.replace(/_/g, " ").toLowerCase()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {businessInfo.formattedAddress && (
                      <div className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-gray-200">
                        <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-xs text-gray-500 mb-0.5">
                            Address
                          </p>
                          <p className="text-sm text-gray-900">
                            {businessInfo.formattedAddress}
                          </p>
                        </div>
                      </div>
                    )}

                    {businessInfo.phoneNumber && (
                      <div className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-gray-200">
                        <Phone className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-xs text-gray-500 mb-0.5">
                            Phone
                          </p>
                          <p className="text-sm text-gray-900">
                            {businessInfo.phoneNumber}
                          </p>
                        </div>
                      </div>
                    )}

                    {businessInfo.website && (
                      <div className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-gray-200">
                        <Globe className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-xs text-gray-500 mb-0.5">
                            Website
                          </p>
                          <a
                            href={businessInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            Visit Website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {businessInfo.openingHours && (
                      <div className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-gray-200">
                        <Clock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-xs text-gray-500 mb-0.5">
                            Status
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-sm font-medium ${
                              businessInfo.openingHours.openNow
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
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
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for your business on Google..."
                      value={businessSearchQuery}
                      onChange={(e) => handleBusinessSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
                    />
                    {loadingSuggestions && (
                      <RefreshCw className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    )}
                  </div>

                  {businessSuggestions.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                      {businessSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.place_id}
                          onClick={() => handleBusinessSelection(suggestion)}
                          className="w-full text-left p-3 hover:bg-slate-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-sm text-gray-900 mb-0.5">
                            {suggestion.structured_formatting.main_text}
                          </div>
                          <div className="text-xs text-gray-500">
                            {suggestion.structured_formatting.secondary_text}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => setShowBusinessSearch(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    No business information yet
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Connect your Google Business Profile
                  </p>
                  <Button
                    onClick={() => setShowBusinessSearch(true)}
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    <Search className="w-4 h-4 mr-1.5" />
                    Search for Business
                  </Button>
                </div>
              )}
            </Card>

            {/* AI Training Data Section */}
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      AI Training Data
                    </h2>
                    <p className="text-sm text-gray-500">
                      Train AI with specific scenarios
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowTrainingForm(!showTrainingForm)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Add Training
                </Button>
              </div>

              {showTrainingForm && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    New Training Scenario
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
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
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="What might a customer say?"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
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
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="How should the AI respond?"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="general">General</option>
                          <option value="support">Support</option>
                          <option value="sales">Sales</option>
                          <option value="billing">Billing</option>
                          <option value="technical">Technical</option>
                          <option value="returns">Returns & Refunds</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tone
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="professional">Professional</option>
                          <option value="friendly">Friendly</option>
                          <option value="casual">Casual</option>
                          <option value="formal">Formal</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      onClick={() => setShowTrainingForm(false)}
                      variant="outline"
                      size="sm"
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
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1.5" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {aiTrainingData.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {aiTrainingData.map((data, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                            {data.category}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            {data.tone}
                          </span>
                        </div>
                        <Button
                          onClick={() => deleteTrainingData(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 h-7 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium text-xs text-gray-500 mb-1">
                            Scenario:
                          </h4>
                          <p className="text-sm text-gray-900">
                            {data.customerScenario}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-xs text-gray-500 mb-1">
                            Response:
                          </h4>
                          <p className="text-sm text-gray-900">
                            {data.desiredResponse}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-3 bg-purple-50 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    No training data yet
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Add training scenarios to help AI learn
                  </p>
                  <Button
                    onClick={() => setShowTrainingForm(true)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Add First Training Data
                  </Button>
                </div>
              )}
            </Card>

            {/* Brand Guidelines Section */}
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Brand Guidelines
                    </h2>
                    <p className="text-sm text-gray-500">
                      Define your brand voice and style
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Business Info Section */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-600" />
                    Business Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={brandGuidelines.businessInfo.businessName}
                        onChange={(e) =>
                          setBrandGuidelines({
                            ...brandGuidelines,
                            businessInfo: {
                              ...brandGuidelines.businessInfo,
                              businessName: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Your business name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Business Type
                      </label>
                      <select
                        value={brandGuidelines.businessInfo.businessType}
                        onChange={(e) =>
                          setBrandGuidelines({
                            ...brandGuidelines,
                            businessInfo: {
                              ...brandGuidelines.businessInfo,
                              businessType: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select type</option>
                        <option value="B2B">B2B</option>
                        <option value="B2C">B2C</option>
                        <option value="B2B2C">B2B2C</option>
                        <option value="C2C">C2C</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={brandGuidelines.businessInfo.phoneNumber}
                        onChange={(e) =>
                          setBrandGuidelines({
                            ...brandGuidelines,
                            businessInfo: {
                              ...brandGuidelines.businessInfo,
                              phoneNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={brandGuidelines.businessInfo.email}
                        onChange={(e) =>
                          setBrandGuidelines({
                            ...brandGuidelines,
                            businessInfo: {
                              ...brandGuidelines.businessInfo,
                              email: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="contact@company.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={brandGuidelines.businessInfo.websiteUrl}
                        onChange={(e) =>
                          setBrandGuidelines({
                            ...brandGuidelines,
                            businessInfo: {
                              ...brandGuidelines.businessInfo,
                              websiteUrl: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="https://www.yourcompany.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={brandGuidelines.businessInfo.industry}
                        onChange={(e) =>
                          setBrandGuidelines({
                            ...brandGuidelines,
                            businessInfo: {
                              ...brandGuidelines.businessInfo,
                              industry: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Technology, Healthcare, Retail"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Target Audience
                      </label>
                      <textarea
                        value={brandGuidelines.businessInfo.targetAudience}
                        onChange={(e) =>
                          setBrandGuidelines({
                            ...brandGuidelines,
                            businessInfo: {
                              ...brandGuidelines.businessInfo,
                              targetAudience: e.target.value,
                            },
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Describe your target customers..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
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
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="What does your company do?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="enthusiastic">Enthusiastic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., Hello! How can I help?"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Key Values & Messages (one per line)
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
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="List key values and messages..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Do Not Mention (one per line)
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Topics or phrases to avoid..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Escalation Triggers (one per line)
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="When to escalate to human..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={deleteBrandGuidelines}
                  disabled={saving}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete All
                </Button>
                <Button
                  onClick={saveBrandGuidelines}
                  disabled={saving}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" />
                      Save Guidelines
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Communication Settings */}
          <div className="space-y-6">
            {/* Platform & AI Settings */}
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Communication
                  </h2>
                  <p className="text-sm text-gray-500">
                    AI and messaging settings
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">
                        Auto AI Response
                      </h3>
                      <p className="text-xs text-gray-600">
                        Generate AI responses automatically
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

                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">
                        WhatsApp
                      </h3>
                      <p className="text-xs text-gray-600">
                        Enable WhatsApp integration
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

                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">SMS</h3>
                      <p className="text-xs text-gray-600">
                        Enable SMS integration
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

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 mb-2">
                  STATUS
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userSettings.aiGeneratedResponse
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-gray-700">
                      AI Responses:{" "}
                      {userSettings.aiGeneratedResponse ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userSettings.whatsapp ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span className="text-gray-700">
                      WhatsApp: {userSettings.whatsapp ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userSettings.sms ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span className="text-gray-700">
                      SMS: {userSettings.sms ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Social Media AI Settings */}
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Social Media AI
                  </h2>
                  <p className="text-sm text-gray-500">Auto-reply settings</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">
                        Facebook AI
                      </h3>
                      <p className="text-xs text-gray-600">
                        Auto-reply to messages
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

                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-pink-600" />
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">
                        Instagram AI
                      </h3>
                      <p className="text-xs text-gray-600">Auto-reply to DMs</p>
                    </div>
                  </div>
                  <Switch
                    checked={userSettings.socialMediaAI.instagram}
                    onCheckedChange={(checked: boolean) =>
                      saveSocialMediaAISetting("instagram", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-cyan-600" />
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">
                        WhatsApp AI
                      </h3>
                      <p className="text-xs text-gray-600">
                        Auto-generate responses
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={userSettings.socialMediaAI.whatsapp}
                    onCheckedChange={(checked: boolean) =>
                      saveSocialMediaAISetting("whatsapp", checked)
                    }
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 mb-2">
                  STATUS
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
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
                        ? "Active"
                        : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
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
                        ? "Active"
                        : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userSettings.socialMediaAI.whatsapp
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-gray-700">
                      WhatsApp:{" "}
                      {userSettings.socialMediaAI.whatsapp
                        ? "Active"
                        : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
