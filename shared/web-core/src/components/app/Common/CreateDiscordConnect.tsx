import Modal from '@dodao/web-core/components/app/Modal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { UserDiscordConnect } from '@dodao/web-core/types/deprecated/models/byte/ByteModel';
import { GuideStepItem } from '@dodao/web-core/types/deprecated/models/GuideModel';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

const RemoveDiscord = styled.span`
  color: var(--text-color);
  cursor: pointer;
  .iconclose {
    color: white !important;
  }
`;

const DiscordButton = styled.a`
  border-radius: 0.5rem;
  background-color: #5964f3;
  color: white;
  border: 1px solid;
  outline: none;
  padding: 8px 16px;
  font-size: calc(18 / 16) rem;
  font-weight: 500;
  min-width: 220px;
  line-height: 36px;

  svg {
    height: 36px;
  }
`;

interface ConnectDiscordProps {
  removeDiscord: (uuid: string) => void;
  item: GuideStepItem | UserDiscordConnect;
}

function CreateConnectDiscord({ removeDiscord, item }: ConnectDiscordProps) {
  const [open, setOpen] = useState(false);
  const userDiscord = item as UserDiscordConnect;

  const toggleModal = useCallback((value: boolean) => {
    setOpen(value);
  }, []);

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="mb-4">
          <DiscordButton onClick={() => toggleModal(true)} className="relative text-white inline-flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 100 100" viewBox="0 0 100 100">
              <path
                fill="white"
                d="M85.778,24.561c-11.641-8.71-22.793-8.466-22.793-8.466s-1.14,1.302-1.14,1.302c13.839,4.152,20.27,10.257,20.27,10.257   c-19.799-10.901-45.019-10.823-65.613,0c0,0,6.675-6.431,21.328-10.583c0,0-0.814-0.977-0.814-0.977s-11.071-0.244-22.793,8.466   c0,0-11.722,21.084-11.722,47.052c0,0,6.838,11.722,24.829,12.292c0,0,3.012-3.582,5.454-6.675   c-10.339-3.093-14.246-9.524-14.246-9.524c6.495,4.064,13.063,6.608,21.247,8.222c13.316,2.741,29.879-0.077,42.249-8.222   c0,0-4.07,6.594-14.734,9.606c2.442,3.012,5.373,6.512,5.373,6.512C90.662,83.254,97.5,71.532,97.5,71.613   C97.5,45.645,85.778,24.561,85.778,24.561z M34.818,64.043c-4.559,0-8.303-3.989-8.303-8.955c0.333-11.892,16.357-11.855,16.607,0   C43.121,60.054,39.458,64.043,34.818,64.043z M64.531,64.043c-4.559,0-8.303-3.989-8.303-8.955c0.366-11.869,16.19-11.874,16.607,0   C72.834,60.054,69.171,64.043,64.531,64.043z"
              />
            </svg>
            <div className="h-[32px] w-full overflow-hidden rounded-full mr-2 flex items-center justify-center">
              <span className="text-white ml-2">
                Connect Discord
                <RemoveDiscord className="text-white right-2 top-0 absolute" onClick={() => removeDiscord(userDiscord.uuid)}>
                  <XMarkIcon width="20" height="20" className="link-color" name="close" />
                </RemoveDiscord>
              </span>
            </div>
          </DiscordButton>
        </div>
      </div>
      <Modal open={open} onClose={() => toggleModal(false)}>
        <div className="border-b pt-3 pb-2 text-center">
          <h3>Connect Discord</h3>
        </div>
        <div className="modal-body">
          <div className="m-4 space-y-2">This button will be used by the members to connect their Discord</div>
        </div>
        <div className="border-t p-4 text-center">
          <div className="flex justify-end">
            <Button onClick={() => toggleModal(false)} primary variant="contained">
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CreateConnectDiscord;
