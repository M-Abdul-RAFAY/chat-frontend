"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { paymentAPI } from "@/lib/api";
import {
  Plus,
  X,
  DollarSign,
  Calendar,
  Mail,
  FileText,
  CreditCard,
  Receipt,
  Sparkles,
} from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentUrl: string;
  paymentLink?: string; // For backward compatibility
  description: string;
  customerEmail: string;
  conversationId: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  customerEmail?: string;
  onPaymentCreated?: (payment: Payment) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  customerEmail = "",
  onPaymentCreated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState(customerEmail);
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState<"quick" | "items">(
    "quick"
  );

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const updated = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(updated);
  };

  const calculateTotal = () => {
    if (paymentMethod === "quick" && amount) return parseFloat(amount);
    return lineItems.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Customer email is required");
      return;
    }

    const total = calculateTotal();
    if (total <= 0) {
      alert("Payment amount must be greater than 0");
      return;
    }

    setIsLoading(true);

    try {
      const paymentData = {
        conversationId,
        amount: Math.round(total * 100), // Convert dollars to cents
        currency,
        description:
          description || `Invoice for conversation ${conversationId}`,
        customerEmail: email,
        ...(dueDate && { dueDate }),
        ...(paymentMethod === "items" &&
          lineItems.some((item) => item.description) && { lineItems }),
      };

      const payment = await paymentAPI.createPayment(paymentData);

      if (onPaymentCreated) {
        onPaymentCreated(payment);
      }

      onClose();

      // Reset form
      setAmount("");
      setDescription("");
      setEmail("");
      setDueDate("");
      setLineItems([{ description: "", quantity: 1, unitPrice: 0 }]);
      setPaymentMethod("quick");
    } catch (error) {
      console.error("Error creating payment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(
        `Failed to create payment: ${errorMessage}. Please check the console for more details.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currencySymbols = {
    usd: "$",
    eur: "€",
    gbp: "£",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in-0 duration-300">
      <div className="w-full max-w-4xl max-h-[95vh] flex items-center justify-center">
        <Card className="w-full p-0 overflow-hidden shadow-2xl border-0 animate-in zoom-in-95 duration-300 bg-white">
          <CardHeader className="relative pt-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                Create Payment Invoice
                <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gradient-to-br from-gray-50/50 to-white">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Email Section */}
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                >
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  Customer Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  required
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <Label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                >
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  Invoice Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this invoice is for..."
                  rows={3}
                  className="border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                />
              </div>

              {/* Payment Method Toggle */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                  </div>
                  Payment Method
                </Label>
                <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("quick")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      paymentMethod === "quick"
                        ? "bg-white shadow-md text-emerald-600 border-2 border-emerald-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Quick Amount
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("items")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      paymentMethod === "items"
                        ? "bg-white shadow-md text-emerald-600 border-2 border-emerald-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Receipt className="w-4 h-4" />
                      Line Items
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick Amount Section */}
              {paymentMethod === "quick" && (
                <div className="grid grid-cols-2 gap-6 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                  <div className="space-y-3">
                    <Label
                      htmlFor="amount"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Amount (
                      {
                        currencySymbols[
                          currency as keyof typeof currencySymbols
                        ]
                      }
                      )
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="h-12 text-lg font-semibold border-2 border-emerald-200 focus:border-emerald-500 rounded-xl bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="currency"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Currency
                    </Label>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full h-12 p-3 border-2 border-emerald-200 focus:border-emerald-500 rounded-xl bg-white/80 backdrop-blur-sm font-semibold transition-all duration-200"
                    >
                      <option value="usd">🇺🇸 USD - US Dollar</option>
                      <option value="eur">🇪🇺 EUR - Euro</option>
                      <option value="gbp">🇬🇧 GBP - British Pound</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Line Items Section */}
              {paymentMethod === "items" && (
                <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-700">
                      Line Items
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLineItem}
                      className="bg-white/80 backdrop-blur-sm border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {lineItems.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-3 items-end p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200"
                      >
                        <div className="col-span-5">
                          <Label className="text-xs text-gray-600 mb-1 block">
                            Description
                          </Label>
                          <Input
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="border-blue-200 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-gray-600 mb-1 block">
                            Qty
                          </Label>
                          <Input
                            type="number"
                            placeholder="1"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="border-blue-200 focus:border-blue-500 rounded-lg text-center"
                          />
                        </div>
                        <div className="col-span-3">
                          <Label className="text-xs text-gray-600 mb-1 block">
                            Unit Price
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "unitPrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="border-blue-200 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label className="text-xs text-gray-600 mb-1 block">
                            Total
                          </Label>
                          <Badge
                            variant="outline"
                            className="w-full justify-center py-2 bg-blue-100 text-blue-700 border-blue-300"
                          >
                            {
                              currencySymbols[
                                currency as keyof typeof currencySymbols
                              ]
                            }
                            {(item.quantity * item.unitPrice).toFixed(2)}
                          </Badge>
                        </div>
                        <div className="col-span-1">
                          {lineItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(index)}
                              className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Date Section */}
              <div className="space-y-3">
                <Label
                  htmlFor="dueDate"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                >
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  Due Date (Optional)
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Total Amount Display */}
              <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white shadow-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <span className="text-lg font-semibold">Total Amount:</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {
                        currencySymbols[
                          currency as keyof typeof currencySymbols
                        ]
                      }
                      {calculateTotal().toFixed(2)}
                    </div>
                    <div className="text-sm text-emerald-100 uppercase tracking-wider">
                      {currency}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || calculateTotal() <= 0}
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Invoice...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Create Invoice
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
