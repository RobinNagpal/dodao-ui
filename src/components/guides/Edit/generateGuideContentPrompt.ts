import { GuideFragment } from '@/graphql/generated/generated-types';

export default function generateGuideContentPrompt(topic: string, rules: string, contents: string, guide: GuideFragment) {
  return `
  Use the content provided write four to five paragraphs on the topic : ${topic}. Obey the following rules:
  ${rules}   
  - Make sure the generated content is related to the topic: ${topic}.
  - Make sure the generated content is related to the topic: ${topic}.
    
    
  Here is the content provided:
  ${contents}`;
}
