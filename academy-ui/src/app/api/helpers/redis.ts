import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
});

export async function setupRedis() {
  client.on('error', async (e) => {
    console.log('Redis Client Error', e);
    await logError(`Redis Client Error - ${e.toString()}`, {}, e as Error, null, null);
  });

  await client.connect();

  await client.set('test-app-key', 'test-successful-at ' + new Date().toISOString());
  const successValue = await client.get('test-app-key');
  console.log('Redis Connection successful at -', successValue);
}

export async function setRedisValue(key: string, value: string) {
  await client.set(key, value);
}
export async function deleteRedisValue(key: string) {
  await client.del(key);
}

export async function getRedisValue(key: string): Promise<string | null> {
  return await client.get(key);
}
