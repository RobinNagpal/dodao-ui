export default function generateNewMarkdownContentPrompt(topic: string, rules: string) {
  return `
  Write four to five paragraphs on the topic : ${topic}. Obey the following rules:
  ${rules}   
  - Make sure the generated content is related to the topic: ${topic}.
  - Make sure the generated content is related to the topic: ${topic}.
    
`;
}
