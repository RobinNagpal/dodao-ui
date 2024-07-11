import { AcademyObjectTypes } from '@/app/api/helpers/academy/academyObjectTypes';
import { getRedisKeyForAcademyObject, getRedisKeyForAcademyObjects } from '@/app/api/helpers/academy/gitAcademyRepoWrapper';
import { AcademyObject } from '@/app/api/helpers/academy/writers/academyObjectWriter';
import { getRedisValue } from '@/app/api/helpers/redis';

export async function getAcademyObjectKeysFromRedis(spaceId: string, objectType: AcademyObjectTypes): Promise<string[]> {
  const objectsArrayKey = getRedisKeyForAcademyObjects(spaceId, objectType);
  const objectsArrayString = await getRedisValue(objectsArrayKey);
  return objectsArrayString ? JSON.parse(objectsArrayString) : [];
}

export async function getAcademyObjectFromRedis<T extends AcademyObject>(
  spaceId: string,
  objectType: AcademyObjectTypes,
  objectKey: string
): Promise<T | undefined> {
  const redisKeyForObject = getRedisKeyForAcademyObject(spaceId, objectType, objectKey);
  const objectsString = await getRedisValue(redisKeyForObject);
  return objectsString ? JSON.parse(objectsString) : undefined;
}

export async function getAllAcademyObjectsForSpace<T extends AcademyObject>(spaceId: string, objectType: AcademyObjectTypes): Promise<T[]> {
  const keysForSpace = await getAcademyObjectKeysFromRedis(spaceId, objectType);
  const gitObjects: T[] = [];
  for (const objectKey of keysForSpace) {
    const objectModel: T | undefined = await getAcademyObjectFromRedis(spaceId, objectType, objectKey);
    if (objectModel) {
      gitObjects.push(objectModel);
    }
  }

  return gitObjects;
}
