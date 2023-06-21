import { GuideFragment } from '@/graphql/generated/generated-types';

export default function generateGuideContentPrompt(topic: string, guidelines: string, contents: string, guide: GuideFragment) {
  return `
  Use the content provided write four to five paragraphs on the topic : ${topic}. Obey the following rules:
  1. The output should be in simple language and easy to understand.
  2. The output should be in your own words and not copied from the content provided.
  3. The output should be between 4-8 paragraphs.
  4. The output should be related to the topic: ${topic}
 
  Also follow the following guidelines:
  ${guidelines}
 
  The output is part of the following document, so make sure that the generated output is coherent with the rest of the document.  
  Document: ${guide.name}
  ${guide.steps
    .filter((s) => s.content.trim())
    .map(
      (s, index) => `
    Heading ${index}: ${s.name} 
    ${s.content}
    
    `
    )
    .join('\n')}
   
    
  Here is the content provided:
  ${contents}`;
}
