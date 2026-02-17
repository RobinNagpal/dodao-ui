import { GoogleGenAI } from '@google/genai';

export interface EvaluationResult {
  evaluatedScore: number;
  evaluationReasoning: string;
}

export interface LLMConfig {
  model?: string;
}

const DEFAULT_MODEL = 'gemini-2.5-pro';

/**
 * Initialize Gemini AI client with grounding always enabled
 */
function initializeGeminiAI(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });
}

/**
 * Core AI generation function with grounding always enabled
 */
async function generateContentWithAI(prompt: string, model: string = DEFAULT_MODEL): Promise<string> {
  const ai = initializeGeminiAI();

  // Always use grounding
  const groundingTool = { googleSearch: {} };
  const aiConfig = { tools: [groundingTool] };

  console.log('AI Generation Prompt:', prompt);

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: aiConfig,
  });

  const aiResponse = response.text?.trim() || '';
  console.log('AI Response:', aiResponse);

  return aiResponse;
}

/**
 * Generate AI response for a given prompt
 */
export async function generateAIResponse(prompt: string, model: string = DEFAULT_MODEL): Promise<string> {
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

  const aiResponse = await generateContentWithAI(evaluationPrompt, model);

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
