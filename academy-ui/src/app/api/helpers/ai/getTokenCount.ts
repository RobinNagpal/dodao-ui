import tiktoken from 'tiktoken';

export const tokenEncoding = tiktoken.encoding_for_model('gpt-3.5-turbo');
export function getTokenCount(cleanedContent: string) {
  const totalTokens = tokenEncoding.encode(cleanedContent).length;
  return totalTokens;
}
