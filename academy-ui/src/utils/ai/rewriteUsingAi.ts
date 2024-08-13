import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';

export async function rewriteToCharacterLengthUsingAi(text: string, length: number) {
  const response = await axios.post('/api/openAI/ask-completion-ai', {
    input: {
      prompt: `
        Rewrite or reword this to less than ${length} characters:
        
        ${text}
        `,
      temperature: 0.3,
      model: 'gpt-3.5-turbo-16k',
    },
  });
  const responseText = response?.data?.completion.askCompletionAI?.choices?.[0]?.text;
  if (!responseText) {
    return text;
  }
  return responseText;
}

export async function rewriteToWordsCountUsingAi(text: string, length: number) {
  const response = await axios.post(`${getBaseUrl()}/api/openAI/ask-completion-ai`, {
    input: {
      prompt: `
        Rewrite or reword this to less than ${length} words:
        
        ${text}
        `,
      temperature: 0.3,
      model: 'gpt-3.5-turbo-16k',
    },
  });
  const responseText = response?.data?.completion.askCompletionAI?.choices?.[0]?.text;
  if (!responseText) {
    return text;
  }
  return responseText;
}
