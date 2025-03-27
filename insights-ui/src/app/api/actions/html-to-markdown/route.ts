import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import TurndownService from 'turndown';
import { tables } from 'turndown-plugin-gfm';
import * as cheerio from 'cheerio';
import { MarkdownContentRequest, MarkdownContentResponse } from '@/types/public-equity/ticker-request-response';

async function postHandler(req: NextRequest): Promise<MarkdownContentResponse> {
  const body = (await req.json()) as MarkdownContentRequest;
  if (!body.htmlContent) {
    throw new Error('htmlContent is required in the request body.');
  }
  const turndownService = new TurndownService();
  turndownService.use(tables);

  // Convert HTML to Markdown
  const $ = cheerio.load(body.htmlContent);
  $('*').removeAttr('style');

  // Retrieve the cleaned HTML from Cheerio
  const cleanHtml = $.html();

  // Convert the cleaned HTML to Markdown
  const markdown = turndownService.turndown(cleanHtml);

  return { markdown };
}

export const POST = withErrorHandlingV2<MarkdownContentResponse>(postHandler);
