import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { useCreateWebsiteScrapingInfoMutation, WebsiteScrapingInfoFragmentFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export interface UpsertWebsiteScrapingInfoModalProps {
  open: boolean;
  websiteScrapingInfo?: WebsiteScrapingInfoFragmentFragment;
  onClose: () => void;
  spaceId: string;
}
export default function UpsertWebsiteScrapingInfoModal({ open, spaceId, onClose, websiteScrapingInfo }: UpsertWebsiteScrapingInfoModalProps) {
  const [scrapingStartUrl, setScrapingStartUrl] = useState(websiteScrapingInfo?.scrapingStartUrl);
  const [host, setHost] = useState(websiteScrapingInfo?.host);
  const [ignoreHashInUrl, setIgnoreHashInUrl] = useState(!!websiteScrapingInfo?.ignoreHashInUrl);

  const [createWebsiteScrapingInfoMutation] = useCreateWebsiteScrapingInfoMutation();

  return (
    <FullScreenModal open={open} onClose={onClose} title={'Space Loaders'}>
      <div className="text-left">
        <div className="m-4 space-y-2">
          <Input label={'Host'} onUpdate={(repoUrl) => setHost(repoUrl?.toString())} modelValue={host} />
          <Input label={'Scraping Start Url'} onUpdate={(repoUrl) => setScrapingStartUrl(repoUrl?.toString())} modelValue={scrapingStartUrl} />
          <ToggleWithIcon label={'Ignore Hash In Url'} enabled={ignoreHashInUrl} setEnabled={(value) => setIgnoreHashInUrl(value)} />
          <Button
            onClick={async () => {
              if (!scrapingStartUrl || !host) return;

              await createWebsiteScrapingInfoMutation({
                variables: {
                  spaceId,
                  host,
                  scrapingStartUrl,
                  ignoreHashInUrl,
                },
                refetchQueries: ['WebsiteScrapingInfos'],
              });

              onClose();
            }}
            variant="contained"
            primary
          >
            Upsert
          </Button>
        </div>
      </div>
    </FullScreenModal>
  );
}
