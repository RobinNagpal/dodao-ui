import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { TimelineEventFragment } from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import React from 'react';

export interface TimelineDetailsModalProps {
  open: boolean;
  onClose: () => void;
  event: TimelineEventFragment;
}
export default function TimelineDetailsModal({ event, open, onClose, }: TimelineDetailsModalProps) {


  const fullDetails = event.fullDetails;
  if (!fullDetails) return null;

  const renderer = getMarkedRenderer();
  const eventDetails = marked.parse(fullDetails, { renderer });
  return (
    <FullScreenModal open={open} onClose={onClose} title={event.title + ' Details'}>
      <div className="markdown-body  text-sm text-left" dangerouslySetInnerHTML={{ __html: eventDetails }} />
    </FullScreenModal>
  );
}
