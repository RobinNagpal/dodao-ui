import { FC, MutableRefObject } from 'react';

import { Prompt } from '@/chatbot/types/prompt';

interface Props {
  prompts: Prompt[];
  activePromptIndex: number;
  onSelect: () => void;
  onMouseOver: (index: number) => void;
  promptListRef: MutableRefObject<HTMLUListElement | null>;
}

export const PromptList: FC<Props> = ({ prompts, activePromptIndex, onSelect, onMouseOver, promptListRef }) => {
  return (
    <ul ref={promptListRef} className="z-10 max-h-52 w-full overflow-scroll rounded border border-black/10">
      {prompts.map((prompt, index) => (
        <li
          key={prompt.id}
          className={`${index === activePromptIndex ? 'bg-gray-200' : ''} cursor-pointer px-3 py-2 text-sm text-black dark:text-white`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect();
          }}
          onMouseEnter={() => onMouseOver(index)}
        >
          {prompt.name}
        </li>
      ))}
    </ul>
  );
};
