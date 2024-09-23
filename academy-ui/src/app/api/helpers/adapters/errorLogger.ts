import { formatAxiosError } from '@/app/api/helpers/adapters/formatAxiosError';
import axios from 'axios';

async function postErrorOnDiscord(e: Error | null, spaceId: string | null, blockchain: string | null, message: string, params: Record<string, any> = {}) {
  if (message === 'invalid request request') {
    return;
  }
  const embeds = [
    {
      title: 'Request Info',
      fields: [
        {
          name: 'SpaceId',
          value: spaceId || '----',
          inline: true,
        },
        {
          name: 'Message',
          value: (message || '----').substr(0, 1000),
          inline: false,
        },
        {
          name: 'Params',
          value: JSON.stringify(params || {}).substr(0, 1000),
          inline: false,
        },
      ],
    },
  ];
  if (e) {
    embeds.push({
      title: 'Error',
      fields: [
        {
          name: 'Stack',
          value: (e.stack || '----').substr(0, 1000),
          inline: false,
        },
      ],
    });
  }

  const data = {
    content: `Got an error on ${spaceId}`,
    embeds,
  };

  axios.post(process.env.SERVER_ERRORS_WEBHOOK!, data).catch((err) => {
    console.log(formatAxiosError(err));
    console.log(JSON.stringify(embeds, null, 2));
  });
}

export async function logError(
  message: string,
  params: Record<string, any> = {},
  e: Error | null = null,
  spaceId: string | null = null,
  blockchain: string | null = null
) {
  console.error(
    e,
    JSON.stringify({
      spaceId,
      blockchain,
      message,
      params,
    })
  );
  await postErrorOnDiscord(e, spaceId, blockchain, message, params);
}

export async function logErrorRequest(e: Error | null, body: any) {
  if (e?.message === 'invalid request request') {
    return;
  }
  console.error(e);

  const data = body.data;
  const { message } = data;
  await postErrorOnDiscord(e, message.space ?? null, message.blockchain ?? null, e?.message || 'Error in Request', {
    message,
  });
}
