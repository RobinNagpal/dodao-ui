export enum ManageSpaceSubviews {
  SpacesList = 'spaces',
  ProjectList = 'projects',
  ProjectDetails = 'project-details',
  Chatbot = 'chatbot',
  ViewSpace = 'view-space',
  GenerateImage = 'generate-image',
  GenerateStoryBoard = 'generate-storyboard',
}

export enum ChatbotView {
  Discourse = 'discourse',
  Discord = 'discord',
  WebsiteScraping = 'website-scraping',
  FAQs = 'faqs',
  UserQuestions = 'user-questions',
  Github = 'github',
  Categories = 'categories',
}

export enum ChatbotSubView {
  DiscordInfo = 'discord-info',
  DiscordChannels = 'discord-channels',
  DiscordMessages = 'discord-messages',

  DiscourseIndexRuns = 'discourse-index-runs',
  DiscoursePostComments = 'discourse-post-comments',
  DiscouseInfo = 'discourse-info',

  WebScrappingInfo = 'web-scrapping-info',
  WebsiteScrapingURLInfos = 'website-scraping-url-infos',

  FAQsInfo = 'faqs-info',

  UserQuestionsInfo = 'user-questions-info',

  GithubInfo = 'github-info',

  CategoriesInfo = 'categories-info',
  CategoriesUpsert = 'categories-upsert',
}

export function getBaseUrlForSpaceSubview(spaceId: string, subview: ManageSpaceSubviews) {
  return `/space/manage/${subview}`;
}

export function getChatbotSubviewUrl(view: ChatbotView, subview: ChatbotSubView, subviewParam?: string) {
  return `/space/manage/${ManageSpaceSubviews.Chatbot}/${view}/${subview}${subviewParam ? `/${subviewParam}` : ''}`;
}
