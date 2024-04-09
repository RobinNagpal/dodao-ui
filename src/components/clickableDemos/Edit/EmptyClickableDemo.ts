import { UpsertClickableDemoInput } from '@/graphql/generated/generated-types';
import { v4 as uuidv4 } from 'uuid';

export const emptyClickableDemo = (): UpsertClickableDemoInput => {
  const step1Uuid = uuidv4();
  const clickableDemoUuid = '';
  return {
    id: clickableDemoUuid,
    title: 'Clickable Demo Name',
    excerpt: 'Clickable Demo Excerpt',
    steps: [
      {
        id: step1Uuid,
        url: 'www.google.com',
        selector: `XPath to be used to select element`,
        tooltipInfo: `Text to be displayed on tooltip`,
        order: 0,
      },
    ],
  };
};
