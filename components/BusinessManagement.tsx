import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
// Simple toast implementation
const toast = {
  success: (message: string) => alert(`✅ ${message}`),
  error: (message: string) => alert(`❌ ${message}`),
};
import {
  Building,
  Plus,
  Settings,
  BarChart3,
  Users,
  Star,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Zap,
  Shield,
} from "lucide-react";

interface Business {
  _id: string;
  name: string;
  description: string;
  industry: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: "active" | "inactive" | "suspended";
  subscription: {
    plan: "trial" | "basic" | "pro" | "enterprise";
    status: string;
    expiresAt: Date;
  };
  platforms: {
    google: {
      enabled: boolean;
      lastSyncAt: Date;
      syncStatus: "active" | "error" | "pending";
    };
    yelp: {
      enabled: boolean;
      lastSyncAt: Date;
      syncStatus: "active" | "error" | "pending";
    };
    facebook: {
      enabled: boolean;
      lastSyncAt: Date;
      syncStatus: "active" | "error" | "pending";
    };
  };
  metrics: {
    totalReviews: number;
    averageRating: number;
    responseRate: number;
    aiResponsesGenerated: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface BusinessStats {
  reviews: {
    total: number;
    averageRating: number;
    ratingDistribution: { [key: string]: number };
    platformDistribution: { [key: string]: number };
    newReviews: number;
    repliedReviews: number;
    responseRate: number;
  };
  responses: {
    total: number;
    aiGenerated: number;
    manual: number;
    averageResponseTime: number;
    aiUsagePercentage: number;
  };
}

const BusinessManagement: React.FC = () => {
  const { getToken } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [businessStats, setBusinessStats] = useState<BusinessStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    description: "",
    industry: "",
    email: "",
    phone: "",
    website: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
    },
  });

  const industries = [
    "Restaurant",
    "Retail",
    "Healthcare",
    "Professional Services",
    "Beauty & Wellness",
    "Automotive",
    "Real Estate",
    "Education",
    "Technology",
    "Entertainment",
    "Travel & Hospitality",
    "Other",
  ];

  const fetchBusinesses = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/v1/business", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses);
        if (data.businesses.length > 0 && !selectedBusiness) {
          setSelectedBusiness(data.businesses[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  }, [getToken, selectedBusiness]);

  const fetchBusinessStats = useCallback(
    async (businessId: string) => {
      try {
        const token = await getToken();
        const response = await fetch(`/api/v1/business/${businessId}/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBusinessStats(data);
        }
      } catch (error) {
        console.error("Error fetching business stats:", error);
      }
    },
    [getToken]
  );

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchBusinessStats(selectedBusiness._id);
    }
  }, [selectedBusiness, fetchBusinessStats]);

  const createBusiness = async () => {
    if (!newBusiness.name || !newBusiness.industry) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/v1/business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBusiness),
      });

      if (response.ok) {
        await response.json();
        toast.success("Business created successfully!");
        setShowCreateDialog(false);
        setNewBusiness({
          name: "",
          description: "",
          industry: "",
          email: "",
          phone: "",
          website: "",
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "US",
          },
        });
        fetchBusinesses();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create business");
      }
    } catch (error) {
      console.error("Error creating business:", error);
      toast.error("Failed to create business");
    } finally {
      setCreating(false);
    }
  };

  const syncGoogleReviews = async () => {
    if (!selectedBusiness) return;

    setSyncing(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/v1/reviews/sync/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ businessId: selectedBusiness._id }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Sync completed! ${data.result?.syncedReviews || 0} reviews processed`
        );
        fetchBusinessStats(selectedBusiness._id);
      } else {
        const error = await response.json();
        toast.error(error.message || "Sync failed");
      }
    } catch (error) {
      console.error("Error syncing reviews:", error);
      toast.error("Failed to sync reviews");
    } finally {
      setSyncing(false);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "basic":
        return "bg-green-100 text-green-800";
      case "pro":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-gold-100 text-gold-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Business Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your businesses and review platforms
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Business
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Business</DialogTitle>
              <DialogDescription>
                Add a new business to start managing reviews and responses.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={newBusiness.name}
                    onChange={(e) =>
                      setNewBusiness({ ...newBusiness, name: e.target.value })
                    }
                    placeholder="Your Business Name"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    value={newBusiness.industry}
                    onValueChange={(value) =>
                      setNewBusiness({ ...newBusiness, industry: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newBusiness.description}
                  onChange={(e) =>
                    setNewBusiness({
                      ...newBusiness,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of your business"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newBusiness.email}
                    onChange={(e) =>
                      setNewBusiness({ ...newBusiness, email: e.target.value })
                    }
                    placeholder="business@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newBusiness.phone}
                    onChange={(e) =>
                      setNewBusiness({ ...newBusiness, phone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={newBusiness.website}
                  onChange={(e) =>
                    setNewBusiness({ ...newBusiness, website: e.target.value })
                  }
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={createBusiness} disabled={creating}>
                {creating ? "Creating..." : "Create Business"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No businesses found
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first business to start managing reviews
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Business
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Business Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Your Businesses</CardTitle>
              <CardDescription>
                Select a business to view details and manage reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {businesses.map((business) => (
                  <div
                    key={business._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedBusiness?._id === business._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedBusiness(business)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {business.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {business.industry}
                        </p>
                      </div>
                      <Badge
                        className={getPlanBadgeColor(
                          business.subscription.plan
                        )}
                      >
                        {business.subscription.plan}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {business.metrics.averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        {business.metrics.totalReviews} reviews
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          {selectedBusiness && (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="platforms">Platforms</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Star className="h-8 w-8 text-yellow-400" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            Average Rating
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {businessStats?.reviews.averageRating.toFixed(1) ||
                              selectedBusiness.metrics.averageRating.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-blue-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            Total Reviews
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {businessStats?.reviews.total ||
                              selectedBusiness.metrics.totalReviews}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-green-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            Response Rate
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {businessStats?.reviews.responseRate ||
                              selectedBusiness.metrics.responseRate}
                            %
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Zap className="h-8 w-8 text-purple-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            AI Responses
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {businessStats?.responses.aiGenerated ||
                              selectedBusiness.metrics.aiResponsesGenerated}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest updates for {selectedBusiness.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Google My Business</p>
                          <p className="text-sm text-gray-600">
                            Last synced:{" "}
                            {selectedBusiness.platforms.google.lastSyncAt
                              ? new Date(
                                  selectedBusiness.platforms.google.lastSyncAt
                                ).toLocaleDateString()
                              : "Never"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getStatusBadgeColor(
                              selectedBusiness.platforms.google.syncStatus
                            )}
                          >
                            {selectedBusiness.platforms.google.syncStatus}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={syncGoogleReviews}
                            disabled={syncing}
                          >
                            {syncing ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            Sync Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="platforms">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Integrations</CardTitle>
                    <CardDescription>
                      Manage your review platform connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Google My Business */}
                      <div className="flex items-center justify-between p-6 border rounded-lg">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Shield className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium">Google My Business</h3>
                            <p className="text-sm text-gray-600">
                              Manage reviews from Google Business Profile
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={getStatusBadgeColor(
                              selectedBusiness.platforms.google.syncStatus
                            )}
                          >
                            {selectedBusiness.platforms.google.enabled
                              ? "Connected"
                              : "Not Connected"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        </div>
                      </div>

                      {/* Yelp */}
                      <div className="flex items-center justify-between p-6 border rounded-lg opacity-60">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <Star className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium">Yelp</h3>
                            <p className="text-sm text-gray-600">
                              Coming soon - Yelp review management
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Coming Soon</Badge>
                      </div>

                      {/* Facebook */}
                      <div className="flex items-center justify-between p-6 border rounded-lg opacity-60">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium">Facebook</h3>
                            <p className="text-sm text-gray-600">
                              Coming soon - Facebook review management
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Coming Soon</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid gap-6">
                  {businessStats && (
                    <>
                      {/* Rating Distribution */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Rating Distribution</CardTitle>
                          <CardDescription>
                            Breakdown of review ratings
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {Object.entries(
                              businessStats.reviews.ratingDistribution
                            )
                              .sort(([a], [b]) => parseInt(b) - parseInt(a))
                              .map(([rating, count]) => (
                                <div
                                  key={rating}
                                  className="flex items-center gap-3"
                                >
                                  <div className="flex items-center gap-1 w-12">
                                    <span className="text-sm font-medium">
                                      {rating}
                                    </span>
                                    <Star className="h-3 w-3 text-yellow-400" />
                                  </div>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{
                                        width: `${
                                          businessStats.reviews.total > 0
                                            ? (count /
                                                businessStats.reviews.total) *
                                              100
                                            : 0
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600 w-8">
                                    {count}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Platform Distribution */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Platform Distribution</CardTitle>
                          <CardDescription>Reviews by platform</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {Object.entries(
                              businessStats.reviews.platformDistribution
                            ).map(([platform, count]) => (
                              <div
                                key={platform}
                                className="flex items-center justify-between"
                              >
                                <span className="capitalize font-medium">
                                  {platform}
                                </span>
                                <Badge variant="outline">{count} reviews</Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Settings</CardTitle>
                    <CardDescription>
                      Manage your business information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Business Name</Label>
                          <Input value={selectedBusiness.name} readOnly />
                        </div>
                        <div>
                          <Label>Industry</Label>
                          <Input value={selectedBusiness.industry} readOnly />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={selectedBusiness.email || ""}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={selectedBusiness.phone || ""}
                            readOnly
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Website</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={selectedBusiness.website || ""}
                            readOnly
                          />
                          {selectedBusiness.website && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={selectedBusiness.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <Button variant="outline">
                          Edit Business Information
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessManagement;
