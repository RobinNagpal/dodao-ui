import { UpsertClickableDemoInput } from '@/graphql/generated/generated-types';
import { ClickableDemoStepDto, TooltipPlacement } from '@/types/clickableDemos/ClickableDemoDto';
import { v4 as uuidv4 } from 'uuid';

export const sampleClickableDemo = (): ClickableDemoStepDto => {
  const step1Uuid = uuidv4();
  return {
    id: step1Uuid,
    url: 'www.google.com',
    selector: `XPath to be used to select element`,
    tooltipInfo: `Text to be displayed on tooltip`,
    order: 0,
    placement: TooltipPlacement.Top,
  };
};

export const emptyClickableDemo = (): UpsertClickableDemoInput => {
  const clickableDemoUuid = '';
  return {
    id: clickableDemoUuid,
    title: 'Clickable Demo Name',
    excerpt: 'Clickable Demo Excerpt',
    steps: [sampleClickableDemo()],
  };
};