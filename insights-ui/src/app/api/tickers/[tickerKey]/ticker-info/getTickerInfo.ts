import { PromptInvocationStatus, Ticker } from '@prisma/client';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { prisma } from '@/prisma';
import path from 'path';
import fs from 'fs';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { ChatOpenAI } from '@langchain/openai';
import Handlebars from 'handlebars';
import { validateData } from '@/app/api/actions/prompt-invocation/full-req-resp/route';

interface ComparableReit {
  ticker: string;
  companyName: string;
  businessModel: string;
  occupancyRate: string;
  dividendProfile: string;
  comparisonParagraph: string;
}

export async function getTickerInfo(ticker: Ticker): Promise<string> {
  const inputJson = {
    tickerKey: ticker.tickerKey,
    companyName: ticker.companyName,
    shortDescription: ticker.shortDescription,
    referenceDate: 'April 20, 2025',
  };

  const prompt = await prisma.prompt.findFirstOrThrow({
    where: {
      spaceId: KoalaGainsSpaceId,
      key: 'US/public-equities/real-estate/equity-reits/ticker-info',
    },
    include: {
      activePromptVersion: true,
    },
  });

  if (!prompt.activePromptVersion) {
    throw new Error(`Active prompt version not found for template 'US/public-equities/real-estate/equity-reits/ticker-info`);
  }

  const invocation = await prisma.promptInvocation.create({
    data: {
      spaceId: KoalaGainsSpaceId,
      inputJson: JSON.stringify(inputJson),
      promptId: prompt.id,
      promptVersionId: prompt.activePromptVersion.id,
      status: PromptInvocationStatus.InProgress,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'unknown',
      updatedBy: 'unknown',
      llmProvider: 'openai',
      model: 'o4-mini',
    },
  });

  let result: any;
  try {
    const templateContent = prompt.activePromptVersion.promptTemplate;

    if (prompt.inputSchema && prompt.inputSchema.trim() !== '') {
      const inputSchemaPath = path.join(process.cwd(), 'schemas', prompt.inputSchema);
      if (!fs.existsSync(inputSchemaPath)) {
        throw new Error(`Input schema file ${prompt.inputSchema} not found. Path ${inputSchemaPath}`);
      }
      const inputSchema = await $RefParser.dereference(inputSchemaPath);
      const { valid, errors } = validateData(inputSchema, inputJson);
      if (!valid) {
        throw new Error(`Input validation failed: ${JSON.stringify(errors)}`);
      }
    }

    // Compile the Handlebars template with the provided input.
    const compiledTemplate = Handlebars.compile(templateContent);
    const finalPrompt = compiledTemplate(inputJson || {});

    const llm = new ChatOpenAI({ model: 'o4-mini' });

    const outputSchemaPath = path.join(process.cwd(), 'schemas', prompt.outputSchema);
    if (!fs.existsSync(outputSchemaPath)) {
      throw new Error(`Output schema file ${prompt.outputSchema} not found`);
    }

    const outputSchema = await $RefParser.dereference(outputSchemaPath);

    const modelWithStructure = llm.withStructuredOutput(outputSchema);
    result = await modelWithStructure.invoke(finalPrompt);
    if (result) {
      await prisma.promptInvocation.update({
        where: {
          id: invocation.id,
        },
        data: {
          outputJson: JSON.stringify(result),
          updatedAt: new Date(),
          status: PromptInvocationStatus.Completed,
        },
      });
    }
    const { valid: validOutput, errors: outputErrors } = validateData(outputSchema, result);

    if (!validOutput) {
      throw new Error(`Output validation failed: ${JSON.stringify(outputErrors)}`);
    }
  } catch (e) {
    await prisma.promptInvocation.update({
      where: {
        id: invocation.id,
      },
      data: {
        status: PromptInvocationStatus.Failed,
        error: (e as any)?.message,
        updatedAt: new Date(),
      },
    });

    throw e;
  }

  const aboutTickerString = `
***Years Since IPO***: ${result.yearsSinceIpo}
    
***REIT Type***: ${result.gicsClassification.subIndustry}
    
***Business Model***: ${result.businessModel}
    
***Dividend Profile***: ${result.dividendProfile}
    
***Competitive Edge***:
${result.competitiveEdge.map((edge: string[]) => `- ${edge}`).join('\n')}
    
***Comparables***:
${result.comparables
  .map(
    (comp: ComparableReit) => `- **${comp.ticker} (${comp.companyName})**
  - Model: ${comp.businessModel}
  - Occupancy Rate: ${comp.occupancyRate}
  - Dividend Profile: ${comp.dividendProfile}
  - Comparison: ${comp.comparisonParagraph}`
  )
  .join('\n\n')}
    
***Latest News***: ${result.latestNews}
    
***Outlook***: ${result.outlook}
    
***Headwinds***: ${result.headwinds}
    
***Tailwinds***: ${result.tailwinds}
    `.trim();

  return aboutTickerString;
}
