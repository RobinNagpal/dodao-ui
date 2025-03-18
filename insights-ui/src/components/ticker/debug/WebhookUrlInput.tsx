import { Button } from '@/components/home-page/Button';
import { CriterionDefinition } from '@/types/public-equity/criteria-types';
import Input from '@dodao/web-core/components/core/input/Input';
import React, { useEffect, useState } from 'react';

interface WebhookUrlInputProps {
  sectorId: number;
  industryGroupId: number;
  criterionDefinition: CriterionDefinition;
}

function getWebhookUrlKey(sectorId: number, industryGroupId: number, criterionKey: string): string {
  return `${sectorId}_${industryGroupId}_${criterionKey}_webhookUrl`;
}

export function getWebhookUrlFromLocalStorage(sectorId: number, industryGroupId: number, criterionKey: string): string {
  const webhookUrlKey = getWebhookUrlKey(sectorId, industryGroupId, criterionKey);
  return localStorage.getItem(webhookUrlKey) || '';
}

export default function WebhookUrlInput({ criterionDefinition, sectorId, industryGroupId }: WebhookUrlInputProps) {
  const webhookUrlKey = getWebhookUrlKey(sectorId, industryGroupId, criterionDefinition.key);

  useEffect(() => {
    if (getWebhookUrlFromLocalStorage(sectorId, industryGroupId, criterionDefinition.key) === null) {
      localStorage.setItem(webhookUrlKey, criterionDefinition.langflowWebhookUrl || '');
    }
  }, []);

  const [webhookUrl, setWebhookUrl] = useState<string>(
    getWebhookUrlFromLocalStorage(sectorId, industryGroupId, criterionDefinition.key) || criterionDefinition.langflowWebhookUrl || ''
  );

  const handleSave = () => {
    localStorage.setItem(webhookUrlKey, webhookUrl);
    console.log('Webhook URL saved:', webhookUrl);
  };

  const handleClear = () => {
    localStorage.removeItem(webhookUrlKey);
    setWebhookUrl('');
  };

  return (
    <div className="w-full">
      <Input modelValue={webhookUrl} placeholder="Enter Webhook URL" className="text-color" onUpdate={(value) => setWebhookUrl(value as string)}>
        Webhook Url
      </Input>
      <div className="flex justify-end">
        <Button className="mr-2" onClick={handleClear}>
          Clear
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
