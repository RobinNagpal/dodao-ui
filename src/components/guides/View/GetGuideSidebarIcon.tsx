import { GuideStepFragment } from '@/graphql/generated/generated-types';
import { isQuestion, isUserInput } from '@/types/deprecated/helpers/stepItemTypes';
import { ClipboardDocumentCheckIcon, DocumentDuplicateIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import React from 'react';

export function getGuideSidebarIcon(step: GuideStepFragment) {
  const hasQuestions = step.stepItems.some((item) => isQuestion(item));
  const hasInputs = step.stepItems.some((item) => isUserInput(item));

  if (hasQuestions) {
    return ClipboardDocumentCheckIcon;
  }
  if (hasInputs) {
    return PencilSquareIcon;
  }

  return DocumentDuplicateIcon;
}
