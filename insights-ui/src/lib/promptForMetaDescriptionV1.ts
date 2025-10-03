import { z } from 'zod';

/**
 * Zod schema for meta description response
 */
export const MetaDescriptionResponse = z.object({
  metaDescription: z.string().min(1).max(160).describe('A concise meta description for the ticker analysis page'),
});

export type MetaDescriptionResponseType = z.infer<typeof MetaDescriptionResponse>;

/**
 * Generates a meta description prompt for ticker analysis
 */
export function generateMetaDescriptionPrompt(summary: string): string {
  return `
    Based on the following company summary, create a concise meta description (maximum 160 characters) for SEO purposes:

    Summary: ${summary}

    Instructions:
    - Only return the meta description, no introductory text
    - Keep it under 160 characters
    - Make it compelling and informative for search engines
    - Include key information about the company and its analysis
  `;
}
