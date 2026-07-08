'use client';

import { getDefaultModelSelectionForProvider, getModelSelectItemsForProvider, LLMProvider, llmProviderSelectItems } from '@/types/llmConstants';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import React from 'react';

/** Provider + model chosen for a generation run. */
export interface LlmProviderModelSelection {
  llmProvider: LLMProvider;
  model: string;
}

interface LlmProviderModelSelectorProps {
  selection: LlmProviderModelSelection;
  onChange: (selection: LlmProviderModelSelection) => void;
  className?: string;
  /** Stacks the two selects vertically when true (e.g. inside a narrow modal). */
  stacked?: boolean;
}

/**
 * Reusable provider + model picker for report generation. Kept generic so the
 * same control can later back tariff/ETF generation; for now it is wired into
 * the stock generation surfaces. Changing the provider resets the model to that
 * provider's default so the pair always stays valid.
 */
export default function LlmProviderModelSelector({ selection, onChange, className, stacked }: LlmProviderModelSelectorProps): JSX.Element {
  const modelItems = getModelSelectItemsForProvider(selection.llmProvider);

  return (
    <div className={`${stacked ? 'flex flex-col gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'} ${className ?? ''}`}>
      <StyledSelect
        label="LLM Provider"
        selectedItemId={selection.llmProvider}
        items={llmProviderSelectItems}
        setSelectedItemId={(providerId) => {
          const llmProvider = (providerId as LLMProvider) || LLMProvider.GEMINI;
          onChange({ llmProvider, model: getDefaultModelSelectionForProvider(llmProvider) });
        }}
      />
      <StyledSelect
        label="Model"
        selectedItemId={selection.model}
        items={modelItems}
        setSelectedItemId={(modelId) => {
          onChange({ ...selection, model: modelId || getDefaultModelSelectionForProvider(selection.llmProvider) });
        }}
      />
    </div>
  );
}

/** Default selection the UI pre-selects: Gemini + Gemini 2.5 Pro (see llmConstants). */
export function getDefaultLlmProviderModelSelection(): LlmProviderModelSelection {
  return { llmProvider: LLMProvider.GEMINI, model: getDefaultModelSelectionForProvider(LLMProvider.GEMINI) };
}
