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
