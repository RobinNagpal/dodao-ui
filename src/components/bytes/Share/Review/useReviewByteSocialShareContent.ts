import {
  ByteLinkedinPdfContent,
  ByteLinkedinPdfContentStep,
  ByteSocialShare,
  ChatCompletionRequestMessageRoleEnum,
  useAskChatCompletionAiMutation,
  useByteSocialShareQuery,
  useQueryByteDetailsQuery,
  useQueryBytesQuery,
  useUpsertByteSocialShareMutation,
} from '@/graphql/generated/generated-types';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';

export type EditByteLinkedinPdfContentStep = ByteLinkedinPdfContentStep & { order: number };
export interface EditByteLinkedinPdfContent extends ByteLinkedinPdfContent {
  steps: EditByteLinkedinPdfContentStep[];
}

export interface EditByteSocialShare extends ByteSocialShare {
  linkedinPdfContent?: EditByteLinkedinPdfContent;
}

interface ReviewByteSocialShareHelper {
  initializeByteSocialShare: () => void;
  updateLinkedInPdfContentStep: (stepOrder: number, field: keyof ByteLinkedinPdfContentStep, value: any) => void;
  byteSocialShare: EditByteSocialShare | undefined;
  updateLinkedInPdfContentField: (field: keyof ByteLinkedinPdfContent, value: any) => void;
}

export default function useReviewByteSocialShareContent(spaceId: string, byteId: string): ReviewByteSocialShareHelper {
  const [byteSocialShare, setByteSocialShare] = useState<EditByteSocialShare>();
  const [generatingContent, setGeneratingContent] = useState<boolean>(false);
  const [askChatCompletionAiMutation] = useAskChatCompletionAiMutation();
  const [upsertByteSocialShareMutation] = useUpsertByteSocialShareMutation();
  const { data, refetch: fetchByteSocialShare } = useByteSocialShareQuery({
    variables: {
      spaceId: spaceId,
      byteId: byteId,
    },
  });

  const { refetch: fetchByte } = useQueryByteDetailsQuery({
    skip: true,
  });

  function setSocialShareDetails(socialShare: ByteSocialShare) {
    const linkedinPdfContent = socialShare?.linkedinPdfContent;
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
  }

  async function initializeByteSocialShare() {
    const byteShareQueryResponse = await fetchByteSocialShare();
    const socialShare = byteShareQueryResponse.data?.byteSocialShare;
    if (socialShare?.linkedinPdfContent) {
      setSocialShareDetails(socialShare);
    } else {
      const byteResponse = await fetchByte({
        spaceId: spaceId,
        byteId: byteId,
      });

      const byte = byteResponse.data?.byte;
      if (byte) {
        const upsertResponse = await upsertByteSocialShareMutation({
          variables: {
            spaceId: spaceId,
            input: {
              uuid: v4(),
              byteId: byteId,
              spaceId: spaceId,
              linkedinPdfContent: {
                title: byte.name,
                excerpt: byte.content,
                steps: byte.steps
                  .filter((s) => s.content.length > 10)
                  .map((step, index) => ({
                    name: step.name,
                    content: step.content,
                  })),
              },
            },
          },
        });
        if (upsertResponse.data) {
          setSocialShareDetails(upsertResponse.data.payload);
        }
      }
    }
  }

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
    initializeByteSocialShare,
    byteSocialShare,
    updateLinkedInPdfContentField,
    updateLinkedInPdfContentStep,
  };
}
