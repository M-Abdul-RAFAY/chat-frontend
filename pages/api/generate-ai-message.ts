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

  const { prompt, maxSuggestions = 2 } = req.body;
  console.log(
    "[API] Received prompt:",
    prompt,
    "maxSuggestions:",
    maxSuggestions
  );
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
          content: `You are a helpful customer support agent. Generate exactly ${maxSuggestions} different response suggestions in JSON format. 
          Include both quick responses (like "Thank you!", "Great!", "Sounds good!") and more detailed helpful responses.
          Return ONLY a valid JSON array with objects containing 'text' and 'type' properties where type is either 'quick' or 'detailed'.
          Make sure to return exactly ${maxSuggestions} suggestions, no more, no less.
          Example: [{"text": "Thank you!", "type": "quick"}, {"text": "I'd be happy to help you with that.", "type": "detailed"}]`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    console.log("[API] OpenAI SDK response:", completion);
    const aiMessage = completion.choices?.[0]?.message?.content?.trim() || "";

    // Try to parse and validate the JSON response
    try {
      const suggestions = JSON.parse(aiMessage);
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        // Limit to maxSuggestions
        const limitedSuggestions = suggestions.slice(0, maxSuggestions);
        return res
          .status(200)
          .json({ message: JSON.stringify(limitedSuggestions) });
      } else {
        // Fallback if not proper format
        const fallbackSuggestions = [
          { text: "Thank you!", type: "quick" },
          {
            text: aiMessage || "I'd be happy to help you with that.",
            type: "detailed",
          },
        ].slice(0, maxSuggestions);
        return res
          .status(200)
          .json({ message: JSON.stringify(fallbackSuggestions) });
      }
    } catch (parseError) {
      // If response is not JSON, create structured suggestions
      const fallbackSuggestions = [
        { text: "Thank you!", type: "quick" },
        {
          text: aiMessage || "I'd be happy to help you with that.",
          type: "detailed",
        },
      ].slice(0, maxSuggestions);
      return res
        .status(200)
        .json({ message: JSON.stringify(fallbackSuggestions) });
    }
  } catch (error: unknown) {
    console.log("[API] Exception:", error);
    let message = "Internal server error";
    if (error && typeof error === "object" && "message" in error) {
      message = (error as any).message;
    }

    // Return fallback suggestions even on error
    const fallbackSuggestions = [
      { text: "Thank you for reaching out!", type: "quick" },
      { text: "I'd be happy to help you with that.", type: "detailed" },
    ].slice(0, maxSuggestions);

    return res
      .status(200)
      .json({ message: JSON.stringify(fallbackSuggestions) });
  }
}
