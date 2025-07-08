"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { widgetAPI } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

interface WidgetConfig {
  companyName: string;
  welcomeMessage: string;
  primaryColor: string;
  isActive: boolean;
}

export default function WidgetManager() {
  const { user } = useUser();
  const [widgetId, setWidgetId] = useState<string>("");
  const [embedCode, setEmbedCode] = useState<string>("");
  const [config, setConfig] = useState<WidgetConfig>({
    companyName: "Your Company",
    welcomeMessage: "Hi! How can we help you today?",
    primaryColor: "#3B82F6",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const initializeWidget = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      // First try to get existing widget config
      const data = await widgetAPI.getWidgetConfig(user?.id);
      setWidgetId(data.widgetId);
      setConfig(data.config);
      generateEmbedCode(data.widgetId);
    } catch (error) {
      console.error("No existing widget found, generating new one:", error);
      // If no existing widget, try to generate a new one
      try {
        const data = await widgetAPI.generateWidget(user?.id);
        setWidgetId(data.widgetId);
        setEmbedCode(data.embedCode);
      } catch (generateError) {
        console.error("Error generating widget:", generateError);
        setError("Failed to initialize widget. Please try again.");
        // Generate fallback widget when both API calls fail
        const fallbackWidgetId = `widget_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        setWidgetId(fallbackWidgetId);
        generateEmbedCode(fallbackWidgetId);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    initializeWidget();
  }, [initializeWidget]);

  const updateConfig = async () => {
    try {
      setSaving(true);
      await widgetAPI.updateWidgetConfig(config, user?.id);
    } catch (error) {
      console.error("Error updating widget config:", error);
      setError("Failed to save configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const retryGeneration = async () => {
    await initializeWidget();
  };

  const generateEmbedCode = (id: string) => {
    console.log("Generating embed code for widget ID:", id);
    const currentDomain = process.env.NEXT_PUBLIC_API_URL?.replace(
      "/api/v1",
      ""
    );
    const code = `<iframe
  src="${currentDomain}/widget?id=${id}"
  style="
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    height: 500px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 9999;
  "
  allowtransparency="true"
></iframe>`;
    setEmbedCode(code);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Create toast element
        const toast = document.createElement("div");
        toast.textContent = "Copied to clipboard!";
        toast.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      background-color: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

        // Add to DOM
        document.body.appendChild(toast);

        // Fade in
        setTimeout(() => {
          toast.style.opacity = "1";
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
          toast.style.opacity = "0";
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);
      })
      .catch((err) => {
        // Handle clipboard write failure
        console.error("Failed to copy text: ", err);

        // Show error toast
        const errorToast = document.createElement("div");
        errorToast.textContent = "Failed to copy to clipboard";
        errorToast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #f44336;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

        document.body.appendChild(errorToast);

        setTimeout(() => {
          errorToast.style.opacity = "1";
        }, 10);

        setTimeout(() => {
          errorToast.style.opacity = "0";
          setTimeout(() => {
            document.body.removeChild(errorToast);
          }, 300);
        }, 3000);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">
          Loading widget configuration...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Widget Manager</h2>
        {error && (
          <Button onClick={retryGeneration} disabled={loading} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Widget Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={config.companyName}
              onChange={(e) =>
                setConfig({ ...config, companyName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Welcome Message
            </label>
            <textarea
              value={config.welcomeMessage}
              onChange={(e) =>
                setConfig({ ...config, welcomeMessage: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) =>
                setConfig({ ...config, primaryColor: e.target.value })
              }
              className="w-20 h-10 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={config.isActive}
              onChange={(e) =>
                setConfig({ ...config, isActive: e.target.checked })
              }
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Widget Active
            </label>
          </div>
          <div>
            <Button onClick={updateConfig} disabled={saving}>
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </Card>

      {widgetId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Widget Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Widget ID
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono">
                    {widgetId}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(widgetId)}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview URL
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono truncate">
                    {window.location.origin}/widget?id={widgetId}
                  </code>
                  <Button
                    onClick={() =>
                      window.open(`/widget?id=${widgetId}`, "_blank")
                    }
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Embed Code</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Copy this code to your website
                </label>
                <div className="relative">
                  <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                    <code>{embedCode}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(embedCode)}
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Paste this code before the closing &lt;/body&gt; tag on your
                website. The widget will appear as a floating chat bubble in the
                bottom-right corner.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
