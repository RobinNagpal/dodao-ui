import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { NextRequest } from 'next/server';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';

export interface PromptInvocationRequest {
  spaceId?: string;
  inputJson?: Record<string, unknown>;
  promptKey: string;
  llmProvider: LLMProvider;
  model: GeminiModel;
  bodyToAppend?: string;
  requestFrom: 'ui' | 'langflow';
}

export interface PromptInvocationResponse {
  request: PromptInvocationRequest;
  prompt: string;
  response: Record<string, unknown>;
  invocationId: string;
}

async function postHandler(req: NextRequest, _userContext: KoalaGainsJwtTokenPayload | null): Promise<any> {
  const request = await req.json();
  const { promptKey, llmProvider, model, bodyToAppend, requestFrom = 'ui' } = request as PromptInvocationRequest;

  // Default inputJson to an empty object if it is not attached
  const inputJson = request.inputJson;

  if (!req.body) {
    throw new Error(`Request body is missing`);
  }

  return await getLLMResponseForPromptViaInvocation({
    inputJson,
    promptKey,
    llmProvider,
    model,
    bodyToAppend,
    requestFrom,
  });
}

export const POST = withAdminOrToken<any>(postHandler);
