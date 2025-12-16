'use client';

import { useState, useMemo } from 'react';
import { TickerV1Industry, TickerV1SubIndustry, Prompt, PromptVersion } from '@prisma/client';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import { parseMarkdown } from '@/util/parse-markdown';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Handlebars from 'handlebars';
import { PROMPTS, PromptConfig } from './promptConfig';

interface IndustryWithSubIndustries extends TickerV1Industry {
  subIndustries: TickerV1SubIndustry[];
}

export type PromptWithVersion = Prompt & { activePromptVersion: PromptVersion | null };

interface IndustryAnalysisClientProps {
  industries: IndustryWithSubIndustries[];
  prompts: PromptWithVersion[];
}

export default function IndustryAnalysisClient({ industries, prompts }: IndustryAnalysisClientProps) {
  const [selectedIndustryKey, setSelectedIndustryKey] = useState<string | null>(null);
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({});
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const industryItems: StyledSelectItem[] = useMemo(
    () =>
      industries.map((industry) => ({
        id: industry.industryKey,
        label: industry.name,
      })),
    [industries]
  );

  const selectedIndustry = useMemo(() => industries.find((ind) => ind.industryKey === selectedIndustryKey), [industries, selectedIndustryKey]);

  const prepareIndustryAnalysisInput = (industry: IndustryWithSubIndustries) => {
    return {
      industryName: industry.name,
      industrySummary: industry.summary || '',
      subIndustries: industry.subIndustries.map((sub) => ({
        subIndustryName: sub.name,
        subIndustrySummary: sub.summary || '',
      })),
    };
  };

  const handleAccordionClick = (e: React.MouseEvent<HTMLElement>, promptKey: string) => {
    e.stopPropagation();
    setOpenAccordions((prev) => ({
      ...prev,
      [promptKey]: !prev[promptKey],
    }));
  };

  const handleCopyPrompt = async (e: React.FormEvent | React.MouseEvent | undefined, promptKey: string, content: string) => {
    e?.stopPropagation();
    e?.preventDefault();
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPrompt(promptKey);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderPromptContent = (prompt: PromptConfig) => {
    if (!selectedIndustry) {
      return <p className="text-gray-400 italic">Please select an industry first</p>;
    }

    // Find the prompt from database
    const dbPrompt = prompts.find((p) => p.key === prompt.key);

    if (!dbPrompt || !dbPrompt.activePromptVersion) {
      return <p className="text-red-400">Prompt not found in database</p>;
    }

    let finalPrompt: string;

    if (prompt.requiresInput && prompt.key === 'US/public-equities-v1/industry/analysis') {
      const inputJson = prepareIndustryAnalysisInput(selectedIndustry);

      // Compile the template with the input JSON to get final prompt
      try {
        const template = Handlebars.compile(dbPrompt.activePromptVersion.promptTemplate);
        finalPrompt = template(inputJson);
      } catch (error) {
        console.error('Error compiling template:', error);
        finalPrompt = 'Error compiling template';
      }
    } else {
      // For prompts without input, just show the template
      finalPrompt = dbPrompt.activePromptVersion.promptTemplate;
    }

    return (
      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-400">
            <strong>Prompt Name:</strong> {dbPrompt.name}
          </div>
          <Button onClick={(e) => handleCopyPrompt(e, prompt.key, finalPrompt)} variant="outlined" primary className="text-sm">
            {copiedPrompt === prompt.key ? '✓ Copied!' : 'Copy Content'}
          </Button>
        </div>

        {dbPrompt.excerpt && <div className="text-sm text-gray-400 italic mb-4">{dbPrompt.excerpt}</div>}

        <div className="text-gray-300 markdown markdown-body bg-gray-800 rounded-lg p-6" dangerouslySetInnerHTML={{ __html: parseMarkdown(finalPrompt) }} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Select Industry</h2>
        <StyledSelect
          label="Industry"
          selectedItemId={selectedIndustryKey}
          items={industryItems}
          setSelectedItemId={(id) => setSelectedIndustryKey(id || null)}
          className="w-full max-w-md"
        />
      </div>

      {selectedIndustry && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Prompts</h2>
          {PROMPTS.map((prompt) => (
            <Accordion key={prompt.key} isOpen={openAccordions[prompt.key] || false} label={prompt.name} onClick={(e) => handleAccordionClick(e, prompt.key)}>
              {renderPromptContent(prompt)}
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
}
