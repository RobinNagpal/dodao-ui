import { DiscordServer, SpaceLoadersInfoInput, useReFetchDiscordServersMutation } from '@/graphql/generated/generated-types';
import { SpaceLoadersInfoDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import React, { useEffect, useState } from 'react';

export interface UpsertSpaceLoadersInfoModalProps {
  open: boolean;
  onUpsert: (loaderInfos: SpaceLoadersInfoInput) => void;
  loadersInfo?: SpaceLoadersInfoDto;
  onClose: () => void;
}
export default function UpsertSpaceLoadersInfoModal({ open, onUpsert, onClose, loadersInfo }: UpsertSpaceLoadersInfoModalProps) {
  const [discourseUrl, setDiscourseUrl] = useState(loadersInfo?.discourseUrl);
  const [discordServerId, setDiscordServerId] = useState(loadersInfo?.discordServerId || null);
  const [reFetchDiscordServersMutation] = useReFetchDiscordServersMutation();
  const [discordServers, setDiscordServers] = useState<{ label: string; id: string }[]>([]);
  const fetchDiscordServers = async () => {
    const response = await reFetchDiscordServersMutation();

    const servers = response.data?.reFetchDiscordServers;
    if (servers) {
      setDiscordServers(servers.map((server: DiscordServer) => ({ label: server.name + ' ' + server.id, id: server.id })));
    }
  };
  useEffect(() => {
    fetchDiscordServers();
  }, []);

  return (
    <FullPageModal open={open} onClose={onClose} title={'Space Loaders'}>
      <div className="text-left">
        <div className="m-4 space-y-2">
          <Input label={'Discourse Url'} onUpdate={(repoUrl) => setDiscourseUrl(repoUrl?.toString())} modelValue={discourseUrl} />
          <StyledSelect
            label="Discord Server"
            selectedItemId={discordServerId}
            items={discordServers}
            showPleaseSelect={true}
            setSelectedItemId={(value) => setDiscordServerId(value)}
          />
          <Button
            onClick={() =>
              onUpsert({
                ...{
                  discordServerId: loadersInfo?.discordServerId,
                  discourseUrl: loadersInfo?.discourseUrl,
                },
                discordServerId: discordServerId,
                discourseUrl: discourseUrl,
              })
            }
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
