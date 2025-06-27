"use client";
import React, { useState, useEffect } from "react";
import { Save, Plus, Edit, Trash2, Settings, Play } from "lucide-react";
import { rulesApi, Rule } from "../../lib/api";

const RulesForm = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [flashMessage, setFlashMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    trigger: "",
    condition: "",
    action: "",
    status: "active" as Rule["status"],
    priority: 1,
    description: "",
  });

  useEffect(() => {
    const loadRules = async () => {
      try {
        const data = await rulesApi.getAll();
        setRules(data);
      } catch (error) {
        console.error("Failed to load rules:", error);
        setFlashMessage({ type: "error", message: "Failed to load rules" });
      }
    };
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const data = await rulesApi.getAll();
      setRules(data);
    } catch (error) {
      console.error("Failed to load rules:", error);
      setFlashMessage({ type: "error", message: "Failed to load rules" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRule) {
        await rulesApi.update(editingRule._id, formData);
        setFlashMessage({
          type: "success",
          message: "Rule updated successfully!",
        });
      } else {
        await rulesApi.create(formData);
        setFlashMessage({
          type: "success",
          message: "Rule created successfully!",
        });
      }

      await loadRules();
      resetForm();
    } catch (error) {
      console.error("Failed to save rule:", error);
      setFlashMessage({ type: "error", message: "Failed to save rule" });
    }

    setTimeout(() => setFlashMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      trigger: "",
      condition: "",
      action: "",
      status: "active",
      priority: 1,
      description: "",
    });
    setIsFormOpen(false);
    setEditingRule(null);
  };

  const handleEdit = (rule: Rule) => {
    setFormData({
      name: rule.name,
      trigger: rule.trigger,
      condition: rule.condition,
      action: rule.action,
      status: rule.status,
      priority: rule.priority,
      description: rule.description,
    });
    setEditingRule(rule);
    setIsFormOpen(true);
  };

  const handleDelete = async (_id: string) => {
    if (confirm("Are you sure you want to delete this rule?")) {
      try {
        await rulesApi.delete(_id);
        await loadRules();
        setFlashMessage({
          type: "success",
          message: "Rule deleted successfully!",
        });
      } catch (error) {
        console.error("Failed to delete rule:", error);
        setFlashMessage({ type: "error", message: "Failed to delete rule" });
      }
      setTimeout(() => setFlashMessage(null), 3000);
    }
  };

  const getStatusColor = (status: Rule["status"]) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-100 text-red-800";
    if (priority >= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return "High";
    if (priority >= 5) return "Medium";
    return "Low";
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
            <Settings className="text-blue-600" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Automation Rules</h1>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-sm font-medium"
        >
          <Plus size={18} />
          <span>Create Rule</span>
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                {editingRule ? "Edit Rule" : "Create Rule"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rule Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                      placeholder="Enter rule name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as Rule["status"],
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trigger *
                    </label>
                    <select
                      required
                      value={formData.trigger}
                      onChange={(e) =>
                        setFormData({ ...formData, trigger: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                    >
                      <option value="">Select Trigger</option>
                      <option value="message_received">Message Received</option>
                      <option value="keyword_detected">Keyword Detected</option>
                      <option value="time_based">Time Based</option>
                      <option value="user_joined">User Joined</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <input
                    type="text"
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                    placeholder="e.g., contains 'help', after 10 minutes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action *
                  </label>
                  <select
                    required
                    value={formData.action}
                    onChange={(e) =>
                      setFormData({ ...formData, action: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors"
                  >
                    <option value="">Select Action</option>
                    <option value="send_message">Send Message</option>
                    <option value="add_tag">Add Tag</option>
                    <option value="close_conversation">
                      Close Conversation
                    </option>
                  </select>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-colors resize-none"
                    placeholder="Brief description of what this rule does"
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
                    <span>{editingRule ? "Update" : "Create"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-6 w-screen">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {rule.name}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      rule.status
                    )}`}
                  >
                    {rule.status}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                      rule.priority
                    )}`}
                  >
                    {getPriorityLabel(rule.priority)}
                  </span>
                </div>

                {rule.description && (
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {rule.description}
                  </p>
                )}

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Trigger:</span>
                    <p className="text-gray-600 mt-1 capitalize">
                      {rule.trigger.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Condition:
                    </span>
                    <p className="text-gray-600 mt-1 line-clamp-2">
                      {rule.condition || "No condition set"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Action:</span>
                    <p className="text-gray-600 mt-1 line-clamp-2 capitalize">
                      {rule.action.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                <button
                  onClick={() => handleEdit(rule)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(rule._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No rules created yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create automation rules to streamline your workflow.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Create Rule
          </button>
        </div>
      )}
    </div>
  );
};

export default RulesForm;
