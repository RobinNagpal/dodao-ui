import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { getLLMResponseForPromptViaTestInvocation, TestPromptInvocationResponse } from '@/util/get-llm-response';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { NextRequest } from 'next/server';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';

export interface TestPromptInvocationRequest {
  spaceId?: string;
  promptTemplate: string;
  promptId: string;
  inputJsonString?: string;
  llmProvider: LLMProvider;
  model: GeminiModel;
  bodyToAppend?: string;
}

async function postHandler(req: NextRequest, _userContext: KoalaGainsJwtTokenPayload | null): Promise<TestPromptInvocationResponse<any>> {
  const request = (await req.json()) as TestPromptInvocationRequest;
  const { spaceId, promptTemplate, promptId, llmProvider, model, bodyToAppend, inputJsonString } = request;
  return getLLMResponseForPromptViaTestInvocation({ spaceId, promptTemplate, promptId, llmProvider, model, bodyToAppend, inputJsonString });
}

export const POST = withAdminOrToken<TestPromptInvocationResponse<any>>(postHandler);
