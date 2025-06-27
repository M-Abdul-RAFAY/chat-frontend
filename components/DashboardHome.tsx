"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Car,
  Calendar,
  DollarSign,
  MessageSquare,
  Clock,
  TrendingUp,
  Phone,
  ChevronRight,
  HelpCircle,
  Target,
  Award,
  RefreshCw,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  showInfo?: boolean;
  link?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

interface TeamMember {
  id: string;
  name: string;
  phoneCalls: number;
  conversations: number;
  responseTime: string;
  trend: "up" | "down" | "neutral";
}

interface LeadSource {
  id: string;
  name: string;
  leads: number;
  percentage: number;
  trend: "up" | "down" | "neutral";
}

interface JerryMetrics {
  testDrives: number;
  testDrivesAfterHours: number;
  vehicleSales: number;
  serviceAppointments: number;
  serviceAppointmentsAfterHours: number;
  serviceSales: number;
  messagesSent: number;
  timeSaved: string;
}

interface DealershipMetrics {
  totalLeads: number;
  leadSources: LeadSource[];
}

interface TeamMetrics {
  totalPhoneCalls: number;
  totalConversations: number;
  medianResponse: string;
  members: TeamMember[];
}

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  showInfo = true,
  link,
  trend,
  trendValue,
}: MetricCardProps) => (
  <Card className="relative hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-gray-100">{icon}</div>
        <span className="hidden sm:inline">{title}</span>
        <span className="sm:hidden text-xs">
          {title.split(" ").slice(0, 2).join(" ")}
        </span>
        {showInfo && (
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
        )}
      </CardTitle>
      {trend && trendValue && (
        <Badge
          variant={
            trend === "up"
              ? "default"
              : trend === "down"
              ? "destructive"
              : "secondary"
          }
          className="text-xs"
        >
          {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
        </Badge>
      )}
    </CardHeader>
    <CardContent>
      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        {value}
      </div>
      {subtitle && (
        <p className="text-xs sm:text-sm text-gray-500 mb-2">{subtitle}</p>
      )}
      {link && (
        <Button
          variant="link"
          className="p-0 h-auto text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">{link}</span>
          <span className="sm:hidden">View Reports</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
        </Button>
      )}
    </CardContent>
  </Card>
);

export default function DashboardHome() {
  const [timeFilter, setTimeFilter] = useState("This month");
  const [dealershipFilter, setDealershipFilter] = useState("Last 30 days");
  const [teamFilter, setTeamFilter] = useState("This month");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Dynamic state for all metrics
  const [jerryMetrics, setJerryMetrics] = useState<JerryMetrics>({
    testDrives: 145,
    testDrivesAfterHours: 41,
    vehicleSales: 98,
    serviceAppointments: 202,
    serviceAppointmentsAfterHours: 41,
    serviceSales: 65,
    messagesSent: 8472,
    timeSaved: "282h 24m",
  });

  const [dealershipMetrics, setDealershipMetrics] = useState<DealershipMetrics>(
    {
      totalLeads: 6801,
      leadSources: [
        {
          id: "1",
          name: "VinSolutions",
          leads: 3430,
          percentage: 50.4,
          trend: "up",
        },
        { id: "2", name: "Text", leads: 1769, percentage: 26.0, trend: "up" },
        {
          id: "3",
          name: "Email",
          leads: 784,
          percentage: 11.5,
          trend: "neutral",
        },
        {
          id: "4",
          name: "Webchat",
          leads: 725,
          percentage: 10.7,
          trend: "down",
        },
        {
          id: "5",
          name: "Facebook Messenger",
          leads: 84,
          percentage: 1.2,
          trend: "up",
        },
      ],
    }
  );

  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics>({
    totalPhoneCalls: 297,
    totalConversations: 350,
    medianResponse: "5m 15s",
    members: [
      {
        id: "1",
        name: "Cameron Williamson",
        phoneCalls: 42,
        conversations: 59,
        responseTime: "2m 23s",
        trend: "up",
      },
      {
        id: "2",
        name: "Bessie Cooper",
        phoneCalls: 41,
        conversations: 56,
        responseTime: "2m 45s",
        trend: "up",
      },
      {
        id: "3",
        name: "Jerome Bell",
        phoneCalls: 38,
        conversations: 47,
        responseTime: "3m 16s",
        trend: "neutral",
      },
      {
        id: "4",
        name: "Savannah Nguyen",
        phoneCalls: 34,
        conversations: 50,
        responseTime: "5m 47s",
        trend: "down",
      },
      {
        id: "5",
        name: "Floyd Miles",
        phoneCalls: 31,
        conversations: 38,
        responseTime: "5m 55s",
        trend: "down",
      },
      {
        id: "6",
        name: "Darrel Steward",
        phoneCalls: 30,
        conversations: 33,
        responseTime: "5m 58s",
        trend: "neutral",
      },
      {
        id: "7",
        name: "Kristine Casillas",
        phoneCalls: 27,
        conversations: 29,
        responseTime: "7m 13s",
        trend: "up",
      },
    ],
  });

  // Simulate real-time data updates
  const refreshData = async () => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update Jerry's metrics with random variations
    setJerryMetrics((prev) => ({
      testDrives: prev.testDrives + Math.floor(Math.random() * 10) - 5,
      testDrivesAfterHours:
        prev.testDrivesAfterHours + Math.floor(Math.random() * 5) - 2,
      vehicleSales: prev.vehicleSales + Math.floor(Math.random() * 8) - 4,
      serviceAppointments:
        prev.serviceAppointments + Math.floor(Math.random() * 15) - 7,
      serviceAppointmentsAfterHours:
        prev.serviceAppointmentsAfterHours + Math.floor(Math.random() * 5) - 2,
      serviceSales: prev.serviceSales + Math.floor(Math.random() * 6) - 3,
      messagesSent: prev.messagesSent + Math.floor(Math.random() * 100) - 50,
      timeSaved: `${280 + Math.floor(Math.random() * 20)}h ${
        20 + Math.floor(Math.random() * 40)
      }m`,
    }));

    // Update dealership metrics
    setDealershipMetrics((prev) => ({
      totalLeads: prev.totalLeads + Math.floor(Math.random() * 50) - 25,
      leadSources: prev.leadSources.map((source) => ({
        ...source,
        leads: source.leads + Math.floor(Math.random() * 20) - 10,
        trend: ["up", "down", "neutral"][Math.floor(Math.random() * 3)] as
          | "up"
          | "down"
          | "neutral",
      })),
    }));

    // Update team metrics
    setTeamMetrics((prev) => ({
      totalPhoneCalls:
        prev.totalPhoneCalls + Math.floor(Math.random() * 20) - 10,
      totalConversations:
        prev.totalConversations + Math.floor(Math.random() * 25) - 12,
      medianResponse: `${5 + Math.floor(Math.random() * 3)}m ${
        10 + Math.floor(Math.random() * 50)
      }s`,
      members: prev.members.map((member) => ({
        ...member,
        phoneCalls: Math.max(
          0,
          member.phoneCalls + Math.floor(Math.random() * 6) - 3
        ),
        conversations: Math.max(
          0,
          member.conversations + Math.floor(Math.random() * 8) - 4
        ),
        responseTime: `${Math.floor(Math.random() * 8) + 1}m ${Math.floor(
          Math.random() * 60
        )}s`,
        trend: ["up", "down", "neutral"][Math.floor(Math.random() * 3)] as
          | "up"
          | "down"
          | "neutral",
      })),
    }));

    setLastUpdated(new Date());
    setIsLoading(false);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update data when filters change
  useEffect(() => {
    refreshData();
  }, [timeFilter, dealershipFilter, teamFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header with refresh button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Performance Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <Button
            onClick={refreshData}
            disabled={isLoading}
            className="w-full sm:w-auto"
            variant="outline"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Updating..." : "Refresh Data"}
          </Button>
        </div>

        {/* Jerry's Performance Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm border-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Jerry's AI Performance
                </h2>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Automated customer engagement metrics
                </p>
              </div>
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This month">This month</SelectItem>
                <SelectItem value="Last month">Last month</SelectItem>
                <SelectItem value="Last 3 months">Last 3 months</SelectItem>
                <SelectItem value="Last 6 months">Last 6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <MetricCard
              title="AI Test Drives Scheduled"
              value={jerryMetrics.testDrives}
              subtitle={`${jerryMetrics.testDrivesAfterHours} scheduled after-hours • Last 30 days`}
              icon={<Calendar className="w-4 h-4 text-blue-600" />}
              link="View Jerry's Performance reports"
              trend="up"
              trendValue="12%"
            />
            <MetricCard
              title="AI Vehicle Sales"
              value={jerryMetrics.vehicleSales}
              subtitle="Last 30 days"
              icon={<Car className="w-4 h-4 text-green-600" />}
              trend="up"
              trendValue="8%"
            />
            <MetricCard
              title="AI Service Appointments Set"
              value={jerryMetrics.serviceAppointments}
              subtitle={`${jerryMetrics.serviceAppointmentsAfterHours} scheduled after-hours • Last 30 days`}
              icon={<Calendar className="w-4 h-4 text-purple-600" />}
              link="View Jerry's Performance reports"
              trend="up"
              trendValue="15%"
            />
            <MetricCard
              title="AI Service Sales"
              value={jerryMetrics.serviceSales}
              subtitle="Last 30 days"
              icon={<DollarSign className="w-4 h-4 text-yellow-600" />}
              trend="neutral"
              trendValue="2%"
            />
            <MetricCard
              title="Messages Sent by AI"
              value={jerryMetrics.messagesSent.toLocaleString()}
              subtitle="Last 30 days"
              icon={<MessageSquare className="w-4 h-4 text-indigo-600" />}
              trend="up"
              trendValue="22%"
            />
            <MetricCard
              title="BDC Time Saved with AI"
              value={jerryMetrics.timeSaved}
              subtitle="Last 30 days"
              icon={<Clock className="w-4 h-4 text-red-600" />}
              trend="up"
              trendValue="18%"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <span className="text-sm text-gray-600">
                Were these metrics helpful?
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  👍 Yes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  👎 No
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Your Dealership Performance Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm border-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Your Dealership Performance
                </h2>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Lead generation and conversion metrics
                </p>
              </div>
            </div>
            <Select
              value={dealershipFilter}
              onValueChange={setDealershipFilter}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="Last 60 days">Last 60 days</SelectItem>
                <SelectItem value="Last 90 days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Top Lead Sources
              </h3>
            </div>

            <div className="mb-6 p-4 bg-gray-50/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Total Leads
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                {dealershipMetrics.totalLeads.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Last 30 days</div>
            </div>

            <div className="space-y-2 sm:space-y-4">
              <div className="hidden sm:grid grid-cols-4 gap-4 text-sm font-medium text-gray-500 pb-2 border-b border-gray-100">
                <span>Top 5 Lead Sources</span>
                <span className="text-right">Total Leads</span>
                <span className="text-right">Percentage</span>
                <span className="text-center">Trend</span>
              </div>

              {dealershipMetrics.leadSources.map((source, index) => (
                <div
                  key={source.id}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 items-center py-3 hover:bg-gray-50/50 rounded-lg px-2 sm:px-3 -mx-2 sm:-mx-3 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 col-span-2 sm:col-span-1">
                    <span className="text-sm font-medium text-gray-600 hidden sm:inline">
                      {index + 1}.
                    </span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">
                      {source.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                      {source.leads.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-gray-600 text-sm">
                      {source.percentage}%
                    </span>
                  </div>
                  <div className="text-center hidden sm:block">
                    <Badge
                      variant={
                        source.trend === "up"
                          ? "default"
                          : source.trend === "down"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {source.trend === "up"
                        ? "↗"
                        : source.trend === "down"
                        ? "↘"
                        : "→"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button
                variant="link"
                className="p-0 text-blue-600 hover:text-blue-800 text-sm"
              >
                View all lead sources <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Team Performance Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm border-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Team Performance
                </h2>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Individual team member metrics
                </p>
              </div>
            </div>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This month">This month</SelectItem>
                <SelectItem value="Last month">Last month</SelectItem>
                <SelectItem value="Last 3 months">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <MetricCard
              title="Phone Calls"
              value={teamMetrics.totalPhoneCalls}
              subtitle="This month"
              icon={<Phone className="w-4 h-4 text-blue-600" />}
              trend="up"
              trendValue="5%"
            />
            <MetricCard
              title="Conversations"
              value={teamMetrics.totalConversations}
              subtitle="This month"
              icon={<MessageSquare className="w-4 h-4 text-green-600" />}
              trend="up"
              trendValue="8%"
            />
            <MetricCard
              title="Median First Response"
              value={teamMetrics.medianResponse}
              subtitle="This month"
              icon={<Clock className="w-4 h-4 text-orange-600" />}
              trend="down"
              trendValue="3%"
            />
          </div>

          <div className="space-y-3">
            <div className="hidden sm:grid grid-cols-5 gap-4 text-sm font-medium text-gray-500 pb-3 border-b border-gray-100">
              <span>Name</span>
              <span className="text-center">Phone Calls</span>
              <span className="text-center">Conversations</span>
              <span className="text-center">Response Time</span>
              <span className="text-center">Trend</span>
            </div>

            {teamMetrics.members.map((member, index) => (
              <div
                key={member.id}
                className="hover:bg-gray-50/50 rounded-lg transition-colors"
              >
                {/* Desktop layout */}
                <div className="hidden sm:grid grid-cols-5 gap-4 items-center py-4 px-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">
                      {index + 1}.
                    </span>
                    <span className="font-medium text-gray-900">
                      {member.name}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-gray-900">
                      {member.phoneCalls}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-gray-900">
                      {member.conversations}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="font-medium text-gray-700">
                      {member.responseTime}
                    </span>
                  </div>
                  <div className="text-center">
                    <Badge
                      variant={
                        member.trend === "up"
                          ? "default"
                          : member.trend === "down"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {member.trend === "up"
                        ? "↗"
                        : member.trend === "down"
                        ? "↘"
                        : "→"}
                    </Badge>
                  </div>
                </div>

                {/* Mobile layout - optimized for full width */}
                <div className="sm:hidden p-3 border border-gray-100 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900 text-sm">
                        {member.name}
                      </span>
                    </div>
                    <Badge
                      variant={
                        member.trend === "up"
                          ? "default"
                          : member.trend === "down"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {member.trend === "up"
                        ? "↗"
                        : member.trend === "down"
                        ? "↘"
                        : "→"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-gray-500 mb-1">Calls</div>
                      <div className="font-semibold text-gray-900">
                        {member.phoneCalls}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 mb-1">Conversations</div>
                      <div className="font-semibold text-gray-900">
                        {member.conversations}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 mb-1">Response</div>
                      <div className="font-medium text-gray-900">
                        {member.responseTime}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button
              variant="link"
              className="p-0 text-blue-600 hover:text-blue-800 text-sm"
            >
              View Leaderboard <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Review Performance Section (Expandable) */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm border-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Review Performance
              </h2>
              <p className="text-sm text-gray-600">
                Customer feedback and ratings
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <MetricCard
              title="Average Rating"
              value="4.8"
              subtitle="Based on 1,247 reviews"
              icon={<Award className="w-4 h-4 text-yellow-600" />}
              trend="up"
              trendValue="0.2"
            />
            <MetricCard
              title="Response Rate"
              value="94%"
              subtitle="Reviews responded to"
              icon={<MessageSquare className="w-4 h-4 text-blue-600" />}
              trend="up"
              trendValue="3%"
            />
            <MetricCard
              title="Review Volume"
              value="156"
              subtitle="This month"
              icon={<TrendingUp className="w-4 h-4 text-green-600" />}
              trend="up"
              trendValue="12%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
