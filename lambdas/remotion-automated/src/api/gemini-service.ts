// Gemini AI Service - Generate slide content from prompts
import { GoogleGenAI } from "@google/genai";
import type { SlideInput, GeneratedContentAll } from "./types";
import { formatSlideNumber } from "./storage-service";

const GEMINI_MODEL = "gemini-2.5-pro";

/**
 * JSON Schema for the structured output of generated slides.
 * Used with Gemini's native structured output (responseMimeType + responseJsonSchema).
 */
const SLIDES_JSON_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      id: { type: "string", description: "Unique identifier (e.g., '001', '002')" },
      type: { type: "string", enum: ["title", "bullets", "paragraphs", "image"] },
      title: { type: "string" },
      subtitle: { type: "string" },
      titleAccent: { type: "string" },
      bullets: { type: "array", items: { type: "string" } },
      bulletAccents: { type: "array", items: { type: "string" } },
      paragraphs: { type: "array", items: { type: "string" } },
      paragraphAccents: { type: "array", items: { type: "string" } },
      footer: { type: "string" },
      imageUrl: { type: "string" },
      narration: { type: "string", description: "Spoken script for this slide (2-4 sentences)" },
    },
    required: ["id", "type", "narration"],
  },
};

/**
 * System prompt for generating presentation slides
 */
const SYSTEM_PROMPT = `You are a professional presentation content creator. Generate high-quality, engaging slide content for educational or business presentations.

Your output MUST be valid JSON that matches the following structure exactly. Do not include any markdown code blocks or extra text.

Each slide should have:
- id: A unique identifier (e.g., "001", "002")
- type: One of "title", "bullets", "paragraphs", or "image"
- narration: The spoken script for this slide (2-4 sentences, conversational tone)

Based on slide type:

For "title" slides:
- title: Main title text
- subtitle: Optional subtitle

For "bullets" slides:
- title: Section heading
- titleAccent: Optional word/phrase in title to highlight
- bullets: Array of 3-7 bullet points (each 1-2 sentences)
- bulletAccents: Optional array of key terms to highlight per bullet

For "paragraphs" slides:
- title: Section heading
- titleAccent: Optional word/phrase to highlight
- paragraphs: Array of 2-3 paragraphs
- paragraphAccents: Optional array of key phrases per paragraph
- footer: Optional source/reference

For "image" slides:
- title: Section heading
- titleAccent: Optional word/phrase to highlight
- bullets: Array of 3-5 brief points
- bulletAccents: Optional highlights
- imageUrl: Use a placeholder URL like "https://images.unsplash.com/photo-placeholder"

Guidelines:
1. Start with a "title" slide
2. Use a mix of bullet, paragraph, and image slides for variety
3. Keep bullet points concise but informative
4. Narrations should be natural, as if speaking to an audience
5. Include data/statistics when relevant
6. End with a summary or conclusion slide
7. Accent/highlight important terms, numbers, or key concepts`;

/**
 * Generate the prompt for Gemini
 */
function buildPrompt(
  userPrompt: string,
  numberOfSlides: number,
  additionalInstructions?: string
): string {
  let prompt = `Create a presentation with ${numberOfSlides} slides about the following topic:

${userPrompt}`;

  if (additionalInstructions) {
    prompt += `

Additional requirements:
${additionalInstructions}`;
  }

  return prompt;
}

/**
 * Validate and normalize parsed slides from Gemini structured output
 */
function validateAndNormalizeSlides(slides: any[]): SlideInput[] {
  return slides.map((slide: any, index: number) => {
    // Normalize ID
    const id = slide.id || formatSlideNumber(index + 1);

    // Build normalized slide
    const normalizedSlide: SlideInput = {
      id,
      type: slide.type,
      narration: slide.narration,
    };

    // Add type-specific fields
    if (slide.title) normalizedSlide.title = slide.title;
    if (slide.subtitle) normalizedSlide.subtitle = slide.subtitle;
    if (slide.titleAccent) normalizedSlide.titleAccent = slide.titleAccent;
    if (slide.bullets) normalizedSlide.bullets = slide.bullets;
    if (slide.bulletAccents) normalizedSlide.bulletAccents = slide.bulletAccents;
    if (slide.paragraphs) normalizedSlide.paragraphs = slide.paragraphs;
    if (slide.paragraphAccents) normalizedSlide.paragraphAccents = slide.paragraphAccents;
    if (slide.footer) normalizedSlide.footer = slide.footer;
    if (slide.imageUrl) normalizedSlide.imageUrl = slide.imageUrl;

    return normalizedSlide;
  });
}

/**
 * Generate slide content from a prompt using Gemini AI
 */
export async function generateSlidesFromPrompt(
  prompt: string,
  numberOfSlides: number = 5,
  additionalInstructions?: string
): Promise<SlideInput[]> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GOOGLE_API_KEY environment variable");
  }

  const genAI = new GoogleGenAI({ apiKey });

  const userPrompt = buildPrompt(prompt, numberOfSlides, additionalInstructions);

  console.log(`Generating ${numberOfSlides} slides with Gemini (structured output)...`);

  const result = await genAI.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: SLIDES_JSON_SCHEMA,
    },
  });

  const text = result.text || "";

  if (!text) {
    throw new Error("No text returned from Gemini structured output");
  }

  console.log("Gemini structured response received, parsing...");

  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed)) {
    throw new Error("Response is not an array of slides");
  }

  const slides = validateAndNormalizeSlides(parsed);

  console.log(`Successfully generated ${slides.length} slides`);

  return slides;
}

/**
 * Generate complete presentation content and return structured data
 */
export async function generatePresentationContent(
  presentationId: string,
  prompt: string,
  numberOfSlides: number = 5,
  additionalInstructions?: string
): Promise<GeneratedContentAll> {
  const slides = await generateSlidesFromPrompt(prompt, numberOfSlides, additionalInstructions);

  const generatedContent: GeneratedContentAll = {
    presentationId,
    prompt,
    slides: slides.map((slide, index) => ({
      slideNumber: formatSlideNumber(index + 1),
      slide,
      generatedAt: new Date().toISOString(),
    })),
    generatedAt: new Date().toISOString(),
    model: GEMINI_MODEL,
  };

  return generatedContent;
}
