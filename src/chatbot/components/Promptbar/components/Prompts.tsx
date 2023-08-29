import { FC } from 'react';

import { Prompt } from '@/chatbot/types/prompt';

import { PromptComponent } from '@/chatbot/components/Promptbar/components/Prompt';

interface Props {
  prompts: Prompt[];
}

export const Prompts: FC<Props> = ({ prompts }) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {prompts
        .slice()
        .reverse()
        .map((prompt, index) => (
          <PromptComponent key={index} prompt={prompt} />
        ))}
    </div>
  );
};
