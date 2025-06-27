"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  Plus,
  Edit,
  Trash2,
  Megaphone,
  Calendar,
  Users,
} from "lucide-react";
import { campaignsApi, Campaign } from "../../lib/api";

const CampaignsForm = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    scheduleDate: "",
    status: "draft" as Campaign["status"],
    segmentCriteria: "",
    type: "sms" as Campaign["type"],
    message: "",
    targetAudience: "",
  });
  const [flashMessage, setFlashMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const data = await campaignsApi.getAll();
        setCampaigns(data);
      } catch (error) {
        console.error("Failed to load campaigns:", error);
        setFlashMessage({ type: "error", message: "Failed to load campaigns" });
      }
    };
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await campaignsApi.getAll();
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
      setFlashMessage({ type: "error", message: "Failed to load campaigns" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCampaign) {
        await campaignsApi.update(editingCampaign._id, formData);
        setFlashMessage({
          type: "success",
          message: "Campaign updated successfully!",
        });
      } else {
        await campaignsApi.create(formData);
        setFlashMessage({
          type: "success",
          message: "Campaign created successfully!",
        });
      }

      await loadCampaigns();
      resetForm();
    } catch (error) {
      console.error("Failed to save campaign:", error);
      setFlashMessage({ type: "error", message: "Failed to save campaign" });
    }

    setTimeout(() => setFlashMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      scheduleDate: "",
      status: "draft",
      segmentCriteria: "",
      type: "sms",
      message: "",
      targetAudience: "",
    });
    setIsFormOpen(false);
    setEditingCampaign(null);
  };

  const handleEdit = (campaign: Campaign) => {
    setFormData({
      name: campaign.name,
      scheduleDate: campaign.scheduleDate,
      status: campaign.status,
      segmentCriteria: campaign.segmentCriteria,
      type: campaign.type,
      message: campaign.message,
      targetAudience: campaign.targetAudience,
    });
    setEditingCampaign(campaign);
    setIsFormOpen(true);
  };

  const handleDelete = async (_id: string) => {
    try {
      await campaignsApi.delete(_id);
      await loadCampaigns();
      setFlashMessage({
        type: "success",
        message: "Campaign deleted successfully!",
      });
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      setFlashMessage({ type: "error", message: "Failed to delete campaign" });
    }
    setTimeout(() => setFlashMessage(null), 3000);
  };

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: Campaign["type"]) => {
    switch (type) {
      case "sms":
        return "📱";
      case "email":
        return "📧";
      case "whatsapp":
        return "💬";
      case "push":
        return "🔔";
      default:
        return "📱";
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Flash Message */}
      {flashMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            flashMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>{flashMessage.message}</span>
            <button
              onClick={() => setFlashMessage(null)}
              className="text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header with proper spacing */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Megaphone className="text-blue-600" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-sm font-medium"
        >
          <Plus size={18} />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                {editingCampaign ? "Edit Campaign" : "Create Campaign"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                      placeholder="Enter campaign name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Date *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.scheduleDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduleDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as Campaign["type"],
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                    >
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="push">Push Notification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetAudience: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                      placeholder="e.g., New customers, VIP clients"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Segment Criteria
                    </label>
                    <input
                      type="text"
                      value={formData.segmentCriteria}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          segmentCriteria: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                      placeholder="e.g., Age 25-45, Location: NYC"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content *
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors resize-none"
                    placeholder="Enter your campaign message..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium shadow-sm"
                  >
                    <Save size={16} />
                    <span>{editingCampaign ? "Update" : "Create"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-screen">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate mb-2 text-lg">
                  {campaign.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                  <span className="text-lg">{getTypeIcon(campaign.type)}</span>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(campaign)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(campaign._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {campaign.scheduleDate && (
              <p className="text-sm text-gray-600 mb-3 flex items-center space-x-2">
                <Calendar size={14} />
                <span>{new Date(campaign.scheduleDate).toLocaleString()}</span>
              </p>
            )}

            {campaign.targetAudience && (
              <p className="text-sm text-gray-600 mb-3 flex items-center space-x-2">
                <Users size={14} />
                <span>{campaign.targetAudience}</span>
              </p>
            )}

            <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed mb-4">
              {campaign.message}
            </p>

            {campaign.segmentCriteria && (
              <p className="text-xs text-gray-500">
                <strong>Criteria:</strong> {campaign.segmentCriteria}
              </p>
            )}
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Megaphone size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No campaigns created yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first campaign to start engaging with customers.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Create Campaign
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignsForm;
