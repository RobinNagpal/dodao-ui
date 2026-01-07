// Gemini AI Service - Generate slide content from prompts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SlideInput, GeneratedContentAll } from "./types";
import { formatSlideNumber } from "./storage-service";

const GEMINI_MODEL = "gemini-2.5-pro";

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

  prompt += `

Output format: Return ONLY a JSON array of slides. No markdown, no explanation, just the JSON array.
Example format:
[
  {
    "id": "001",
    "type": "title",
    "title": "Presentation Title",
    "subtitle": "Subtitle here",
    "narration": "Welcome to this presentation about..."
  },
  {
    "id": "002",
    "type": "bullets",
    "title": "Key Points",
    "bullets": ["Point 1", "Point 2", "Point 3"],
    "bulletAccents": ["Point 1", "Point 2", "Point 3"],
    "narration": "Let's discuss the key points..."
  }
]`;

  return prompt;
}

/**
 * Parse and validate Gemini response
 */
function parseGeminiResponse(responseText: string): SlideInput[] {
  // Clean up response - remove markdown code blocks if present
  let cleanedText = responseText.trim();

  // Remove markdown code blocks
  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith("```")) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  // Parse JSON
  const slides = JSON.parse(cleanedText);

  if (!Array.isArray(slides)) {
    throw new Error("Response is not an array of slides");
  }

  // Validate and normalize each slide
  return slides.map((slide: any, index: number) => {
    // Ensure required fields
    if (!slide.type) {
      throw new Error(`Slide ${index + 1} missing type`);
    }
    if (!slide.narration) {
      throw new Error(`Slide ${index + 1} missing narration`);
    }

    // Normalize ID
    const id = slide.id || formatSlideNumber(index + 1);

    // Validate type
    const validTypes = ["title", "bullets", "paragraphs", "image"];
    if (!validTypes.includes(slide.type)) {
      throw new Error(`Slide ${index + 1} has invalid type: ${slide.type}`);
    }

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

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
  });

  const userPrompt = buildPrompt(prompt, numberOfSlides, additionalInstructions);

  console.log(`Generating ${numberOfSlides} slides with Gemini...`);

  const result = await model.generateContent(userPrompt);
  const response = await result.response;
  const text = response.text();

  console.log("Gemini response received, parsing...");

  const slides = parseGeminiResponse(text);

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

