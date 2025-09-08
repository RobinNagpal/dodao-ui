import { getLLMResponseForPromptViaTestInvocation, TestPromptInvocationResponse } from '@/util/get-llm-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface TestPromptInvocationRequest {
  spaceId?: string;
  promptTemplate: string;
  promptId: string;
  inputJsonString?: string;
  llmProvider: 'openai' | 'gemini';
  model: string;
  bodyToAppend?: string;
}

async function postHandler(req: NextRequest): Promise<TestPromptInvocationResponse<any>> {
  const request = (await req.json()) as TestPromptInvocationRequest;
  const { spaceId, promptTemplate, promptId, llmProvider, model, bodyToAppend, inputJsonString } = request;
  return getLLMResponseForPromptViaTestInvocation({ spaceId, promptTemplate, promptId, llmProvider, model, bodyToAppend, inputJsonString });
}

export const POST = withErrorHandlingV2<TestPromptInvocationResponse<any>>(postHandler);
