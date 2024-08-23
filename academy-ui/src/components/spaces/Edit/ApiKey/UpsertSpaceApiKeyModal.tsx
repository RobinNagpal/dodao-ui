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
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { addApiKey } = useAddSpaceApiKey(props.space, props.onUpdate);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState('Click to copy to clipboard');
  const { showNotification } = useNotificationContext();

  const handleGenerateApiKey = async () => {
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
      setButtonDisabled(true);
      setNewKey(apiKey);
      setTooltip('Click to copy to clipboard');
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
        setTooltip('Click to copy to clipboard');
        setButtonDisabled(false);
      }}
      title="API Key Generator"
    >
      <div className="space-y-4 text-left p-4">
        {newKey ? (
          <div className="flex items-center gap-x-4 p-4 bg-gray-100 rounded-md">
            <div className="flex-grow">
              <p className="text-lg text-gray-600">Better copy and save the API key because it will not be available once the modal is closed</p>
              <p className="text-lg text-gray-600">New API Key:</p>
              <p className="text-xl text-gray-800">
                {newKey}
                <span
                  onClick={() => {
                    copyToClipboard(newKey);
                    setTooltip('Copied!');
                  }}
                  title={tooltip}
                  className="inline-block cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 ml-2 right-0"
                    onClick={() => copyToClipboard(newKey)}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-lg text-gray-600 text-center">Click the button below to generate a new API key</p>
        )}
      </div>
      <div className="flex items-center justify-end gap-x-4 p-4">
        <Button onClick={handleGenerateApiKey} disabled={buttonDisabled} variant="contained" primary>
          {addingApiKey ? 'Generating...' : 'Generate API Key'}
        </Button>
        <Button
          onClick={() => {
            props.onClose();
            setNewKey('');
            setTooltip('Click to copy to clipboard');
            setButtonDisabled(false);
          }}
          variant="outlined"
        >
          Close
        </Button>
      </div>
    </FullPageModal>
  );
}
