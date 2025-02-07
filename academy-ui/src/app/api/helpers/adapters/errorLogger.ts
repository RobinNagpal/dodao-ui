import { formatAxiosError } from '@/app/api/helpers/adapters/formatAxiosError';
import axios from 'axios';
import { NextRequest } from 'next/server';

const staticPageGenerationError = 'rendered statically ';

export async function logError(
  message: string,
  params: Record<string, any> = {},
  e: Error | null = null,
  spaceId: string | null = null,
  blockchain: string | null = null
) {
  if (shouldIgnoreError(e || message)) {
    return;
  }

  console.error(
    e?.message,
    JSON.stringify({
      spaceId,
      blockchain,
      message,
      params,
    })
  );
  await postErrorOnDiscord(e, spaceId, blockchain, message, params);
}

export async function logErrorRequest(e: Error | string | null, req: NextRequest) {
  if (!e || shouldIgnoreError(e)) {
    return;
  }

  let jsonBody = '';
  try {
    jsonBody = JSON.stringify(await req.json());
  } catch (e) {}
  const embeds = [
    {
      title: 'Request Info',
      fields: [
        {
          name: 'Url',
          value: req.url || '----',
          inline: true,
        },
        {
          name: 'Message',
          value: (await req.text()).substring(0, 1000),
          inline: false,
        },
        {
          name: 'JSON',
          value: jsonBody.substring(0, 1000),
          inline: false,
        },
      ],
    },
  ];
  const data = {
    content: `Got an error for ${req.url}`,
    embeds,
  };

  axios.post(process.env.SERVER_ERRORS_WEBHOOK!, data).catch((err) => {
    console.log(formatAxiosError(err));
    console.log(JSON.stringify(embeds, null, 2));
  });
}

function shouldIgnoreError(e: Error | string) {
  if (typeof e === 'string' && e.includes(staticPageGenerationError)) {
    return true;
  }

  const error = e as Error;

  if (error?.message?.includes(staticPageGenerationError) || error?.stack?.includes(staticPageGenerationError)) {
    return true;
  }
  return false;
}

async function postErrorOnDiscord(e: Error | null, spaceId: string | null, blockchain: string | null, message: string, params: Record<string, any> = {}) {
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
