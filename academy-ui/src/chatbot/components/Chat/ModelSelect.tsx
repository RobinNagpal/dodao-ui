import StyledSelect, { StyledSelectItem } from '@/components/core/select/StyledSelect';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { IconExternalLink } from '@tabler/icons-react';
import React, { useContext } from 'react';

import { useTranslation } from 'next-i18next';

import { OpenAIModel, OpenAIModelID } from '@/chatbot/types/openai';

import HomeContext from '@/chatbot/home/home.context';

export const ModelSelect = () => {
  const { t } = useTranslation('chat');

  const {
    state: { selectedConversation, models, defaultModelId },
    handleUpdateConversation,
  } = useContext(HomeContext);

  const handleChange = (value: string) => {
    selectedConversation &&
      handleUpdateConversation(selectedConversation, {
        key: 'model',
        value: models.find((model) => model.id === value) as OpenAIModel,
      });
  };

  const modelSelect: StyledSelectItem[] = [
    {
      label: 'GPT-3.5 (Default)',
      id: OpenAIModelID.GPT_3_5,
    },
    {
      label: 'GPT-4',
      id: OpenAIModelID.GPT_4,
    },
  ];

  return (
    <div className="flex flex-col">
      <StyledSelect
        label={t('Model')}
        selectedItemId={selectedConversation?.model?.id || defaultModelId}
        items={modelSelect}
        setSelectedItemId={(value) => handleChange(value as PublishStatus)}
      />

      <div className="w-full mt-3 text-left flex items-center">
        <a href="https://platform.openai.com/account/usage" target="_blank" className="flex items-center">
          <IconExternalLink size={18} className={'inline mr-1'} />
          {t('View Account Usage')}
        </a>
      </div>
    </div>
  );
};
