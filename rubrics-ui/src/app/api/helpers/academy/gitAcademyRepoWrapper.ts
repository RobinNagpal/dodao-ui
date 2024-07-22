import { AcademyObjectTypes } from '@/app/api/helpers/academy/academyObjectTypes';
import { ensureDirectoryExistence } from '@/app/api/helpers/git/ensureDirectoryExistence';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client';
import fs from 'fs';
import { clone, listRemotes } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
export interface AcademyRepoInfo {
  academyRepository: string;
  repositoryFolderName: string;
  parentDirectory: string;
  repositoryPath: string;
}

export async function getAcademyRepoInfo(space: Space): Promise<AcademyRepoInfo> {
  const spaceIntegration = await prisma.spaceIntegration.findFirst({ where: { spaceId: space.id } });
  const academyRepository = spaceIntegration?.academyRepository;
  if (!academyRepository) {
    throw new Error('No git repository integration added');
  }

  const repositoryFolderName = academyRepository.split('/').pop() || '';
  const parentDirectory = `${process.env.MAIN_GIT_FOLDER_PATH}/dodao-academy-repos/${space.id}`;
  const repositoryPath = `${parentDirectory}/${repositoryFolderName}`;

  return {
    academyRepository,
    repositoryFolderName,
    parentDirectory,
    repositoryPath,
  };
}

export async function ensureAcademyRepositoryIsAlreadyCloned(space: Space) {
  const { academyRepository, parentDirectory, repositoryPath } = await getAcademyRepoInfo(space);
  ensureDirectoryExistence(parentDirectory);

  if (!fs.existsSync(repositoryPath)) {
    await clone({
      fs,
      http,
      dir: repositoryPath,
      url: academyRepository,
    });
  }

  const remotes = await listRemotes({ fs, dir: repositoryPath });

  if (remotes.pop()?.url !== academyRepository) {
    throw new Error('Not the same repo');
  }
}

export function getAuthor(accountId: string) {
  return {
    name: `Account - ${accountId}`,
    email: '',
  };
}
export const getRedisKeyForAcademyByte = (spaceId: string, byteId: string): string => `${spaceId}__academy__bytes__${byteId}`;

export const getRedisKeyForAcademyGuide = (spaceId: string, guideKey: string): string => `${spaceId}__academy__guides__${guideKey}`;

export const getRedisKeyForAcademyTimeline = (spaceId: string, timelineId: string): string => `${spaceId}__academy__timelines__${timelineId}`;

export const getRedisKeyForAcademySimulation = (spaceId: string, simulationId: string): string => `${spaceId}__academy__simulations__${simulationId}`;

export const getRedisKeyForAcademyBytes = (spaceId: string): string => `academy_bytes_${spaceId}`;
export const getRedisKeyForAcademyGuides = (spaceId: string): string => `academy_guides_${spaceId}`;
export const getRedisKeyForAcademyTimelines = (spaceId: string): string => `academy_timelines_${spaceId}`;
export const getRedisKeyForAcademySimulations = (spaceId: string): string => `academy_simulations_${spaceId}`;

export const getRedisKeyForAcademyObject = (spaceId: string, objectType: AcademyObjectTypes, objectId: string): string =>
  `${spaceId}__academy__${objectType}__${objectId}`;

export const getRedisKeyForAcademyObjects = (spaceId: string, objectType: AcademyObjectTypes): string => `academy_${objectType}_${spaceId}`;
