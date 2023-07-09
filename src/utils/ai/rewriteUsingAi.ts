import { AskCompletionAiMutation, AskCompletionAiMutationVariables } from '@/graphql/generated/generated-types';
import { ApolloCache, DefaultContext, FetchResult } from '@apollo/client';
import { MutationFunctionOptions } from '@apollo/client/react/types/types';

export async function rewriteToCharacterLengthUsingAi(
  askCompletionAiMutation: (
    options?: MutationFunctionOptions<AskCompletionAiMutation, AskCompletionAiMutationVariables, DefaultContext, ApolloCache<any>>
  ) => Promise<FetchResult<AskCompletionAiMutation>>,
  text: string,
  length: number
) {
  const response = await askCompletionAiMutation({
    variables: {
      input: {
        prompt: `
          Rewrite or reword this to less than ${length} characters:
          
          ${text}
        `,
        temperature: 0.3,
        model: 'gpt-3.5-turbo-16k',
      },
    },
  });
  const responseText = response?.data?.askCompletionAI?.choices?.[0]?.text;
  if (!responseText) {
    return text;
  }
  return responseText;
}

export async function rewriteToWordsCountUsingAi(
  askCompletionAiMutation: (
    options?: MutationFunctionOptions<AskCompletionAiMutation, AskCompletionAiMutationVariables, DefaultContext, ApolloCache<any>>
  ) => Promise<FetchResult<AskCompletionAiMutation>>,
  text: string,
  length: number
) {
  const response = await askCompletionAiMutation({
    variables: {
      input: {
        prompt: `
          Rewrite or reword this to less than ${length} words:
          
          ${text}
        `,
        temperature: 0.3,
        model: 'gpt-3.5-turbo-16k',
      },
    },
  });
  const responseText = response?.data?.askCompletionAI?.choices?.[0]?.text;
  if (!responseText) {
    return text;
  }
  return responseText;
}
