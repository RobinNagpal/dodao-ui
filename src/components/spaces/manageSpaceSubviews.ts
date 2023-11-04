export enum ManageSpaceSubviews {
  SpacesList = 'spaces',
  ProjectList = 'projects',
  ProjectDetails = 'project-details',
  Chatbot = 'chatbot',
  ViewSpace = 'view-space',
  GenerateImage = 'generate-image',
  GenerateStoryBoard = 'generate-storyboard',
}

export function getBaseUrlForSpaceSubview(spaceId: string, subview: ManageSpaceSubviews) {
  return `/space/manage/${subview}`;
}
