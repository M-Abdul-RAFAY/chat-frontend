"use client";

import { useState, useEffect } from "react";
import { Copy, Settings, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { widgetAPI } from "@/lib/api";

interface WidgetConfig {
  companyName: string;
  welcomeMessage: string;
  primaryColor: string;
  isActive: boolean;
}

export default function WidgetManager() {
  const [widgetId, setWidgetId] = useState<string>("");
  const [embedCode, setEmbedCode] = useState<string>("");
  const [config, setConfig] = useState<WidgetConfig>({
    companyName: "Your Company",
    welcomeMessage: "Hi! How can we help you today?",
    primaryColor: "#3B82F6",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchWidgetConfig();
  }, []);

  const fetchWidgetConfig = async () => {
    try {
      setLoading(true);
      const data = await widgetAPI.getWidgetConfig();
      setWidgetId(data.widgetId);
      setConfig(data.config);
      generateEmbedCode(data.widgetId);
    } catch (error) {
      console.error("Error fetching widget config:", error);
      // Generate a fallback widget ID if API fails
      const fallbackWidgetId = `widget_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setWidgetId(fallbackWidgetId);
      generateEmbedCode(fallbackWidgetId);
    } finally {
      setLoading(false);
    }
  };

  const generateWidget = async () => {
    try {
      setGenerating(true);
      const data = await widgetAPI.generateWidget();
      setWidgetId(data.widgetId);
      setEmbedCode(data.embedCode);
    } catch (error) {
      console.error("Error generating widget:", error);
      // Generate fallback widget when API fails
      const newWidgetId = `widget_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setWidgetId(newWidgetId);
      generateEmbedCode(newWidgetId);
    } finally {
      setGenerating(false);
    }
  };

  const updateConfig = async () => {
    try {
      setSaving(true);
      await widgetAPI.updateWidgetConfig(config);
      setShowSettings(false);
    } catch (error) {
      console.error("Error updating widget config:", error);
    } finally {
      setSaving(false);
    }
  };

  const generateEmbedCode = (id: string) => {
    const currentDomain =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://your-domain.com";
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
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={generateWidget} disabled={generating} size="sm">
            {generating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {widgetId ? "Regenerate" : "Generate"} Widget
          </Button>
        </div>
      </div>

      {showSettings && (
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
            <div className="flex space-x-2">
              <Button onClick={updateConfig} disabled={saving}>
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
              <Button onClick={() => setShowSettings(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

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
