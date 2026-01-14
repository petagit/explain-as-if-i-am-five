import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getLevelPrompt, ExplanationLevel } from "@/lib/prompts";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, level, stream } = body as {
      topic: string;
      level: ExplanationLevel;
      stream?: boolean;
    };

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return Response.json({ error: "Topic is required" }, { status: 400 });
    }

    if (!level) {
      return Response.json({ error: "Level is required" }, { status: 400 });
    }

    const levelPrompt = getLevelPrompt(level);
    const prompt = `${levelPrompt}

Topic to explain: ${topic.trim()}

Provide a clear, engaging explanation appropriate for the specified audience level. Use markdown formatting where helpful (bold for emphasis, bullet points for lists).`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Streaming response
    if (stream) {
      const result = await model.generateContentStream(prompt);

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming response (fallback)
    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    return Response.json({ explanation });
  } catch (error) {
    console.error("Error generating explanation:", error);

    if (error instanceof Error && error.message.includes("Unknown level")) {
      return Response.json({ error: "Invalid level specified" }, { status: 400 });
    }

    return Response.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
