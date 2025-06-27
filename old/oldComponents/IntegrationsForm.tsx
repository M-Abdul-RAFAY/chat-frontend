"use client";
import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Edit,
  Trash2,
  Plug,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { integrationsApi, Integration } from "../../lib/api";

const IntegrationsForm = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] =
    useState<Integration | null>(null);
  const [flashMessage, setFlashMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    status: "disconnected" as Integration["status"],
    configuration: {} as Record<string, any>,
    description: "",
  });
  const [configText, setConfigText] = useState(
    JSON.stringify(formData.configuration, null, 2)
  );
  const [configError, setConfigError] = useState<string | null>(null);

  const integrationTypes = [
    {
      value: "whatsapp",
      label: "WhatsApp Business",
      fields: ["phone_number", "api_token"],
    },
    { value: "sms", label: "SMS Gateway", fields: ["api_key", "sender_id"] },
    {
      value: "email",
      label: "Email Service",
      fields: ["smtp_host", "smtp_port", "username", "password"],
    },
    { value: "webhook", label: "Webhook", fields: ["url", "secret"] },
    {
      value: "crm",
      label: "CRM Integration",
      fields: ["api_url", "api_key", "sync_enabled"],
    },
    {
      value: "payment",
      label: "Payment Gateway",
      fields: ["merchant_id", "api_key", "webhook_secret"],
    },
    {
      value: "analytics",
      label: "Analytics",
      fields: ["tracking_id", "property_id"],
    },
    {
      value: "social",
      label: "Social Media",
      fields: ["app_id", "app_secret", "access_token"],
    },
  ];

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const data = await integrationsApi.getAll();
        setIntegrations(data);
      } catch (error) {
        console.error("Failed to load integrations:", error);
        setFlashMessage({
          type: "error",
          message: "Failed to load integrations",
        });
      }
    };
    loadIntegrations();
  }, []);

  useEffect(() => {
    setConfigText(JSON.stringify(formData.configuration, null, 2));
  }, [isFormOpen, formData.type]); // Reset textarea when form opens or type changes

  const loadIntegrations = async () => {
    try {
      const data = await integrationsApi.getAll();
      setIntegrations(data);
    } catch (error) {
      console.error("Failed to load integrations:", error);
      setFlashMessage({
        type: "error",
        message: "Failed to load integrations",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingIntegration) {
        await integrationsApi.update(editingIntegration._id, formData);
        setFlashMessage({
          type: "success",
          message: "Integration updated successfully!",
        });
      } else {
        await integrationsApi.create(formData);
        setFlashMessage({
          type: "success",
          message: "Integration created successfully!",
        });
      }

      await loadIntegrations();
      resetForm();
    } catch (error) {
      console.error("Failed to save integration:", error);
      setFlashMessage({ type: "error", message: "Failed to save integration" });
    }

    setTimeout(() => setFlashMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      status: "disconnected",
      configuration: {},
      description: "",
    });
    setConfigText("{}");
    setConfigError(null);
    setIsFormOpen(false);
    setEditingIntegration(null);
  };

  const handleEdit = (integration: Integration) => {
    setFormData({
      name: integration.name,
      type: integration.type,
      status: integration.status,
      configuration: integration.configuration,
      description: integration.description,
    });
    setConfigText(JSON.stringify(integration.configuration || {}, null, 2));
    setConfigError(null);
    setEditingIntegration(integration);
    setIsFormOpen(true);
  };

  const handleDelete = async (_id: string) => {
    if (confirm("Are you sure you want to delete this integration?")) {
      try {
        await integrationsApi.delete(_id);
        await loadIntegrations();
        setFlashMessage({
          type: "success",
          message: "Integration deleted successfully!",
        });
      } catch (error) {
        console.error("Failed to delete integration:", error);
        setFlashMessage({
          type: "error",
          message: "Failed to delete integration",
        });
      }
      setTimeout(() => setFlashMessage(null), 3000);
    }
  };

  const handleConfigurationChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      configuration: {
        ...formData.configuration,
        [field]: value,
      },
    });
  };

  const getStatusColor = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle size={16} className="text-green-600" />;
      case "error":
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const selectedType = integrationTypes.find(
    (type) => type.value === formData.type
  );

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
            <Plug className="text-blue-600" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-sm font-medium"
        >
          <Plus size={18} />
          <span>Add Integration</span>
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                {editingIntegration ? "Edit Integration" : "Add Integration"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Integration Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                      placeholder="Enter integration name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                    >
                      <option value="">Select Integration Type</option>
                      <option value="whatsapp">WhatsApp Business</option>
                      <option value="sms">SMS Gateway</option>
                      <option value="email">Email Service</option>
                      <option value="webhook">Webhook</option>
                      <option value="crm">CRM System</option>
                      <option value="analytics">Analytics</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Configuration (JSON) *
                  </label>
                  <textarea
                    required
                    value={configText}
                    onChange={(e) => {
                      setConfigText(e.target.value);
                      try {
                        const config = JSON.parse(e.target.value);
                        setFormData({ ...formData, configuration: config });
                        setConfigError(null);
                      } catch {
                        setConfigError("Invalid JSON");
                      }
                    }}
                    rows={6}
                    className={`w-full px-4 py-3 border ${
                      configError ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-black transition-colors resize-none`}
                    placeholder='{"apiKey": "your-api-key", "endpoint": "https://api.example.com"}'
                  />
                  {configError && (
                    <p className="text-xs text-red-600 mt-2">{configError}</p>
                  )}
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
                    <span>{editingIntegration ? "Update" : "Add"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Integrations List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-screen">
        {integrations.map((integration) => (
          <div
            key={integration._id || integration.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate mb-2 text-lg">
                  {integration.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      integration.status
                    )}`}
                  >
                    {integration.status}
                  </span>
                  {getStatusIcon(integration.status)}
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(integration)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(integration._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-sm text-blue-600 mb-3 capitalize">
              🔌 {integration.type.replace(/[-_]/g, " ")}
            </p>

            {integration.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                {integration.description}
              </p>
            )}

            <div className="text-xs text-gray-500">
              <p>
                Updated: {new Date(integration.updatedAt).toLocaleDateString()}
              </p>
              {Object.keys(integration.configuration || {}).length > 0 && (
                <p className="mt-1">
                  {Object.keys(integration.configuration || {}).length} config
                  field(s)
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {integrations.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plug size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No integrations configured
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Connect external services to enhance your chat experience.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Add Integration
          </button>
        </div>
      )}
    </div>
  );
};

export default IntegrationsForm;
