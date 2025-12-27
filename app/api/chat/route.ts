import { NextResponse } from "next/server";
import {
  formatFinancialContext,
  getMockAIResponse,
} from "@/lib/services/aiService";

export async function POST(req: Request) {
  try {
    const { message, snapshot } = await req.json();
    const apiKey = req.headers.get("x-api-key");
    const provider =
      (req.headers.get("x-provider") as "openai" | "gemini" | null) || "openai";

    // Validate context
    if (!message || !snapshot) {
      return NextResponse.json(
        { error: "Message and user snapshot are required" },
        { status: 400 }
      );
    }

    const context = formatFinancialContext(snapshot);

    // If API Key is present, try real API call
    if (apiKey) {
      try {
        const reply = await callRealAI(provider, apiKey, message, context);
        return NextResponse.json({ reply });
      } catch (apiError: any) {
        console.error("Real AI Call Failed:", apiError);
        // Fallback to mock or return error?
        // Better to return error so user knows key might be wrong
        return NextResponse.json({
          reply: `Error connecting to ${provider}: ${apiError.message}. Switching to offline mode.`,
        });
      }
    }

    // Default to Mock
    const response = await getMockAIResponse(message, context);
    return NextResponse.json({ reply: response });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

async function callRealAI(
  provider: "openai" | "gemini",
  apiKey: string,
  message: string,
  context: string
): Promise<string> {
  const systemPrompt = `You are a helpful and empathetic financial advisor for TCAP (Thai Credit Ability Planner). 
    
    ${context}
    
    Analyze the user's financial situation based on the snapshot above.
    - Be encouraging but realistic.
    - If DSR is >40%, warn them about high debt burden.
    - Suggest specific strategies (Avalanche vs Snowball) if asked about debt paydown.
    - Keep answers concise (under 100 words) and actionable.
    - Answer in the same language as the user (English or Thai).
    `;

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 300,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "OpenAI API Error");
    return data.choices[0].message.content;
  }

  if (provider === "gemini") {
    // Updated to Gemini 2.5 Flash Lite as requested
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUser Question: ${message}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Gemini API Error");
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error("Unsupported provider");
}
