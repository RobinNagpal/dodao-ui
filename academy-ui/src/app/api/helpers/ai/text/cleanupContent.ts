import { SentenceTokenizer } from 'natural/lib/natural/tokenizers';

export function cleanupContent(content: string) {
  // replace all the new lines with a space
  const cleanedContent = content.replace(/(\r\n|\n|\r)/gm, '. ');

  // remove all the extra "." This code can be improved
  const removedExtraDots = cleanedContent
    .replace(/\.\s\./g, '.')
    .replace(/\.\./g, '.')
    .replace(/\.\s\./g, '.')
    .replace(/\.\./g, '.');

  const sentences = extractSentences(removedExtraDots);

  // remove all the sentences that are less than 70 characters
  const filteredSentences = sentences.filter((sentence) => sentence.length > 70);

  // join all the sentences with a new line
  return filteredSentences.join('\n');
}

function extractSentences(content: string): string[] {
  const tokenizer = new SentenceTokenizer();
  return tokenizer.tokenize(content);
}
