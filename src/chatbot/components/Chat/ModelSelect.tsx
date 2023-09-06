import { IconExternalLink } from '@tabler/icons-react';
import { useContext } from 'react';

import { useTranslation } from 'next-i18next';

import { OpenAIModel } from '@/chatbot/types/openai';

import HomeContext from '@/chatbot/home/home.context';

export const ModelSelect = () => {
  const { t } = useTranslation('chat');

  const {
    state: { selectedConversation, models, defaultModelId },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectedConversation &&
      handleUpdateConversation(selectedConversation, {
        key: 'model',
        value: models.find((model) => model.id === e.target.value) as OpenAIModel,
      });
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left">{t('Model')}</label>
      <div className="w-full rounded-lg border border-neutral-200 bg-transparent pr-2">
        <select
          className="w-full bg-transparent p-2"
          placeholder={t('Select a model') || ''}
          value={selectedConversation?.model?.id || defaultModelId}
          onChange={handleChange}
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.id === defaultModelId ? `Default (${model.name})` : model.name}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full mt-3 text-left flex items-center">
        <a href="https://platform.openai.com/account/usage" target="_blank" className="flex items-center">
          <IconExternalLink size={18} className={'inline mr-1'} />
          {t('View Account Usage')}
        </a>
      </div>
    </div>
  );
};
