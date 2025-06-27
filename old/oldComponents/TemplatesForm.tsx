"use client";
import React, { useState, useEffect } from "react";
import { Save, Plus, Edit, Trash2, FileText, Copy } from "lucide-react";
import { templatesApi, Template } from "../../lib/api";

const TemplatesForm = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [flashMessage, setFlashMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    type: "sms" as Template["type"],
    status: "active" as Template["status"],
    category: "",
  });

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await templatesApi.getAll();
        setTemplates(data);
      } catch (error) {
        console.error("Failed to load templates:", error);
        setFlashMessage({ type: "error", message: "Failed to load templates" });
      }
    };
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await templatesApi.getAll();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
      setFlashMessage({ type: "error", message: "Failed to load templates" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTemplate) {
        await templatesApi.update(editingTemplate._id, formData);
        setFlashMessage({
          type: "success",
          message: "Template updated successfully!",
        });
      } else {
        await templatesApi.create(formData);
        setFlashMessage({
          type: "success",
          message: "Template created successfully!",
        });
      }

      await loadTemplates();
      resetForm();
    } catch (error) {
      console.error("Failed to save template:", error);
      setFlashMessage({ type: "error", message: "Failed to save template" });
    }

    setTimeout(() => setFlashMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      content: "",
      type: "sms",
      status: "active",
      category: "",
    });
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  const handleEdit = (template: Template) => {
    setFormData({
      name: template.name,
      content: template.content,
      type: template.type,
      status: template.status,
      category: template.category,
    });
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDelete = async (_id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await templatesApi.delete(_id);
        await loadTemplates();
        setFlashMessage({
          type: "success",
          message: "Template deleted successfully!",
        });
      } catch (error) {
        console.error("Failed to delete template:", error);
        setFlashMessage({
          type: "error",
          message: "Failed to delete template",
        });
      }
      setTimeout(() => setFlashMessage(null), 3000);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("Template content copied to clipboard!");
  };

  const getTypeIcon = (type: Template["type"]) => {
    switch (type) {
      case "sms":
        return "📱";
      case "email":
        return "📧";
      case "whatsapp":
        return "💬";
      case "call":
        return "📞";
      default:
        return "📱";
    }
  };

  const getStatusColor = (status: Template["status"]) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
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
            <FileText className="text-blue-600" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Message Templates
          </h1>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-sm font-medium"
        >
          <Plus size={18} />
          <span>Create Template</span>
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                {editingTemplate ? "Edit Template" : "Create Template"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                      placeholder="Enter template name"
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
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="call">Call Script</option>
                    </select>
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
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                    >
                      <option value="">Select Category</option>
                      <option value="welcome">Welcome</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="promotional">Promotional</option>
                      <option value="reminder">Reminder</option>
                      <option value="support">Support</option>
                      <option value="closing">Closing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors resize-none"
                    placeholder="Enter your template content here. You can use variables like {name}, {company}, etc."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Tip: Use variables like {`{name}`}, {`{company}`},{" "}
                    {`{phone}`} for personalization
                  </p>
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
                    <span>{editingTemplate ? "Update" : "Create"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-screen">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate mb-2 text-lg">
                  {template.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      template.status
                    )}`}
                  >
                    {template.status}
                  </span>
                  <span className="text-lg">{getTypeIcon(template.type)}</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {template.type}
                  </span>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleCopyContent(template.content)}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                  title="Copy content"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(template._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {template.category && (
              <p className="text-xs text-blue-600 mb-3 capitalize">
                📂 {template.category}
              </p>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
                {template.content}
              </p>
            </div>

            <p className="text-xs text-gray-500">
              Updated: {new Date(template.updatedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No templates created yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create message templates to streamline your communication.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Create Template
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplatesForm;
