"use client";

import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const plans = [
  {
    name: "Starter",
    price: 99,
    description: "Perfect for small businesses & solo entrepreneurs",
    conversations: "500",
    sms: "1,000",
    users: "1",
    locations: "1",
    storage: "2GB",
    support: "Email support",
    popular: false,
    smsOverage: "$0.02",
    features: [
      { name: "Unified Inbox", included: true },
      { name: "AI Auto Response", value: "Basic" },
      { name: "SMS Integration", included: true },
      { name: "Email Integration", included: true },
      { name: "Social Media Channels", value: "2" },
      { name: "SMS Opt-in Widget", included: true },
      { name: "Quick Response Widget", included: true },
      { name: "Performance Dashboard", value: "Basic" },
      { name: "Mobile App Access", included: true },
      { name: "Conversation Status Tracking", included: true },
      { name: "WhatsApp Integration", included: false },
      { name: "Bulk Messages & Marketing", included: false },
      { name: "Team Collaboration", included: false },
      { name: "Review Management", included: false },
    ],
  },
  {
    name: "Professional",
    price: 199,
    description: "Growing teams & multi-location businesses",
    conversations: "2,000",
    sms: "5,000",
    users: "5",
    locations: "1",
    storage: "10GB",
    support: "24/7 Priority support",
    popular: true,
    smsOverage: "$0.015",
    features: [
      { name: "Unified Inbox", included: true },
      { name: "AI Auto Response", value: "Advanced" },
      { name: "SMS Integration", included: true },
      { name: "Email Integration", included: true },
      { name: "Social Media Channels", value: "Unlimited" },
      { name: "SMS Opt-in Widget", included: true },
      { name: "Quick Response Widget", included: true },
      { name: "Performance Dashboard", value: "Complete" },
      { name: "Mobile App Access", included: true },
      { name: "Conversation Status Tracking", included: true },
      { name: "WhatsApp Integration", included: true },
      { name: "Bulk Messages & Marketing", included: true },
      { name: "Team Collaboration", included: true },
      { name: "Review Management", included: true },
      { name: "AI Training Data", included: true },
      { name: "Social Media Dashboard", included: true },
      { name: "Brand Guidelines Settings", included: true },
      { name: "Calendar Integration", included: true },
      { name: "Lead Source Analytics", included: true },
      { name: "API Access", included: true },
    ],
  },
  {
    name: "Business",
    price: 399,
    description: "Large organizations & multi-location businesses",
    conversations: "10,000",
    sms: "20,000",
    users: "15",
    locations: "5",
    storage: "50GB",
    support: "Priority Account Support",
    popular: false,
    smsOverage: "$0.01",
    features: [
      { name: "Everything in Professional", included: true },
      { name: "AI Auto Response", value: "Custom" },
      { name: "Social Media Channels", value: "Unlimited" },
      { name: "Performance Dashboard", value: "Advanced Analytics" },
      { name: "Custom AI Training", included: true },
      { name: "Advanced Brand Guidelines", included: true },
      { name: "Multi-Location Management", included: true },
      { name: "Custom Widgets", included: true },
      { name: "Personal Assistant Feature", included: true },
      { name: "Call Management", included: true },
      { name: "Custom Integrations", included: true },
      { name: "Advanced Workflows", included: true },
      { name: "SLA Guarantee", value: "99.9%" },
      { name: "Onboarding & Training", included: true },
      { name: "Full API Access", included: true },
    ],
  },
  {
    name: "Enterprise",
    price: null,
    description: "Enterprises, franchises, agencies & high-volume businesses",
    conversations: "Unlimited",
    sms: "Custom",
    users: "Unlimited",
    locations: "Unlimited",
    storage: "Unlimited",
    support: "24/7 Premium Support",
    popular: false,
    smsOverage: "$0.005-$0.01",
    features: [
      { name: "Everything in Business", included: true },
      { name: "White-Label Platform", included: true },
      { name: "Dedicated Account Manager", included: true },
      { name: "Custom AI Development", included: true },
      { name: "Advanced Security", value: "SSO, SAML" },
      { name: "Priority Development", included: true },
      { name: "Custom Integrations", included: true },
      { name: "On-Premise Deployment", included: true },
      { name: "SLA Guarantee", value: "99.99%" },
      { name: "Quarterly Business Reviews", included: true },
      { name: "Data Migration Assistance", included: true },
      { name: "Volume SMS Discounts", included: true },
    ],
  },
];

const addOns = [
  { name: "Extra user seat", price: "$20/month" },
  { name: "Additional 1,000 conversations", price: "$30/month" },
  { name: "SMS bundle (5,000 messages)", price: "$75/month" },
  { name: "SMS bundle (10,000 messages)", price: "$120/month" },
  { name: "Extra social media channel", price: "$15/month" },
  { name: "Advanced widget customization", price: "$49 one-time" },
  { name: "Premium AI training session", price: "$99 one-time" },
  { name: "Additional location", price: "$50/month" },
];

export default function PricingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-600 hover:bg-blue-700">
            Pricing Plans
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Unified communication platform with SMS, email, WhatsApp, and social
            media management
          </p>
        </div>

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col ${
                    plan.popular
                      ? "border-blue-600 border-2 shadow-2xl scale-105"
                      : "border-slate-200 hover:border-slate-300"
                  } transition-all duration-300 hover:shadow-xl`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      {plan.price ? (
                        <>
                          <span className="text-4xl font-bold">
                            ${plan.price}
                          </span>
                          <span className="text-slate-600">/month</span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold">Custom</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-grow space-y-4">
                    <div className="space-y-2 pb-4 border-b border-slate-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Conversations</span>
                        <span className="font-semibold">
                          {plan.conversations}/mo
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">SMS Messages</span>
                        <span className="font-semibold">{plan.sms}/mo</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">User Seats</span>
                        <span className="font-semibold">{plan.users}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Locations</span>
                        <span className="font-semibold">{plan.locations}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Storage</span>
                        <span className="font-semibold">{plan.storage}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plan.features.slice(0, 6).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          {feature.included || feature.value ? (
                            <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
                          )}
                          <span className="text-sm text-slate-700">
                            {feature.name}
                            {feature.value && (
                              <span className="text-slate-500">
                                {" "}
                                - {feature.value}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-xs text-slate-500">
                      SMS Overage: {plan.smsOverage}/message
                    </div>
                  </CardContent>

                  <CardFooter className="pt-6">
                    {plan.name === "Enterprise" ? (
                      <Button
                        className="w-full bg-slate-900 hover:bg-slate-800"
                        size="lg"
                      >
                        Contact Sales
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-slate-900 hover:bg-slate-800"
                        }`}
                        size="lg"
                        onClick={() => router.push("/dashboard")}
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Card className="mb-16 border-slate-200">
              <CardHeader>
                <CardTitle>Add-ons Available</CardTitle>
                <CardDescription>
                  Customize your plan with these additional features (Available
                  for Starter, Professional & Business plans)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {addOns.map((addon, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {addon.name}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {addon.price}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Feature Comparison</CardTitle>
                <CardDescription>
                  Compare all features across different plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-4 font-semibold text-slate-900">
                          Feature
                        </th>
                        <th className="text-center py-4 px-4 font-semibold text-slate-900">
                          Starter
                        </th>
                        <th className="text-center py-4 px-4 font-semibold text-slate-900 bg-blue-50">
                          Professional
                        </th>
                        <th className="text-center py-4 px-4 font-semibold text-slate-900">
                          Business
                        </th>
                        <th className="text-center py-4 px-4 font-semibold text-slate-900">
                          Enterprise
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Conversations/month
                        </td>
                        <td className="py-3 px-4 text-center text-sm">500</td>
                        <td className="py-3 px-4 text-center text-sm bg-blue-50">
                          2,000
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          10,000
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Unlimited
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          SMS Messages/month
                        </td>
                        <td className="py-3 px-4 text-center text-sm">1,000</td>
                        <td className="py-3 px-4 text-center text-sm bg-blue-50">
                          5,000
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          20,000
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Custom
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          User Seats
                        </td>
                        <td className="py-3 px-4 text-center text-sm">1</td>
                        <td className="py-3 px-4 text-center text-sm bg-blue-50">
                          5
                        </td>
                        <td className="py-3 px-4 text-center text-sm">15</td>
                        <td className="py-3 px-4 text-center text-sm">
                          Unlimited
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Locations
                        </td>
                        <td className="py-3 px-4 text-center text-sm">1</td>
                        <td className="py-3 px-4 text-center text-sm bg-blue-50">
                          1
                        </td>
                        <td className="py-3 px-4 text-center text-sm">5</td>
                        <td className="py-3 px-4 text-center text-sm">
                          Unlimited
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Unified Inbox
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          AI Auto Response
                        </td>
                        <td className="py-3 px-4 text-center text-sm">Basic</td>
                        <td className="py-3 px-4 text-center text-sm bg-blue-50">
                          Advanced
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Custom
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Enterprise AI
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          SMS Integration
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Email Integration
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          WhatsApp
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Social Media Channels
                        </td>
                        <td className="py-3 px-4 text-center text-sm">2</td>
                        <td className="py-3 px-4 text-center text-sm bg-blue-50">
                          Unlimited
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Unlimited
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Unlimited
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Social Media Dashboard
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          SMS Opt-in Widget
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Custom
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          White-label
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Quick Response Widget
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Custom
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          White-label
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Bulk Messages
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Marketing Campaigns
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Performance Dashboard
                        </td>
                        <td className="py-3 px-4 text-center text-sm">Basic</td>
                        <td className="py-3 px-4 text-center text-sm bg-blue-50">
                          Complete
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Advanced
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Custom Reports
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          AI Performance Tracking
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Team Performance
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Review Management
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Brand Guidelines
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Multiple
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          White-label
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          AI Training Data
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Custom
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Enterprise
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Calendar Integration
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Personal Assistant
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Call Tracking
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          API Access
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center text-sm bg-blue-50">
                          Basic
                        </td>
                        <td className="py-3 px-4 text-center text-sm">Full</td>
                        <td className="py-3 px-4 text-center text-sm">
                          Custom
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Support
                        </td>
                        <td className="py-3 px-4 text-center text-sm">Email</td>
                        <td className="py-3 px-4 text-center text-sm bg-blue-50">
                          24/7 Chat
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Priority
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          Dedicated Manager
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          SLA
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center bg-blue-50">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center text-sm">99.9%</td>
                        <td className="py-3 px-4 text-center text-sm">
                          99.99%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Storage
                        </td>
                        <td className="py-3 px-4 text-center text-sm">2GB</td>
                        <td className="py-3 px-4 text-center text-sm bg-blue-50">
                          10GB
                        </td>
                        <td className="py-3 px-4 text-center text-sm">50GB</td>
                        <td className="py-3 px-4 text-center text-sm">
                          Unlimited
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 p-6 bg-slate-900 rounded-xl text-white">
              <h3 className="text-xl font-bold mb-4">SMS Pricing Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Starter</div>
                  <div className="text-2xl font-bold mb-2">1,000</div>
                  <div className="text-xs text-slate-400">
                    SMS/month included
                  </div>
                  <div className="text-sm mt-2 text-slate-300">
                    Overage: $0.02/msg
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border-2 border-blue-600">
                  <div className="text-sm text-slate-400 mb-1">
                    Professional
                  </div>
                  <div className="text-2xl font-bold mb-2">5,000</div>
                  <div className="text-xs text-slate-400">
                    SMS/month included
                  </div>
                  <div className="text-sm mt-2 text-slate-300">
                    Overage: $0.015/msg
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Business</div>
                  <div className="text-2xl font-bold mb-2">20,000</div>
                  <div className="text-xs text-slate-400">
                    SMS/month included
                  </div>
                  <div className="text-sm mt-2 text-slate-300">
                    Overage: $0.01/msg
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Enterprise</div>
                  <div className="text-2xl font-bold mb-2">Custom</div>
                  <div className="text-xs text-slate-400">Volume pricing</div>
                  <div className="text-sm mt-2 text-slate-300">
                    From $0.005/msg
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-slate-600 mb-6">
            Our team is here to help you choose the right plan
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
