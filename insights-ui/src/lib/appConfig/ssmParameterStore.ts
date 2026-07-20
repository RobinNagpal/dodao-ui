import { GetParametersByPathCommand, PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

/**
 * Thin wrapper over AWS SSM Parameter Store used to back the app-config layer.
 * SSM is a pay-per-request key/value store with no minimum commitment, so it is
 * a cheap home for a handful of runtime settings. Everything here is optional:
 * when SSM is not configured the config layer falls back to bundled defaults and
 * never calls AWS.
 */

/** Whether SSM Parameter Store is wired up for this runtime. */
export function isSsmConfigured(): boolean {
  return process.env.APP_CONFIG_SSM_ENABLED === 'true';
}

/** SSM path prefix under which every managed parameter lives (trailing slash guaranteed). */
export function getSsmPrefix(): string {
  const prefix = process.env.APP_CONFIG_SSM_PREFIX || '/koalagains/insights-ui/';
  return prefix.endsWith('/') ? prefix : `${prefix}/`;
}

let client: SSMClient | undefined;

function getClient(): SSMClient {
  if (!client) {
    client = new SSMClient({
      region: process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1',
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
          : undefined,
    });
  }
  return client;
}

/** Fetch every parameter under the prefix as a `{ key: value }` map (keys have the prefix stripped). */
export async function fetchAllSsmParameters(): Promise<Record<string, string>> {
  const prefix = getSsmPrefix();
  const ssm = getClient();
  const values: Record<string, string> = {};
  let nextToken: string | undefined;
  do {
    const res = await ssm.send(new GetParametersByPathCommand({ Path: prefix, WithDecryption: true, NextToken: nextToken }));
    for (const p of res.Parameters ?? []) {
      if (p.Name && p.Value !== undefined) {
        values[p.Name.slice(prefix.length)] = p.Value;
      }
    }
    nextToken = res.NextToken;
  } while (nextToken);
  return values;
}

/** Write (or overwrite) a single parameter under the prefix. */
export async function putSsmParameter(key: string, value: string): Promise<void> {
  const ssm = getClient();
  await ssm.send(new PutParameterCommand({ Name: `${getSsmPrefix()}${key}`, Value: value, Type: 'String', Overwrite: true }));
}
