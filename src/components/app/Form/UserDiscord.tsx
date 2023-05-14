import { UserDiscordInfoInput } from '@/graphql/generated/generated-types';
import { GuideType, UserDiscordConnect } from '@/types/deprecated/models/GuideModel';
import { shorten } from '@/utils/utils';
import { useMemo } from 'react';
import styled from 'styled-components';

const discordClientId = process.env.VITE_DISCORD_CLIENT_ID?.toString() || '957438694476898384';

interface DiscordButtonProps {
  userDiscord: UserDiscordConnect;
  spaceId: string;
  guideUuid: string;
  stepOrder?: number;
  stepUuid?: string;
  guideType?: GuideType;
  discordResponse?: UserDiscordInfoInput;
}

const DiscordImage = styled.img`
  height: 30px;
`;

const ConnectDiscordDiv = styled.div`
  min-height: 50px;
`;
function DiscordButton({
  userDiscord,
  spaceId,
  guideUuid,
  stepOrder = 0,
  stepUuid = '',
  guideType = GuideType.Onboarding,
  discordResponse,
}: DiscordButtonProps) {
  const url = useMemo(() => {
    const guideParams = `guideType=${guideType}&guideUuid=${guideUuid}`;
    const stepParams = `stepUuid=${stepUuid}&stepOrder=${stepOrder}&itemUuid=${userDiscord.uuid}`;
    const params = new URLSearchParams({
      scope: 'identify email guilds.join',
      client_id: discordClientId,
      response_type: 'token',
      state: `spaceId=${spaceId}&${guideParams}&${stepParams}&target=guideView`,
      redirect_uri: `${window.location.origin}/generic-discord-redirect`,
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }, [spaceId, guideUuid, stepOrder, stepUuid, guideType, userDiscord.uuid]);

  return (
    <div className="w-full flex justify-center">
      <div className="my-4">
        <a
          href={url}
          className="text-white inline-flex items-center justify-center rounded px-6 py-2 bg-discord-blue border border-solid min-w-[220px] text-lg font-semibold leading-9"
        >
          {!discordResponse ? (
            <ConnectDiscordDiv className="flex align-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                enableBackground="new 0 0 100 100"
                viewBox="0 0 100 100"
                className="h-9 mr-2"
                style={{ width: '50px', height: '50px' }}
              >
                <path
                  fill="white"
                  d="M85.778,24.561c-11.641-8.71-22.793-8.466-22.793-8.466s-1.14,1.302-1.14,1.302c13.839,4.152,20.27,10.257,20.27,10.257   c-19.799-10.901-45.019-10.823-65.613,0c0,0,6.675-6.431,21.328-10.583c0,0-0.814-0.977-0.814-0.977s-11.071-0.244-22.793,8.466   c0,0-11.722,21.084-11.722,47.052c0,0,6.838,11.722,24.829,12.292c0,0,3.012-3.582,5.454-6.675   c-10.339-3.093-14.246-9.524-14.246-9.524c6.495,4.064,13.063,6.608,21.247,8.222c13.316,2.741,29.879-0.077,42.249-8.222   c0,0-4.07,6.594-14.734,9.606c2.442,3.012,5.373,6.512,5.373,6.512C90.662,83.254,97.5,71.532,97.5,71.613   C97.5,45.645,85.778,24.561,85.778,24.561z M34.818,64.043c-4.559,0-8.303-3.989-8.303-8.955c0.333-11.892,16.357-11.855,16.607,0   C43.121,60.054,39.458,64.043,34.818,64.043z M64.531,64.043c-4.559,0-8.303-3.989-8.303-8.955c0.366-11.869,16.19-11.874,16.607,0   C72.834,60.054,69.171,64.043,64.531,64.043z"
                />
              </svg>
              <div className="p-2">{'Connect Discord'}</div>
            </ConnectDiscordDiv>
          ) : (
            <div className="text-white flex items-center">
              <DiscordImage className="rounded-full" src={`https://cdn.discordapp.com/avatars/${discordResponse.id}/${discordResponse.avatar}.png`} />
              <div className="ml-2">{shorten(discordResponse.username, 16)}</div>
            </div>
          )}
        </a>
      </div>
    </div>
  );
}

export default DiscordButton;
