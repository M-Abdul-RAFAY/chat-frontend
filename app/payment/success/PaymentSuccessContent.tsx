"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");
  const [paymentStatus, setPaymentStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [paymentDetails, setPaymentDetails] = useState<{
    amount?: number;
    currency?: string;
    status?: string;
    paymentIntentId?: string;
  } | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        console.error("❌ No session ID found in URL");
        setPaymentStatus("error");
        return;
      }

      try {
        console.log("🔍 Verifying payment session:", sessionId);

        // Call our backend API to verify the session
        const response = await fetch(
          `http://localhost:4000/api/v1/payments/verify-session/${sessionId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("💳 Payment verification response:", data);

        if (data.success && data.session) {
          setPaymentDetails({
            amount: data.session.amount_total,
            currency: data.session.currency,
            status: data.session.status,
            paymentIntentId: data.session.payment_intent,
          });
          setPaymentStatus("success");
        } else {
          console.error("❌ Payment verification failed:", data.error);
          setPaymentStatus("error");
        }
      } catch (error) {
        console.error("❌ Error verifying payment:", error);
        setPaymentStatus("error");
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (paymentStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying your payment...</p>
          <p className="text-sm text-gray-500 mt-2">Session ID: {sessionId}</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-4">
            We couldn&apos;t verify your payment. Please check with support if
            you were charged.
          </p>
          <p className="text-sm text-gray-500 mb-4">Session ID: {sessionId}</p>
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your transaction has been completed
          successfully.
        </p>

        {paymentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              Payment Details
            </h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-600">Amount:</span> $
                {((paymentDetails.amount || 0) / 100).toFixed(2)}{" "}
                {(paymentDetails.currency || "USD").toUpperCase()}
              </p>
              <p>
                <span className="text-gray-600">Status:</span>{" "}
                <span className="capitalize">{paymentDetails.status}</span>
              </p>
              <p>
                <span className="text-gray-600">Session ID:</span> {sessionId}
              </p>
              {paymentDetails.paymentIntentId && (
                <p>
                  <span className="text-gray-600">Payment Intent:</span>{" "}
                  {paymentDetails.paymentIntentId}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full"
          >
            Return to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard/inbox")}
            className="w-full"
          >
            Go to Inbox
          </Button>
        </div>
      </div>
    </div>
  );
}
