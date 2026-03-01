I have a nextjs application which uses the new router. I want to write the code for the following rote:

......

Also, create a checklist of the rules that were applicable to the
component, and the ones you have followed in the code output.

Make sure to keep it consistent with the existing code. 

Rules
- Make sure to use strict types and mention the types explicitly.
- I have `withErrorHandlingV2` middleware which handles errors in the API, logs them and returns a proper response.
- So for any exception scenarios, throw an error and it will be handled by the middleware. 
- Write the request type at the top of the file.
- For response we generally return the prisma entity itself. If present then use that one and mention the return type explicitly.
- The code you output should be consistent with the existing code of the application. 
```typescript
// app/api/[spaceId]/prompts/[promptId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, Prompt, PromptVersion } from '@prisma/client';

interface UpdatePromptRequest {
  name?: string;
  key?: string;
  excerpt?: string;
  inputSchema?: string;
  outputSchema?: string;
  sampleJson?: string;
  updatedBy?: string;
  sampleBodyToAppend?: string;
  transformationPatch?: Prisma.JsonValue;
}

export type FullPromptResponse = Prompt & { promptVersions: PromptVersion[]; activePromptVersion: PromptVersion | null };

// GET /api/[spaceId]/prompts/[promptId]
async function getPrompt(req: NextRequest, context: { params: Promise<{ spaceId: string; promptId: string }> }) {
  const { spaceId, promptId } = await context.params;

  const prompt: FullPromptResponse = await prisma.prompt.findFirstOrThrow({
    where: {
      id: promptId,
      spaceId,
    },
    include: {
      promptVersions: true,
      activePromptVersion: true,
    },
  });
  return prompt;
}

// PUT /api/[spaceId]/prompts/[promptId]
async function updatePrompt(req: NextRequest, context: { params: { spaceId: string; promptId: string } }) {
  const { spaceId, promptId } = context.params;
  const body: UpdatePromptRequest = await req.json();

  const updatedPrompt = await prisma.prompt.update({
    where: { id: promptId },
    data: {
      name: body.name,
      key: body.key,
      excerpt: body.excerpt,
      inputSchema: body.inputSchema,
      outputSchema: body.outputSchema,
      sampleJson: body.sampleJson,
      sampleBodyToAppend: body.sampleBodyToAppend,
      updatedBy: body.updatedBy,
      transformationPatch: body.transformationPatch || undefined,
    },
  });
  return updatedPrompt;
}

// DELETE /api/[spaceId]/prompts/[promptId]
async function deletePrompt(req: NextRequest, context: { params: { spaceId: string; promptId: string } }) {
  const { spaceId, promptId } = context.params;

  // Could do business logic checks here (e.g., if versions exist, etc.)
  const deleted = await prisma.prompt.delete({
    where: { id: promptId },
  });
  return deleted;
}

export const GET = withErrorHandlingV2(getPrompt);
export const PUT = withErrorHandlingV2(updatePrompt);
export const DELETE = withErrorHandlingV2(deletePrompt);


```

- The new version of nextjs requires calling await on the page component. So make sure to do that.

```ts
async function getPrompts(req: NextRequest, context: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = await context.params;

}
```
