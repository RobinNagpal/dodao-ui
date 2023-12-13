import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullPageModal from '@/components/core/modals/FullPageModal';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { useCreateWebsiteScrapingInfoMutation, useEditWebsiteScrapingInfoMutation, WebsiteScrapingInfoFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export interface UpsertWebsiteScrapingInfoModalProps {
  open: boolean;
  websiteScrapingInfo?: WebsiteScrapingInfoFragment;
  onClose: () => void;
  spaceId: string;
}
export default function UpsertWebsiteScrapingInfoModal({ open, spaceId, onClose, websiteScrapingInfo }: UpsertWebsiteScrapingInfoModalProps) {
  const [scrapingStartUrl, setScrapingStartUrl] = useState(websiteScrapingInfo?.scrapingStartUrl);
  const [baseUrl, setBaseUrl] = useState(websiteScrapingInfo?.baseUrl);
  const [ignoreHashInUrl, setIgnoreHashInUrl] = useState(!!websiteScrapingInfo?.ignoreHashInUrl);
  const [ignoreQueryParams, setIgnoreQueryParams] = useState(!!websiteScrapingInfo?.ignoreQueryParams);

  const [createWebsiteScrapingInfoMutation] = useCreateWebsiteScrapingInfoMutation();
  const [editWebsiteScrapingInfoMutation] = useEditWebsiteScrapingInfoMutation();

  return (
    <FullPageModal open={open} onClose={onClose} title={'Space Loaders'}>
      <div className="text-left">
        <div className="m-4 space-y-2">
          <Input label={'Base Url'} onUpdate={(url) => setBaseUrl(url?.toString())} modelValue={baseUrl} />
          <Input label={'Scraping Start Url'} onUpdate={(startUrl) => setScrapingStartUrl(startUrl?.toString())} modelValue={scrapingStartUrl} />
          <ToggleWithIcon label={'Ignore Hash In Url'} enabled={ignoreHashInUrl} setEnabled={(value) => setIgnoreHashInUrl(value)} />
          <ToggleWithIcon label={'Ignore Query params in Url'} enabled={ignoreQueryParams} setEnabled={(value) => setIgnoreQueryParams(value)} />
          <Button
            onClick={async () => {
              if (!scrapingStartUrl || !baseUrl) return;

              if (websiteScrapingInfo) {
                await editWebsiteScrapingInfoMutation({
                  variables: {
                    websiteScrapingInfoId: websiteScrapingInfo.id,
                    spaceId,
                    baseUrl: baseUrl?.trim(),
                    scrapingStartUrl: scrapingStartUrl?.trim(),
                    ignoreHashInUrl,
                    ignoreQueryParams,
                  },
                  refetchQueries: ['WebsiteScrapingInfos'],
                });
              } else {
                await createWebsiteScrapingInfoMutation({
                  variables: {
                    spaceId,
                    baseUrl: baseUrl?.trim(),
                    scrapingStartUrl: scrapingStartUrl?.trim(),
                    ignoreHashInUrl,
                    ignoreQueryParams,
                  },
                  refetchQueries: ['WebsiteScrapingInfos'],
                });
              }
              onClose();
            }}
            variant="contained"
            primary
          >
            Upsert
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
