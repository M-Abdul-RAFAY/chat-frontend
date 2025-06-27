"use client";
import React, { useState, useEffect } from "react";
import { Save, Plus, Edit, Trash2, Building2 } from "lucide-react";
import { businessInfoApi, BusinessInfo } from "../../lib/api";

const BusinessInfoForm = () => {
  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessInfo | null>(
    null
  );
  const [showIframeCode, setShowIframeCode] = useState(false);
  const [flashMessage, setFlashMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    industry: "",
  });

  useEffect(() => {
    // Load businesses from API
    const loadBusinesses = async () => {
      try {
        const data = await businessInfoApi.getAll();
        setBusinesses(data);
      } catch (error) {
        console.error("Failed to load businesses:", error);
        setFlashMessage({
          type: "error",
          message: "Failed to load businesses",
        });
      }
    };
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const data = await businessInfoApi.getAll();
      setBusinesses(data);
    } catch (error) {
      console.error("Failed to load businesses:", error);
      setFlashMessage({ type: "error", message: "Failed to load businesses" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBusiness) {
        // Update existing business
        await businessInfoApi.update(editingBusiness._id, formData);
        setFlashMessage({
          type: "success",
          message: "Business information updated successfully!",
        });
      } else {
        // Add new business
        await businessInfoApi.create(formData);
        setFlashMessage({
          type: "success",
          message: "Business information added successfully!",
        });
      }

      await loadBusinesses(); // Reload the list
      resetForm();
    } catch (error) {
      console.error("Failed to save business:", error);
      setFlashMessage({
        type: "error",
        message: "Failed to save business information",
      });
    }

    // Hide flash message after 3 seconds
    setTimeout(() => setFlashMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      website: "",
      description: "",
      phone: "",
      email: "",
      address: "",
      industry: "",
    });
    setIsFormOpen(false);
    setEditingBusiness(null);
  };

  const handleEdit = (business: BusinessInfo) => {
    setFormData({
      name: business.name,
      website: business.website,
      description: business.description,
      phone: business.phone,
      email: business.email,
      address: business.address,
      industry: business.industry,
    });
    setEditingBusiness(business);
    setIsFormOpen(true);
  };

  const handleDelete = async (_id: string) => {
    try {
      await businessInfoApi.delete(_id);
      await loadBusinesses(); // Reload the list
      setFlashMessage({
        type: "success",
        message: "Business information deleted successfully!",
      });
    } catch (error) {
      console.error("Failed to delete business:", error);
      setFlashMessage({
        type: "error",
        message: "Failed to delete business information",
      });
    }

    // Hide flash message after 3 seconds
    setTimeout(() => setFlashMessage(null), 3000);
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
      <div className="flex items-center justify-between mb-8 w-full">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="text-blue-600" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Business Information
          </h1>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-sm font-medium"
        >
          <Plus size={18} />
          <span>Add Business</span>
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetForm();
            }
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                {editingBusiness ? "Edit Business Info" : "Add Business Info"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500 transition-colors"
                      placeholder="Enter business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500 transition-colors"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500 transition-colors"
                      placeholder="contact@business.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) =>
                        setFormData({ ...formData, industry: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                    >
                      <option value="">Select Industry</option>
                      <option value="retail">Retail</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="automotive">Automotive</option>
                      <option value="real-estate">Real Estate</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500 transition-colors"
                    placeholder="Full business address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500 transition-colors resize-none"
                    placeholder="Brief description of your business"
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
                    <span>{editingBusiness ? "Update" : "Save"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Business List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-screen">
        {businesses.map((business) => (
          <div
            key={business.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-gray-900 truncate text-lg">
                {business.name}
              </h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(business)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(business._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {business.website && (
              <p className="text-sm text-blue-600 mb-3 truncate">
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {business.website}
                </a>
              </p>
            )}

            {business.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                {business.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-500">
              {business.email && (
                <div className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>{business.email}</span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>{business.phone}</span>
                </div>
              )}
              {business.industry && (
                <div className="flex items-center space-x-2">
                  <span>🏢</span>
                  <span className="capitalize">{business.industry}</span>
                </div>
              )}
              {business.address && (
                <div className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>{business.address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {businesses.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No businesses added yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add your first business information to get started with your chat
            platform.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Add Business Info
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessInfoForm;
