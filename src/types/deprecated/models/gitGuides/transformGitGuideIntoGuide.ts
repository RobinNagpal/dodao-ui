import { isQuestion } from './../../helpers/stepItemTypes';
import { GuideModel, GuideQuestion, GuideSource, GuideStep, UserDiscordConnect, UserInput } from './../GuideModel';
import { SpaceModel } from './../SpaceModel';
import { GitGuideModel } from './model/GitGuideModel';
import { GitGuideStep } from './model/GitGuideStep';

export function transformGitGuideIntoGuide(guide: GitGuideModel, spaceModel: SpaceModel): GuideModel {
  const created = parseInt((new Date(guide.created).getTime() / 1000).toFixed());
  return {
    ...guide,
    uuid: guide.key,
    id: guide.key,
    authors: [],
    link: '',
    space: spaceModel,
    previousId: null,
    version: 0,
    created,
    guideIntegrations: {
      discordRoleIds: [],
    },
    guideSource: GuideSource.Git,
    steps: guide.steps.map(
      (step: GitGuideStep, i): GuideStep => ({
        ...step,
        order: i,
        id: step.uuid,
        created,
        stepItems: step.stepItems.map((item, i): GuideQuestion | UserInput | UserDiscordConnect => {
          if (isQuestion(item)) {
            return {
              ...item,
              choices: (item as GuideQuestion).choices.map((choice, i) => ({ ...choice, order: i })),
              order: i,
            };
          }
          return {
            ...item,
            order: i,
          };
        }),
      }),
    ),
  };
}
