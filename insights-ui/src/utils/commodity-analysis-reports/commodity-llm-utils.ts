import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CommodityReportType } from '@/types/commodity/commodity-analysis-types';
import { getDefaultGeminiModel, getDefaultLLMProvider } from '@/types/llmConstants';
import { compileTemplate, createPromptInvocation, loadSchema, updateInvocationStatus, validateData } from '@/util/get-llm-response';
import { processCommodityReportLLMResponseInBackground } from '@/utils/commodity-analysis-reports/background-commodity-llm-generation-utils';
import {
  getCommodityInputSchemaPath,
  getCommodityOutputSchemaPath,
  resolveCommodityPromptTemplate,
} from '@/utils/commodity-analysis-reports/commodity-prompt-template-utils';
import path from 'path';
import { Prompt, PromptInvocationStatus, PromptVersion } from '@prisma/client';

export interface CommodityLLMRequest {
  slug: string;
  inputJson: Record<string, unknown>;
  promptKey: string;
  spaceId: string;
  reportType: CommodityReportType;
}

/**
 * Ensure a tracked `Prompt` (+ active `PromptVersion`) exists for a commodity
 * prompt key. Commodity prompt text is file-backed, so the DB row exists only so
 * every invocation is recorded in the prompt-invocation tooling. We upsert it
 * lazily on first use — no manual seeding or migration needed — storing the
 * current file-backed template as the version text for record-keeping. The
 * template actually sent to the LLM is always re-read from disk by the caller.
 */
async function ensureCommodityPrompt(
  promptKey: string,
  spaceId: string,
  reportType: CommodityReportType
): Promise<Prompt & { activePromptVersion: PromptVersion | null }> {
  const existing = await prisma.prompt.findFirst({
    where: { spaceId, key: promptKey },
    include: { activePromptVersion: true },
  });
  if (existing?.activePromptVersion) return existing;

  const templateText = resolveCommodityPromptTemplate(reportType);
  const inputSchema = getCommodityInputSchemaPath(reportType);
  const outputSchema = getCommodityOutputSchemaPath(reportType);

  const prompt =
    existing ??
    (await prisma.prompt.create({
      data: {
        spaceId,
        name: `Commodity ${reportType}`,
        key: promptKey,
        excerpt: `Commodity report prompt for ${reportType}`,
        inputSchema,
        outputSchema,
        createdBy: 'system',
        updatedBy: 'system',
      },
    }));

  const version = await prisma.promptVersion.create({
    data: {
      spaceId,
      promptId: prompt.id,
      version: 1,
      promptTemplate: templateText,
      commitMessage: 'Initial file-backed commodity prompt',
      createdBy: 'system',
      updatedBy: 'system',
    },
  });

  const updated = await prisma.prompt.update({
    where: { id: prompt.id },
    data: { activePromptVersionId: version.id, inputSchema, outputSchema, updatedAt: new Date() },
    include: { activePromptVersion: true },
  });
  return updated;
}

/**
 * Invoke the LLM for a commodity report step. Records a `PromptInvocation`,
 * validates the input, compiles the file-backed template, then runs the LLM
 * in-process in the background (the AWS Lambda path is not used for commodities —
 * we run on a long-lived server). Mirrors `callEtfLambdaForLLMResponse` minus the
 * lambda branch.
 */
export async function callCommodityLLMResponse(args: CommodityLLMRequest): Promise<void> {
  const { slug, inputJson, promptKey, spaceId, reportType } = args;

  const resolvedSpaceId = spaceId || KoalaGainsSpaceId;
  const llmProvider = getDefaultLLMProvider();
  const model = getDefaultGeminiModel();

  const prompt = await ensureCommodityPrompt(promptKey, resolvedSpaceId, reportType);
  if (!prompt.activePromptVersion) {
    throw new Error(`Active prompt version not found for commodity template ${promptKey}`);
  }

  const invocation = await createPromptInvocation(
    { spaceId: resolvedSpaceId, llmProvider, model },
    { promptId: prompt.id, promptVersionId: prompt.activePromptVersion.id, inputJson }
  );

  try {
    const templateContent = resolveCommodityPromptTemplate(reportType);

    const inputSchemaName = getCommodityInputSchemaPath(reportType);
    const inputSchemaPath = path.join(process.cwd(), 'schemas', inputSchemaName);
    const inputSchemaObject = await loadSchema(inputSchemaPath, inputSchemaName);
    const { valid, errors } = validateData(inputSchemaObject, inputJson);
    if (!valid) {
      throw new Error(`Input validation failed: ${JSON.stringify(errors)}`);
    }

    const finalPrompt = compileTemplate(templateContent, inputJson || {});

    await updateInvocationStatus(invocation.id, PromptInvocationStatus.InProgress, {
      promptRequestToLlm: finalPrompt,
    });

    const outputSchemaName = getCommodityOutputSchemaPath(reportType);
    const outputSchemaPath = path.join(process.cwd(), 'schemas', outputSchemaName);
    const outputSchema = await loadSchema(outputSchemaPath, outputSchemaName);

    void processCommodityReportLLMResponseInBackground({
      slug,
      reportType,
      invocationId: invocation.id,
      llmProvider,
      model,
      prompt: finalPrompt,
      outputSchema,
    });
  } catch (e) {
    console.error('Error during commodity prompt invocation:', e);
    await updateInvocationStatus(invocation.id, PromptInvocationStatus.Failed, {
      error: (e as Error)?.message,
    });
    throw e;
  }
}
