import { ByteLinkedinPdfContent, ByteLinkedinPdfContentStep, ByteSocialShare, useByteSocialShareQuery } from '@/graphql/generated/generated-types';
import { useEffect, useState } from 'react';

export type EditByteLinkedinPdfContentStep = ByteLinkedinPdfContentStep & { order: number };
export interface EditByteLinkedinPdfContent extends ByteLinkedinPdfContent {
  steps: EditByteLinkedinPdfContentStep[];
}

export interface EditByteSocialShare extends ByteSocialShare {
  linkedinPdfContent?: EditByteLinkedinPdfContent;
}

interface ReviewByteSocialShareHelper {
  updateLinkedInPdfContentStep: (stepOrder: number, field: keyof ByteLinkedinPdfContentStep, value: any) => void;
  byteSocialShare: EditByteSocialShare | undefined;
  updateLinkedInPdfContentField: (field: keyof ByteLinkedinPdfContent, value: any) => void;
}

export default function useReviewByteSocialShareContent(spaceId: string, byteId: string): ReviewByteSocialShareHelper {

  const [byteSocialShare, setByteSocialShare] = useState<EditByteSocialShare>();

  const { data } = useByteSocialShareQuery({
    variables: {
      spaceId: spaceId,
      byteId: byteId,
    },
  });

  useEffect(() => {
    const socialShare = data?.byteSocialShare;
    if (socialShare) {
      const linkedinPdfContent = socialShare.linkedinPdfContent;
      if (linkedinPdfContent) {
        const editLinkedinPdfContent: EditByteLinkedinPdfContent = {
          ...linkedinPdfContent,
          steps: linkedinPdfContent.steps.map(
            (step, index): EditByteLinkedinPdfContentStep => ({
              name: step.name,
              content: step.content,
              order: index,
            })
          ),
        };
        setByteSocialShare({
          ...socialShare,
          linkedinPdfContent: editLinkedinPdfContent,
        });
      }
    } else {
      setByteSocialShare(socialShare);
    }
  }, [data]);

  function updateLinkedInPdfContentField(field: keyof ByteLinkedinPdfContent, value: any) {
    setByteSocialShare(function (prev) {
      if (prev?.linkedinPdfContent) {
        return {
          ...prev,
          linkedinPdfContent: {
            ...prev.linkedinPdfContent,
            [field]: value,
          },
        };
      }
      return prev;
    });
  }

  function updateLinkedInPdfContentStep(stepOrder: number, field: keyof ByteLinkedinPdfContentStep, value: any) {
    setByteSocialShare(function (prev) {
      if (prev?.linkedinPdfContent) {
        return {
          ...prev,
          linkedinPdfContent: {
            ...prev.linkedinPdfContent,
            steps: prev.linkedinPdfContent.steps.map((step) => {
              if (step.order === stepOrder) {
                return {
                  ...step,
                  [field]: value,
                };
              }
              return step;
            }),
          },
        };
      }
      return prev;
    });
  }

  return {
    byteSocialShare,
    updateLinkedInPdfContentField,
    updateLinkedInPdfContentStep,
  };
}
