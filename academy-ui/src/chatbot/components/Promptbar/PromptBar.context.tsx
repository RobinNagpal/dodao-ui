import { Dispatch, createContext } from 'react';

import { ActionType } from '@/chatbot/hooks/useCreateReducer';

import { Prompt } from '@/chatbot/types/prompt';

import { PromptbarInitialState } from '@/chatbot/components/Promptbar/Promptbar.state';

export interface PromptbarContextProps {
  state: PromptbarInitialState;
  dispatch: Dispatch<ActionType<PromptbarInitialState>>;
  handleCreatePrompt: () => void;
  handleDeletePrompt: (prompt: Prompt) => void;
  handleUpdatePrompt: (prompt: Prompt) => void;
}

const PromptbarContext = createContext<PromptbarContextProps>(undefined!);

export default PromptbarContext;
