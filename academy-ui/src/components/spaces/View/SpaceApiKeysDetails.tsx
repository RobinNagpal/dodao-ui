import DetailsRow from '@dodao/web-core/components/core/details/DetailsRow';
import DetailsHeader from '@dodao/web-core/components/core/details/DetailsHeader';
import DetailsSection from '@dodao/web-core/components/core/details/DetailsSection';
import { Space, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { Json } from 'aws-sdk/clients/robomaker';
import UpsertSpaceApiKeyModal from '../Edit/ApiKey/UpsertSpaceApiKeyModal';

export interface SpaceApiKeyDetailsProps {
  space: Space;
  className?: string;
}

function getSpaceDetailsFields(space: SpaceWithIntegrationsFragment): Array<{ label: string; value: string }> {
  // Check if spaceApiKeys exist and have length
  if (space.spaceIntegrations?.spaceApiKeys && space.spaceIntegrations.spaceApiKeys.length > 0) {
    // Map each apiKey to a new object with a label and a combined value of last four letters and last used date
    return space.spaceIntegrations.spaceApiKeys.map((apiKey, index) => ({
      label: `API Key ${index + 1}`,
      value: `Last Four Letters: ${apiKey?.lastFourLetters || 'N/A'}, Last Used: ${
        apiKey?.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Unknown'
      }`,
    }));
  } else {
    // Return a default entry if no API keys are present
    return [{ label: 'Api Keys', value: 'No Keys Exist! You can generte API keys using the Add Key button to the top right corner ' }];
  }
}

export default function SpaceApiKeyDetails(props: SpaceApiKeyDetailsProps) {
  const [showApiKeyModal, setshowApiKeyModal] = useState(false);
  const [space, setSpace] = useState(props.space);

  return (
    <>
      <DetailsSection className={`${props.className} shadow`}>
        <div className="flex w-full">
          <DetailsHeader header={'API Key Details'} className="grow-1 w-full" />
          <Button
            onClick={() => {
              setshowApiKeyModal(true);
            }}
            className="w-32 font-bold my-4"
            variant="contained"
            primary
          >
            Add Key
          </Button>
        </div>
        <div className="flex flex-col w-full">
          {getSpaceDetailsFields(space).map((field) => (
            <DetailsRow key={field.label} label={field.label} value={field.value} />
          ))}
        </div>
      </DetailsSection>
      <UpsertSpaceApiKeyModal
        space={props.space}
        open={showApiKeyModal}
        onClose={() => setshowApiKeyModal(false)}
        onUpdate={(space: any) => {
          setSpace(space);
        }}
      />
    </>
  );
}
