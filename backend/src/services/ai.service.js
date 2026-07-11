import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client lazily so it doesn't fail on boot if GEMINI_API_KEY is not set
let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey || apiKey.startsWith('your_gemini_api_key')) {
      throw new Error('GEMINI_API_KEY environment variable is not set. Please obtain an API key from Google AI Studio and place it in your .env file.');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

/**
 * Generates a 768-dimension vector embedding for the input text using gemini-embedding-001.
 */
export const generateEmbeddings = async (text) => {
  const ai = getGenAI();
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });
  if (!result || !result.embeddings || !result.embeddings[0]?.values) {
    throw new Error('Failed to generate embedding from Gemini API.');
  }
  return result.embeddings[0].values;
};

/**
 * Generates a structured JSON summary analysis of the provided text.
 */
export const generateSummary = async (text) => {
  const ai = getGenAI();

  const prompt = `
Analyze the following document text and return a structured JSON object.
The JSON object MUST strictly adhere to this format:
{
  "summary": "A concise paragraph summarizing the document.",
  "keyPoints": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    ...
  ],
  "importantDates": [
    "Date/Deadline - Event description",
    ...
  ],
  "actionItems": [
    "Task or step to complete",
    ...
  ],
  "faqs": [
    { "q": "Frequently asked question?", "a": "Clear answer based on the document." },
    ...
  ]
}

Document Text:
${text}
  `;

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const responseText = result.text;
  return JSON.parse(responseText);
};

/**
 * Creates a streaming completion generator for answering user questions in a RAG pipeline.
 */
export const askGeminiStream = async (context, question) => {
  const ai = getGenAI();

  const prompt = `
You are an expert document assistant. You have been provided with the relevant context from a PDF document to answer the user's question.

Document Context:
---
${context}
---

User Question:
${question}

Instructions:
1. Use the provided Document Context to answer the question as accurately and specifically as possible.
2. If the user asks for suggestions, recommendations, analysis, or how to improve/enhance something (e.g. "how to enhance my resume", "how to improve this section", "explain this part in more detail"), combine the document context with your general intelligence and LLM knowledge to provide constructive, detailed advice.
3. If the user's question is general but related to the document context, feel free to elaborate using your general knowledge, while keeping the document context as the main reference.
4. Keep the output beautifully formatted with markdown (lists, bolding, sections) where appropriate.
`;

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return responseStream;
};
