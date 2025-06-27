import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("[API] generate-ai-message called");
  if (req.method !== "POST") {
    console.log("[API] Method not allowed: ", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  console.log("[API] Received prompt:", prompt);
  if (!prompt) {
    console.log("[API] No prompt provided");
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    console.log("[API] Sending request to OpenAI SDK...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful customer support agent.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 60,
    });
    console.log("[API] OpenAI SDK response:", completion);
    const aiMessage = completion.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ message: aiMessage });
  } catch (error: unknown) {
    console.log("[API] Exception:", error);
    let message = "Internal server error";
    if (error && typeof error === "object" && "message" in error) {
      message = (error as any).message;
    }
    return res.status(500).json({ error: message });
  }
}
