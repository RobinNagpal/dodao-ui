import { GoogleGenAI } from '@google/genai';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

export interface EvaluationResult {
  evaluatedScore: number;
  evaluationReasoning: string;
}

export interface AIResponse {
  text: string;
  model: string;
}

export interface LLMConfig {
  model?: string;
}

const DEFAULT_MODEL = 'gemini-2.5-pro';
const FALLBACK_MODEL = 'gemini-2.5-flash';
const BEDROCK_FALLBACK_MODEL = 'moonshotai.kimi-k2.5';

/**
 * Initialize Gemini AI client with grounding always enabled
 */
function initializeGeminiAI(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });
}

/**
 * Initialize AWS Bedrock client
 */
function initializeBedrockClient(): BedrockRuntimeClient {
  return new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
  });
}

/**
 * Generate content using AWS Bedrock with kimi2.5 model via Converse API
 */
async function generateContentWithBedrock(prompt: string): Promise<AIResponse> {
  const client = initializeBedrockClient();

  console.log('Using Bedrock fallback model:', BEDROCK_FALLBACK_MODEL);

  const command = new ConverseCommand({
    modelId: BEDROCK_FALLBACK_MODEL,
    messages: [
      {
        role: 'user',
        content: [{ text: prompt }],
      },
    ],
  });

  const response = await client.send(command);

  const aiResponse =
    response.output?.message?.content
      ?.map((block) => block.text)
      .filter(Boolean)
      .join('')
      .trim() || '';
  console.log('AI Response (Bedrock fallback):', aiResponse);

  return { text: aiResponse, model: BEDROCK_FALLBACK_MODEL };
}

/**
 * Core AI generation function and automatic fallback.
 * Falls back to the next model on errors OR empty responses.
 */
async function generateContentWithAI(prompt: string, model: string = DEFAULT_MODEL): Promise<AIResponse> {
  const ai = initializeGeminiAI();

  console.log('AI Generation Prompt:', prompt);
  console.log('Using model:', model);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const aiResponse = response.text?.trim() || '';
    console.log('AI Response:', aiResponse);

    if (!aiResponse && model !== FALLBACK_MODEL) {
      console.warn(`Empty response from model ${model}, falling back to ${FALLBACK_MODEL}`);
      return generateWithGeminiFallback(ai, prompt);
    }
    if (!aiResponse) {
      console.warn(`Empty response from model ${model}, falling back to Bedrock ${BEDROCK_FALLBACK_MODEL}`);
      return generateContentWithBedrock(prompt);
    }

    return { text: aiResponse, model };
  } catch (error) {
    if (model !== FALLBACK_MODEL) {
      console.warn(`Error with model ${model}, falling back to ${FALLBACK_MODEL}:`, error instanceof Error ? error.message : error);
      return generateWithGeminiFallback(ai, prompt);
    }

    console.warn(`Error with model ${model}, falling back to Bedrock ${BEDROCK_FALLBACK_MODEL}:`, error instanceof Error ? error.message : error);
    return generateContentWithBedrock(prompt);
  }
}

async function generateWithGeminiFallback(ai: GoogleGenAI, prompt: string): Promise<AIResponse> {
  try {
    const response = await ai.models.generateContent({
      model: FALLBACK_MODEL,
      contents: prompt,
    });

    const aiResponse = response.text?.trim() || '';
    console.log('AI Response (fallback):', aiResponse);

    if (!aiResponse) {
      console.warn(`Empty response from fallback model ${FALLBACK_MODEL}, falling back to Bedrock ${BEDROCK_FALLBACK_MODEL}`);
      return generateContentWithBedrock(prompt);
    }

    return { text: aiResponse, model: FALLBACK_MODEL };
  } catch (fallbackError) {
    console.warn(
      `Error with fallback model ${FALLBACK_MODEL}, falling back to Bedrock ${BEDROCK_FALLBACK_MODEL}:`,
      fallbackError instanceof Error ? fallbackError.message : fallbackError
    );
    return generateContentWithBedrock(prompt);
  }
}

/**
 * Generate AI response for a given prompt
 */
export async function generateAIResponse(prompt: string, model: string = DEFAULT_MODEL): Promise<AIResponse> {
  return generateContentWithAI(prompt, model);
}

/**
 * Evaluate a student's prompt using AI
 */
export async function evaluateStudentPrompt(
  prompt: string,
  exerciseTitle: string,
  exerciseDescription: string,
  exerciseInstructions: string,
  gradingLogic?: string,
  model: string = 'gemini-2.5-flash'
): Promise<EvaluationResult> {
  const evaluationPrompt = `
You are an expert evaluator for business case study exercises. Your task is to evaluate a student's prompt based on the exercise requirements and grading criteria.

**Exercise Details:**
Title: ${exerciseTitle}
Description: ${exerciseDescription}
Instructions: ${exerciseInstructions || 'No specific instructions provided'}

**Grading Logic:**
${
  gradingLogic ||
  'Evaluate based on clarity, relevance, depth of analysis, and practical application. Consider how well the prompt addresses the exercise objectives.'
}

**Student's Prompt to Evaluate:**
${prompt}

**Evaluation Requirements:**
1. Score the prompt from 0 to 10 (10 being excellent, 0 being poor)
2. Provide detailed evaluation reasoning explaining your scoring

**Response Format (JSON only):**
{
  "evaluatedScore": [number from 0-10],
  "evaluationReasoning": "[detailed explanation of the scoring reasoning, including strengths and areas for improvement]"
}

Only respond with the JSON object, no additional text.`;

  console.log('Evaluation Prompt:', evaluationPrompt);

  const { text: aiResponse } = await generateContentWithAI(evaluationPrompt, model);

  // Parse AI response
  let evaluationResult: EvaluationResult;
  try {
    // Remove any potential markdown formatting
    const cleanResponse = aiResponse.replace(/```json\n?|```\n?/g, '');
    evaluationResult = JSON.parse(cleanResponse);
  } catch (parseError) {
    console.error('Failed to parse AI response:', aiResponse);
    throw new Error('AI returned invalid response format');
  }

  const { evaluatedScore, evaluationReasoning } = evaluationResult;

  // Validate the response
  if (typeof evaluatedScore !== 'number' || evaluatedScore < 0 || evaluatedScore > 10) {
    throw new Error('Invalid evaluated score from AI');
  }

  if (!evaluationReasoning || typeof evaluationReasoning !== 'string') {
    throw new Error('Invalid evaluation logic from AI');
  }

  return {
    evaluatedScore: Math.round(evaluatedScore * 100) / 100,
    evaluationReasoning,
  };
}
