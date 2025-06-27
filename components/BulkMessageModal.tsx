"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Users,
  Zap,
  Calendar,
  Package,
  Paperclip,
  Link,
  Smile,
  Star,
  Send,
} from "lucide-react";

interface BulkMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const messageTemplates = [
  { icon: <Zap className="h-4 w-4" />, text: "Announce a sale" },
  { icon: <Star className="h-4 w-4" />, text: "Collect reviews" },
  { icon: <Calendar className="h-4 w-4" />, text: "Confirm appointments" },
];

export default function BulkMessageModal({
  isOpen,
  onClose,
}: BulkMessageModalProps) {
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateClick = (templateText: string) => {
    setSelectedTemplate(templateText);
    setMessage(templateText + " ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Write your message
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* To Field */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 w-12">To</span>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 flex items-center gap-2"
            >
              <Users className="h-3 w-3" />
              5.1k Subscribers
              <X className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded" />
            </Badge>
          </div>

          {/* From Field */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 w-12">From</span>
            <span className="text-sm text-gray-600">
              Venture Auto (555) 555-5555
            </span>
          </div>

          <Separator />

          {/* Message Templates */}
          <div className="flex flex-wrap gap-2">
            {messageTemplates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-gray-50"
                onClick={() => handleTemplateClick(template.text)}
              >
                {template.icon}
                {template.text}
              </Button>
            ))}
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Write your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[200px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Package className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Star className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Send className="h-3 w-3 mr-1" />
              Send test
            </Button>
          </div>

          {/* Marketing Notice */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-600">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Marketing messages will only be sent to marketing contacts.
              <button className="text-blue-600 hover:underline ml-1">
                Learn more here
              </button>
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline">Save</Button>
            <div className="flex gap-2">
              <Button variant="outline">Schedule</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Send now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
