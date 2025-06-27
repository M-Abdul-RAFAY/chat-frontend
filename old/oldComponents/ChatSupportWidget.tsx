"use client";
import { useState } from "react";
import { widgetApi, WidgetData } from "../../lib/api";

export default function ChatSupportWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "thanks">("form");
  const [form, setForm] = useState({ username: "", phone: "", message: "" });
  const [errors, setErrors] = useState<{
    username?: string;
    phone?: string;
    message?: string;
  }>({});

  function validate() {
    const newErrors: typeof errors = {};
    if (!form.username.trim()) newErrors.username = "Name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\+?\d{7,15}$/.test(form.phone.trim()))
      newErrors.phone = "Enter a valid phone number";
    if (!form.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    // Log form details
    console.log("Submitting form:", form);

    // Map username to name for the backend
    const payload = {
      name: form.username,
      phone: form.phone,
      message: form.message,
    };

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/widget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Server error");
      console.log("Server response:", response);
      setStep("thanks");
    } catch (err) {
      setErrors({ message: "Something went wrong. Please try again." });
      console.error("POST request failed:", err);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full shadow-lg px-6 py-3 text-lg hover:bg-blue-700 transition"
        aria-label="Open chat support"
      >
        {open ? "Close Chat" : "Chat Support"}
      </button>

      {/* Popup Widget */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl p-6 flex flex-col gap-4 max-h-[36rem] overflow-hidden">
          {step === "form" && (
            <>
              <h2 className="text-xl font-semibold mb-2 text-black">
                Support Chat
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  name="username"
                  placeholder="Your Name"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="border rounded px-3 py-2 text-black placeholder-black"
                />
                {errors.username && (
                  <span className="text-red-600 text-sm">
                    {errors.username}
                  </span>
                )}
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="border rounded px-3 py-2 text-black placeholder-black"
                />
                {errors.phone && (
                  <span className="text-red-600 text-sm">{errors.phone}</span>
                )}
                <textarea
                  name="message"
                  placeholder="How can we help you?"
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="border rounded px-3 py-2 resize-none text-black placeholder-black"
                  rows={3}
                />
                {errors.message && (
                  <span className="text-red-600 text-sm">{errors.message}</span>
                )}
                <button
                  type="submit"
                  className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                >
                  Submit
                </button>
              </form>
            </>
          )}

          {step === "thanks" && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-lg font-semibold text-black mb-2">
                Thank you!
              </div>
              <div className="text-gray-700 text-center">
                We will reach you out in a bit.
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
