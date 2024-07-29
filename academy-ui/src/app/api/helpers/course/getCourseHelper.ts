export interface CourseRepoInfo {
  repositoryFolderName: string;
  parentDirectory: string;
  repositoryPath: string;
}

export function getCourseRepoInfo(spaceId: string, courseRepoUrl: string): CourseRepoInfo {
  const repositoryFolderName = courseRepoUrl.split('/').pop();

  if (!repositoryFolderName) {
    throw new Error(`something wrong with the url of course - ${spaceId} - ${courseRepoUrl}`);
  }
  const parentDirectory = `${process.env.MAIN_GIT_FOLDER_PATH}/dodao-courses-repos/${spaceId}`;
  const repositoryPath = `${parentDirectory}/${repositoryFolderName}`;

  return {
    repositoryFolderName,
    parentDirectory,
    repositoryPath,
  };
}
