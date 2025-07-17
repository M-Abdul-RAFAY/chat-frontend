import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("[API] generate-bulk-message called");
  if (req.method !== "POST") {
    console.log("[API] Method not allowed: ", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { businessInfo, title } = req.body;
  console.log("[API] Received businessInfo:", businessInfo, "title:", title);

  try {
    // Create a context prompt based on business info and title
    let contextPrompt =
      "You are a professional marketing assistant for a business.";

    if (businessInfo && businessInfo.name) {
      contextPrompt += ` The business is called "${businessInfo.name}".`;

      if (businessInfo.formattedAddress) {
        contextPrompt += ` It's located at ${businessInfo.formattedAddress}.`;
      }

      if (businessInfo.phoneNumber) {
        contextPrompt += ` Contact number: ${businessInfo.phoneNumber}.`;
      }

      if (businessInfo.website) {
        contextPrompt += ` Website: ${businessInfo.website}.`;
      }

      if (businessInfo.types && businessInfo.types.length > 0) {
        contextPrompt += ` Business type: ${businessInfo.types.join(", ")}.`;
      }

      if (businessInfo.rating) {
        contextPrompt += ` Rating: ${businessInfo.rating} stars.`;
      }
    }

    let userPrompt =
      "Generate a professional bulk message for a marketing campaign.";

    if (title && title.trim()) {
      userPrompt += ` The campaign title is: "${title}".`;
    }

    userPrompt += ` The message should be:
    - Professional and engaging
    - Suitable for bulk messaging to customers
    - Include a clear call-to-action
    - Be personalized to the business
    - Keep it concise (under 160 characters if possible)
    - Include relevant business information naturally
    
    Return only the message content, no additional formatting or explanations.`;

    console.log("[API] Sending request to OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: contextPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    console.log("[API] OpenAI response:", completion);
    const aiMessage = completion.choices?.[0]?.message?.content?.trim() || "";

    if (!aiMessage) {
      throw new Error("No message generated from AI");
    }

    return res.status(200).json({ message: aiMessage });
  } catch (error) {
    console.error("[API] Error generating bulk message:", error);
    return res.status(500).json({
      error: "Failed to generate message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
