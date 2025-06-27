"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Send, CheckCircle } from "lucide-react";
import Image from "next/image";
import { widgetAPI } from "@/lib/api";

interface WidgetData {
  companyName: string;
  welcomeMessage: string;
  primaryColor: string;
  isActive: boolean;
}

interface Message {
  id: string;
  sender: "customer" | "agent";
  content: string;
  timestamp: string;
}

interface ChatSupportWidgetProps {
  widgetId?: string;
}

export default function ChatSupportWidget({
  widgetId,
}: ChatSupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"form" | "optIn">("form");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    message?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name: boolean;
    phone: boolean;
    message: boolean;
  }>({ name: false, phone: false, message: false });
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [widgetData, setWidgetData] = useState<WidgetData>({
    companyName: "Support",
    welcomeMessage: "Hi! How can we help you today?",
    primaryColor: "#3B82F6",
    isActive: true,
  });

  useEffect(() => {
    if (widgetId) {
      fetchWidgetData();
    }
  }, [widgetId]);

  const fetchWidgetData = async () => {
    try {
      if (!widgetId) return;
      const data = await widgetAPI.getWidgetPublicData(widgetId);
      setWidgetData(data);
    } catch (error) {
      console.error("Error fetching widget data:", error);
    }
  };

  function validateField(fieldName: keyof typeof form, value: string) {
    let error: string | undefined = undefined;
    if (fieldName === "name" && !value.trim()) {
      error = "Name is required";
    } else if (fieldName === "phone") {
      if (!value.trim()) error = "Mobile Phone is required";
      else if (!/^\+?\d{7,15}$/.test(value.trim()))
        error = "Enter a valid phone number (7-15 digits, optional +)";
    } else if (fieldName === "message" && !value.trim()) {
      error = "Message is required";
    }
    return error;
  }

  function validateForm() {
    const newErrors: typeof errors = {};
    newErrors.name = validateField("name", form.name);
    newErrors.phone = validateField("phone", form.phone);
    newErrors.message = validateField("message", form.message);
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, value]) => value !== undefined)
    );
    return filteredErrors;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: undefined });
  }

  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof typeof form, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ name: true, phone: true, message: true });
      return;
    }

    if (!widgetId) {
      console.log("Submitting form:", form);
      setStep("optIn");
      return;
    }

    try {
      setLoading(true);
      const response = await widgetAPI.createConversation(widgetId, {
        name: form.name,
        email: "", // Not collected in this form
        phone: form.phone,
        message: form.message,
      });

      setConversationId(response.conversationId);
      setStep("optIn");
    } catch (error) {
      console.error("Error starting conversation:", error);
      setErrors({ message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    setStep("form");
    setForm({ name: "", phone: "", message: "" });
    setErrors({});
    setTouched({ name: false, phone: false, message: false });
  };

  const handleSignUp = () => {
    // You can add logic here for opt-in
    handleClose(); // Close the widget after sign up
  };

  const isFieldValid = (fieldName: keyof typeof form) => {
    return (
      touched[fieldName] && !errors[fieldName] && form[fieldName].trim() !== ""
    );
  };

  if (!widgetData.isActive) {
    return null;
  }

  return (
    <>
      {/* Chat Widget Popup */}
      {isOpen && (
        <div className="fixed mb-16 bottom-6 right-6 z-50 w-80 max-w-full h-auto max-h-[70vh] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
          {/* Form Step */}
          {step === "form" && (
            <>
              {/* Header */}
              <div className="flex justify-center py-4 bg-orange-600 text-white relative flex-shrink-0">
                <div className="flex text-base items-center space-x-2 mb-1">
                  <MessageCircle size={18} />
                  <span className="font-bold">
                    Get a quick response via text.
                  </span>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-3 bg-gray-50 overflow-y-auto flex-grow">
                <div className="bg-gray-200 rounded-tr-lg rounded-tl-lg rounded-br-lg p-2 mr-5 flex justify-center shadow mb-3">
                  <p className="text-gray-700 text-sm px-3">
                    Enter your information, and our team will text you shortly.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="bg-white ml-4 p-3 rounded-tr-lg rounded-tl-lg rounded-bl-lg shadow space-y-4">
                    {/* Name Field */}
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={form.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder=" "
                        className={`peer w-full px-0 py-2 border-0 border-b text-sm bg-transparent text-gray-900 focus:outline-none
                          ${
                            errors.name
                              ? "border-b-2 border-red-500"
                              : isFieldValid("name")
                              ? "border-b-2 border-green-500"
                              : "border-b border-gray-300"
                          }
                          focus:border-orange-700`}
                      />
                      <label
                        htmlFor="name"
                        className={`absolute left-0 text-xs text-gray-600 transition-all duration-200
                          ${
                            form.name.trim() !== "" ||
                            errors.name ||
                            touched.name
                              ? "top-[-0.5rem] text-xs peer-focus:text-orange-700"
                              : "top-2 text-xs peer-placeholder-shown:top-2 peer-focus:top-[-0.5rem] peer-focus:text-orange-700"
                          }`}
                      >
                        Name
                      </label>
                      {isFieldValid("name") && (
                        <CheckCircle
                          size={14}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-green-500"
                        />
                      )}
                      {errors.name && (
                        <span className="text-red-600 text-xs mt-1 block">
                          {errors.name}
                        </span>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={form.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder=" "
                        className={`peer w-full px-0 py-2 border-0 border-b text-sm bg-transparent text-gray-900 focus:outline-none
                          ${
                            errors.phone
                              ? "border-b-2 border-red-500"
                              : isFieldValid("phone")
                              ? "border-b-2 border-green-500"
                              : "border-b border-gray-300"
                          }
                          focus:border-orange-700`}
                      />
                      <label
                        htmlFor="phone"
                        className={`absolute left-0 text-xs text-gray-600 transition-all duration-200
                          ${
                            form.phone.trim() !== "" ||
                            errors.phone ||
                            touched.phone
                              ? "top-[-0.5rem] text-xs peer-focus:text-orange-700"
                              : "top-2 text-xs peer-placeholder-shown:top-2 peer-focus:top-[-0.5rem] peer-focus:text-orange-700"
                          }`}
                      >
                        Mobile Phone
                      </label>
                      {isFieldValid("phone") && (
                        <CheckCircle
                          size={14}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-green-500"
                        />
                      )}
                      {errors.phone && (
                        <span className="text-red-600 text-xs mt-1 block">
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    {/* Message Field */}
                    <div className="relative">
                      <input
                        name="message"
                        id="message"
                        value={form.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder=" "
                        className={`peer w-full px-0 py-2 border-0 border-b text-sm bg-transparent text-gray-900 focus:outline-none resize-none
                          ${
                            errors.message
                              ? "border-b-2 border-red-500"
                              : isFieldValid("message")
                              ? "border-b-2 border-green-500"
                              : "border-b border-gray-300"
                          }
                          focus:border-orange-700`}
                      />
                      <label
                        htmlFor="message"
                        className={`absolute left-0 text-xs text-gray-600 transition-all duration-200
                          ${
                            form.message.trim() !== "" ||
                            errors.message ||
                            touched.message
                              ? "top-[-0.5rem] text-xs peer-focus:text-orange-700"
                              : "top-2 text-xs peer-placeholder-shown:top-2 peer-focus:top-[-0.5rem] peer-focus:text-orange-700"
                          }`}
                      >
                        Message
                      </label>
                      {isFieldValid("message") && (
                        <CheckCircle
                          size={14}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-green-500"
                        />
                      )}
                      {errors.message && (
                        <span className="text-red-600 text-xs mt-1 block">
                          {errors.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Consent Text */}
                  <div className="pt-2">
                    <p className="text-[10px] text-justify text-gray-600 mb-2 leading-tight">
                      By submitting, you authorize {widgetData.companyName} to
                      text/call the number above possibly using automated means
                      & AI-generated calls/messages. Msg&data rates apply, msg
                      frequency varies. Consent is not a condition of purchase.{" "}
                      <a href="#" className="underline">
                        See terms
                      </a>
                      . Text HELP for help and STOP to unsubscribe.
                    </p>
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2 px-6 text-sm font-bold transition-colors disabled:opacity-50"
                      >
                        {loading ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Footer */}
                <div className="mt-4 pt-2 border-t border-gray-200">
                  <p className="text-[10px] text-gray-500 text-center">
                    <a href="#" className="text-blue-600 underline">
                      Try website texting
                    </a>{" "}
                    powered by{" "}
                    <span className="font-semibold">🏛️ Hive Metrics</span>
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Opt-In Step */}
          {step === "optIn" && (
            <div className="flex flex-col flex-grow ">
              <div className="bg-orange-700 p-3 text-white flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-3 h-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                  <span className="font-semibold text-sm">
                    We received your message.
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-1">
                  Watch for a text from +1633441166
                </p>
              </div>
              <div className="p-4 text-center flex-grow flex flex-col justify-between items-center overflow-y-auto">
                <>
                  <div className="flex flex-col items-center">
                    {/* Gift Box Image/Icon */}
                    <Image
                      src="/assets/box.png"
                      alt="Gift box"
                      width={64}
                      height={64}
                      className="object-contain mb-2"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Don't miss out!
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2">
                    Sign up now to receive exclusive offers and deals from
                    {widgetData.companyName}
                  </p>
                  <p className="text-[10px] text-gray-500 mb-4 leading-tight">
                    By submitting, you consent to receive marketing texts/calls
                    from {widgetData.companyName} using the mobile number you
                    provided on the prior page, subject to those terms. Text
                    REMOVE to opt out from marketing texts.
                  </p>
                  <button
                    onClick={handleSignUp}
                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2 px-6 text-sm font-bold transition-colors shadow-md mb-4"
                  >
                    Sign Up
                  </button>
                </>
                <div className="mt-auto pt-2 border-t border-gray-200 w-full">
                  <p className="text-[10px] text-gray-500 text-center">
                    <a href="#" className="text-blue-600 underline">
                      Try website texting
                    </a>{" "}
                    powered by{" "}
                    <span className="font-semibold ">Hive Metrics</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Chat Button (always visible, always on top) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => (isOpen ? handleClose() : setIsOpen(true))}
          className={`text-white rounded-full py-3 px-4 shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2
            ${
              isOpen
                ? "bg-blue-700 hover:bg-blue-900"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
          aria-label={isOpen ? "Close chat" : "Open chat support"}
        >
          {isOpen ? (
            <X size={24} />
          ) : (
            <>
              <div className="pr-1">
                <MessageCircle size={24} />
              </div>
              <span className="font-bold">Text us</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
