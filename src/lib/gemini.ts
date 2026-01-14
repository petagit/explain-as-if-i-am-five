import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

export async function generateExplanation(
  topic: string,
  levelPrompt: string
): Promise<string> {
  const prompt = `${levelPrompt}

Topic to explain: ${topic}

Provide a clear, engaging explanation appropriate for the specified audience level.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}
