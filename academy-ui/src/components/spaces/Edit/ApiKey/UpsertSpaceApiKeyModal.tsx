import React, { useState } from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { useAddSpaceApiKey } from './useAddSpaceApiKey'; // Ensure this path is correct
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';

export default function UpsertSpaceApiKeyModal(props: {
  space: SpaceWithIntegrationsFragment;
  open: boolean;
  onClose: () => void;
  onUpdate: (space: any) => void;
}) {
  const [addingApiKey, setAddingApiKey] = useState(false);
  const { addApiKey } = useAddSpaceApiKey(props.space, props.onUpdate);
  const [newKey, setNewKey] = useState<string | null>(null);
  const { showNotification } = useNotificationContext();

  const handleGenerateAndCopyApiKey = async () => {
    setAddingApiKey(true);
    const keyPrefix = 'ak_'; // Define a prefix for the API key
    const keyLength = 32; // Define the total desired length of the API key
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let apiKey = keyPrefix;

    for (let i = apiKey.length; i < keyLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      apiKey += characters[randomIndex];
    }
    await addApiKey(apiKey); // This function should handle generating and immediately adding the new API key
    if (apiKey) {
      setNewKey(apiKey);
    }

    setAddingApiKey(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showNotification({ type: 'success', message: 'API key copied to Clipboard better save it somewhere' });
      })
      .catch((err) => {
        showNotification({ type: 'error', message: 'Not able to copy to Clipboard. Try Again!' });
      });
  };
  return (
    <FullPageModal
      open={props.open}
      onClose={() => {
        props.onClose();
        setNewKey('');
      }}
      title="API Key Generator"
    >
      <div className="space-y-4 text-left p-4">
        <Button onClick={handleGenerateAndCopyApiKey} disabled={addingApiKey} variant="contained" primary>
          {addingApiKey ? 'Generating...' : 'Generate API Key'}
        </Button>
        {newKey && (
          <div className="flex items-center gap-x-4 p-4 bg-gray-100 rounded-md">
            <div className="flex-grow">
              <p className="text-lg text-gray-600">Better copy and save the API key because it will not be available once the modal is closed</p>
              <p className="text-lg text-gray-600">New API Key:</p>
              <p className="text-xl text-gray-800">{newKey}</p>
              <Button onClick={() => copyToClipboard(newKey)} variant="contained" primary>
                Copy API Key
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-x-4 p-4">
        <Button
          onClick={() => {
            props.onClose();
            setNewKey('');
          }}
          variant="outlined"
        >
          Close
        </Button>
      </div>
    </FullPageModal>
  );
}
