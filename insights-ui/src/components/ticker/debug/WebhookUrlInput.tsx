import { Button } from '@/components/home-page/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import React, { useState } from 'react';

interface WebhookUrlInputProps {
  criterionKey: string;
}

export default function WebhookUrlInput({ criterionKey }: WebhookUrlInputProps) {
  // Initialize from localStorage
  const [webhookUrl, setWebhookUrl] = useState<string>(localStorage.getItem(`${criterionKey}_webhookUrl`) || '');

  const handleSave = () => {
    localStorage.setItem(`${criterionKey}_webhookUrl`, webhookUrl);
    console.log('Webhook URL saved:', webhookUrl);
  };

  const handleClear = () => {
    localStorage.removeItem(`${criterionKey}_webhookUrl`);
    setWebhookUrl('');
  };

  return (
    <div>
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
