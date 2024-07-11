import { ByteModel, ByteStep, ByteStepItem } from '@/app/api/helpers/deprecatedSchemas/models/byte/ByteModel';
import { TimelineModel } from '@/app/api/helpers/deprecatedSchemas/models/timeline/TimelineModel';
import { Space } from '@prisma/client';
import fs from 'fs';
import { AcademyObjectTypes } from '@/app/api/helpers/academy/academyObjectTypes';
import { getAcademyRepoInfo, getRedisKeyForAcademyObject, getRedisKeyForAcademyObjects } from '@/app/api/helpers/academy/gitAcademyRepoWrapper';
import { getAcademyObjectKeysFromRedis } from '@/app/api/helpers/academy/readers/academyObjectReader';
import { writeToFile } from '@/app/api/helpers/fileWriter';
import { getAuthor } from '@/app/api/helpers/getAuthor';
import { setRedisValue } from '@/app/api/helpers/redis';
import { slugify } from '@/app/api/helpers/space/slugify';
import { add, commit, push } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import yaml from 'js-yaml';
import { union } from 'lodash';

export interface AcademyObject {
  id: string;
  name: string;
}

function transformGitObjectIntoModel<T extends AcademyObject>(t: T, objectType: AcademyObjectTypes, space: Space): ByteModel | TimelineModel | T {
  if (objectType === AcademyObjectTypes.bytes) {
    const inputObject = t as any & AcademyObject;
    const transformed: ByteModel = {
      ...inputObject,
      steps: inputObject.steps.map((s: ByteStep, i: number) => ({
        ...s,
        order: i,
        stepItems: ((s.stepItems || []) as ByteStepItem[]).map((si, order) => ({
          ...si,
          order,
        })),
      })),
    };
    return transformed;
  }
  if (objectType === AcademyObjectTypes.simulations) {
    const inputObject = t as any & AcademyObject;
    const transformed: TimelineModel = {
      ...inputObject,
      steps: inputObject.steps.map((s: ByteStep, i: number) => ({
        ...s,
        order: i,
      })),
    };
    return transformed;
  }

  if (objectType === AcademyObjectTypes.timelines) {
    const inputObject = t as any & AcademyObject;
    const transformed: TimelineModel = {
      ...inputObject,
      events: inputObject.events.map((s: ByteStep, i: number) => ({ ...s, order: i })),
    };
    return transformed;
  }

  return t;
}
export async function setAcademyObjectInRedis<T extends AcademyObject>(space: Space, gitObjectModel: T, objectType: AcademyObjectTypes) {
  const objectModel = transformGitObjectIntoModel(gitObjectModel, objectType, space);
  const redisObjectKey = getRedisKeyForAcademyObject(space.id, objectType, gitObjectModel.id);
  await setRedisValue(redisObjectKey, JSON.stringify(objectModel));
}

export async function setAcademyObjectsArrayInRedis(spaceId: string, objectKeysArray: string[], objectType: AcademyObjectTypes) {
  const objectKey = getRedisKeyForAcademyObjects(spaceId, objectType);
  await setRedisValue(objectKey, JSON.stringify(union(objectKeysArray)));
}

export async function setAcademyObjectsInRedis<T extends AcademyObject>(space: Space, gitObjectModels: T[], objectType: AcademyObjectTypes) {
  const keys = gitObjectModels.map((g) => g.id);
  await setAcademyObjectsArrayInRedis(space.id, keys, objectType);
  for (const gitObjectModel of gitObjectModels) {
    await setAcademyObjectInRedis(space, gitObjectModel, objectType);
  }
}

interface WriteObjectToRepoParams {
  objectModel: AcademyObject;
  repositoryPath: string;
  absoluteObjectYamlPath: string;
  accountId: string;
  saveGenerated: boolean;
  slugifiedObjectName?: string;
  objectType: AcademyObjectTypes;
}

async function writeObjectToRepo({
  objectModel,
  repositoryPath,
  absoluteObjectYamlPath,
  accountId,
  saveGenerated,
  slugifiedObjectName,
  objectType,
}: WriteObjectToRepoParams) {
  const contents: string = yaml.dump(objectModel);
  await writeToFile(absoluteObjectYamlPath, contents);

  if (saveGenerated) {
    const generatedObjectRelativePath = `generated/${objectType}/main/json/${slugifiedObjectName}.json`;
    await writeToFile(`${repositoryPath}/${generatedObjectRelativePath}`, JSON.stringify(objectModel, null, 2));
  }
  await add({
    fs,
    dir: repositoryPath,
    filepath: '.',
  });
  await commit({
    fs,
    dir: repositoryPath,
    author: getAuthor(accountId),
    message: `update ${objectType} ${objectModel.id}`,
  });

  const pushResult = await push({
    fs,
    http,
    dir: repositoryPath,
    remote: 'origin',
    ref: 'main',
    onAuth: () => ({ username: process.env.GITHUB_TOKEN }),
  });
  console.log('pushResult', pushResult);
}

interface AppendToAcademyObjectsParams<T extends AcademyObject> {
  space: Space;
  objectModel: T;
  objectType: AcademyObjectTypes;
  objectYamlFileNamesArray: string[];
  repositoryPath: string;
  slugifiedObjectName: string;
  objectsYamlAbsoluteFilePath: string;
}

async function appendToAcademyObjects<T extends AcademyObject>({
  space,
  objectModel,
  objectType,
  objectYamlFileNamesArray,
  repositoryPath,
  slugifiedObjectName,
  objectsYamlAbsoluteFilePath,
}: AppendToAcademyObjectsParams<T>) {
  console.log(`${objectType} ${objectModel.id} not present in ${objectType}.yaml. Adding a new one`, JSON.stringify(objectYamlFileNamesArray, null, 2));
  const objectsJsonFile = `${repositoryPath}/generated/${objectType}/main/json/${objectType}.json`;

  const updatesObjectsArray = union([...objectYamlFileNamesArray, `${slugifiedObjectName}.yaml`]);
  const objectsJson = { [objectType]: updatesObjectsArray };
  const contents: string = yaml.dump(objectsJson);

  await writeToFile(objectsYamlAbsoluteFilePath, contents);

  await writeToFile(
    objectsJsonFile,
    JSON.stringify(
      updatesObjectsArray.map((objectFileName) => objectFileName.replace('.yaml', '.json')),
      null,
      2
    )
  );

  const objectKeys = await getAcademyObjectKeysFromRedis(space.id, objectType);
  objectKeys.push(slugifiedObjectName);
  await setAcademyObjectsArrayInRedis(space.id, objectKeys, objectType);
}

export async function writeObjectToAcademyRepo<T extends AcademyObject>(
  space: Space,
  objectModel: T,
  objectType: AcademyObjectTypes,
  accountId: string
): Promise<T> {
  const { repositoryPath } = await getAcademyRepoInfo(space);

  const objectsYamlRelativePath = `src/${objectType}/main/${objectType}.yaml`;
  const objectsYamlAbsoluteFilePath = `${repositoryPath}/${objectsYamlRelativePath}`;
  const objectYamlFileContents: any = yaml.load(fs.readFileSync(objectsYamlAbsoluteFilePath, 'utf8'));
  const absoluteObjectYamlPath = `${repositoryPath}/src/${objectType}/main/${objectModel.id}.yaml`;

  const writeParams: WriteObjectToRepoParams = {
    objectModel,
    objectType,
    repositoryPath,
    absoluteObjectYamlPath,
    accountId,
    saveGenerated: true,
  };

  if (!objectYamlFileContents[objectType].includes(objectModel.id + '.yaml')) {
    const slugifiedObjectName = slugify(objectModel.name + ' ' + space.name);

    writeParams.absoluteObjectYamlPath = `${repositoryPath}/src/${objectType}/main/${slugifiedObjectName}.yaml`;

    writeParams.slugifiedObjectName = slugifiedObjectName;
    objectModel.id = slugifiedObjectName;
    await appendToAcademyObjects({
      space,
      objectModel,
      objectType,
      objectYamlFileNamesArray: objectYamlFileContents[objectType],
      repositoryPath,
      slugifiedObjectName,
      objectsYamlAbsoluteFilePath,
    });
  } else {
    writeParams.slugifiedObjectName = objectModel.id;
    console.log(`updating in academy repo ${objectModel.id}`);
  }

  await writeObjectToRepo(writeParams);

  await setAcademyObjectInRedis(space, objectModel, objectType);

  return transformGitObjectIntoModel(objectModel as any, objectType, space);
}
