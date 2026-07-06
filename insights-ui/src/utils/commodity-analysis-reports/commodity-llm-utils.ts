import { CommodityReportType } from '@/types/commodity/commodity-analysis-types';
import { GeminiModel, LLMProvider, getDefaultGeminiModel, getDefaultLLMProvider } from '@/types/llmConstants';
import { compileTemplate, loadSchema, validateData } from '@/util/get-llm-response';
import { getGroundedResponse, getGroundedStructuredResponse } from '@/util/llm-grounding-utils';
import {
  getCommodityInputSchemaPath,
  getCommodityOutputSchemaPath,
  resolveCommodityPromptTemplate,
} from '@/utils/commodity-analysis-reports/commodity-prompt-template-utils';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import path from 'path';

const MAX_RETRIES = 2;

/**
 * Call Gemini for structured output against a JSON schema — no prompt/invocation
 * tracking. Honours the default provider/model (plain Gemini, or grounded via the
 * 2-step search→structure path when `LLM_PROVIDER=gemini-with-grounding`). This is
 * the commodity parallel of the tariff `getLlmResponse`, kept deliberately thin:
 * the prompt already has the input embedded, and we validate the result before
 * returning it.
 */
async function invokeCommodityLlm<Output>(prompt: string, outputSchema: object): Promise<Output> {
  const provider = getDefaultLLMProvider();
  const model = getDefaultGeminiModel();

  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      let finalPrompt = prompt;

      if (provider === LLMProvider.GEMINI_WITH_GROUNDING) {
        if (model === GeminiModel.GEMINI_3_1_PRO_PREVIEW) {
          try {
            const grounded = await getGroundedStructuredResponse<Output>(prompt, model, outputSchema);
            const { valid, errors } = validateData(outputSchema, grounded.result);
            if (!valid) throw new Error(`Output validation failed: ${JSON.stringify(errors)}`);
            return grounded.result;
          } catch (singleCallErr) {
            // Fall back to the 2-step search → structured-output path.
            const search = await getGroundedResponse(prompt, model);
            finalPrompt = `Please convert the given information into the given schema format.\n\n${search.text}`;
          }
        } else {
          const search = await getGroundedResponse(prompt, model);
          finalPrompt = `Please convert the given information into the given schema format.\n\n${search.text}`;
        }
      }

      const llm = new ChatGoogleGenerativeAI({ model, apiKey: process.env.GOOGLE_API_KEY, temperature: 1 });
      const result = (await llm.withStructuredOutput(outputSchema).invoke(finalPrompt)) as Output;

      const { valid, errors } = validateData(outputSchema, result);
      if (!valid) throw new Error(`Output validation failed: ${JSON.stringify(errors)}`);
      return result;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) console.warn(`Commodity LLM attempt ${attempt + 1} failed, retrying…`, err);
    }
  }
  throw new Error(`Commodity LLM failed after ${MAX_RETRIES + 1} attempts: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`);
}

/**
 * Generate one commodity report: embed the input JSON into the file-backed prompt
 * template, then call the LLM for the matching structured output. Nothing is
 * stored except the final report (persisted by the caller) — no `Prompt`,
 * `PromptVersion`, or `PromptInvocation` rows, mirroring the tariff scripts.
 */
export async function generateCommodityReportResponse(reportType: CommodityReportType, inputJson: Record<string, unknown>): Promise<unknown> {
  const finalPrompt = compileTemplate(resolveCommodityPromptTemplate(reportType), inputJson);

  // Cheap safety net: validate the assembled input against its schema.
  const inputSchemaName = getCommodityInputSchemaPath(reportType);
  const inputSchema = await loadSchema(path.join(process.cwd(), 'schemas', inputSchemaName), inputSchemaName);
  const { valid, errors } = validateData(inputSchema, inputJson);
  if (!valid) {
    throw new Error(`Commodity input validation failed for ${reportType}: ${JSON.stringify(errors)}`);
  }

  const outputSchemaName = getCommodityOutputSchemaPath(reportType);
  const outputSchema = await loadSchema(path.join(process.cwd(), 'schemas', outputSchemaName), outputSchemaName);

  return invokeCommodityLlm(finalPrompt, outputSchema);
}
