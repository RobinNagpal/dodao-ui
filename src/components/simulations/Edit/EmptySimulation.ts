import { UpsertSimulationInput } from '@/graphql/generated/generated-types';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { v4 as uuidv4 } from 'uuid';

export const emptySimulation = (): UpsertSimulationInput & { isPristine: boolean } => {
  const step1Uuid = uuidv4();
  const step2Uuid = uuidv4();
  const simulationUuid = uuidv4();
  return {
    admins: [],
    created: new Date().toISOString(),
    priority: 0,
    tags: [],
    id: simulationUuid,
    isPristine: true,
    name: 'Simulation Name',
    content: 'New Simulation',

    publishStatus: PublishStatus.Live,
    steps: [
      {
        uuid: step1Uuid,
        name: 'Introduction',
        content: `
        Introduction Comments 
        `,
        order: 0,
      },
      {
        uuid: step2Uuid,
        name: 'Introduction Evaluation',
        iframeUrl: 'https://google.com',
        order: 1,
        content: '',
      },
    ],
  };
};
