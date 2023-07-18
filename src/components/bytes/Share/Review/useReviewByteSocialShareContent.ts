import {
  ByteLinkedinPdfContent,
  ByteLinkedinPdfContentStep,
  ByteSocialShare,
  useAskCompletionAiMutation,
  useByteSocialShareQuery,
  useGenerateSharablePdfForByteMutation,
  useQueryByteDetailsQuery,
  useUpsertByteSocialShareMutation,
} from '@/graphql/generated/generated-types';
import { rewriteToCharacterLengthUsingAi, rewriteToWordsCountUsingAi } from '@/utils/ai/rewriteUsingAi';
import { useState } from 'react';
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
  generatePdf: () => void;
  generatingAiContent: boolean;
  isInvalidTitle: (title: string) => boolean;
  isInvalidExcerpt: (excerpt: string) => boolean;
  isInvalidContent: (content: string) => boolean;
}

export default function useReviewByteSocialShareContent(spaceId: string, byteId: string): ReviewByteSocialShareHelper {
  const [byteSocialShare, setByteSocialShare] = useState<EditByteSocialShare>();
  const [generatingContent, setGeneratingContent] = useState<boolean>(false);
  const [generatingAiContent, setGeneratingAiContent] = useState<boolean>(false);
  const [askCompletionAiMutation] = useAskCompletionAiMutation();
  const [upsertByteSocialShareMutation] = useUpsertByteSocialShareMutation();
  const [generateSharablePdfForByteMutation] = useGenerateSharablePdfForByteMutation();

  const { data, refetch: fetchByteSocialShare } = useByteSocialShareQuery({
    variables: {
      spaceId: spaceId,
      byteId: byteId,
    },
  });

  function cleanUpString(str: string) {
    return str.replace(/[\n\t\r]/g, '').trim();
  }
  const { refetch: fetchByte } = useQueryByteDetailsQuery({
    skip: true,
  });

  function isInvalidTitle(str: string): boolean {
    return str.length > 24;
  }

  function isInvalidExcerpt(str: string): boolean {
    const words = str.split(' ');
    return words.length > 14;
  }

  function isInvalidContent(str: string): boolean {
    const words = str.split(' ');
    return words.length > 40;
  }

  async function generateContentIfInvalid(linkedinPdfContent: ByteLinkedinPdfContent) {
    if (isInvalidTitle(linkedinPdfContent.title)) {
      const title = await rewriteToCharacterLengthUsingAi(askCompletionAiMutation, linkedinPdfContent.title, 18);
      updateLinkedInPdfContentField('title', cleanUpString(title));
    }

    if (isInvalidExcerpt(linkedinPdfContent.excerpt)) {
      const excerpt = await rewriteToWordsCountUsingAi(askCompletionAiMutation, linkedinPdfContent.excerpt, 14);
      updateLinkedInPdfContentField('excerpt', cleanUpString(excerpt));
    }

    const steps = [];
    for (const step of linkedinPdfContent.steps) {
      const stepCopy = {
        ...step,
      };

      if (isInvalidContent(step.content)) {
        const content = await rewriteToWordsCountUsingAi(askCompletionAiMutation, step.content, 40);
        stepCopy.content = cleanUpString(content);
      }

      if (isInvalidTitle(step.name)) {
        const name = await rewriteToCharacterLengthUsingAi(askCompletionAiMutation, step.name, 18);
        stepCopy.name = cleanUpString(name);
      }
      steps.push(stepCopy);
    }

    updateLinkedInPdfContentField('steps', steps);
  }

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
          }),
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
    let linkedinPdfContent: ByteLinkedinPdfContent | undefined = undefined;
    if (socialShare?.linkedinPdfContent) {
      linkedinPdfContent = socialShare.linkedinPdfContent;
      setSocialShareDetails(socialShare);
    } else {
      const byteResponse = await fetchByte({
        spaceId: spaceId,
        byteId: byteId,
      });

      const byte = byteResponse.data?.byte;
      if (byte) {
        const relevantSteps = byte.steps
          .filter((s) => s.content.length > 15)
          .map((step, index) => ({
            name: step.name,
            content: step.content,
          }));
        const upsertResponse = await upsertByteSocialShareMutation({
          variables: {
            spaceId: spaceId,
            input: {
              byteId: byteId,
              spaceId: spaceId,
              linkedinPdfContent: {
                title: byte.name,
                excerpt: byte.content,
                steps: relevantSteps,
              },
            },
          },
        });
        if (upsertResponse.data) {
          setSocialShareDetails(upsertResponse.data.payload);
        }
        linkedinPdfContent = upsertResponse?.data?.payload.linkedinPdfContent || undefined;
      }
    }

    // setGeneratingAiContent(true);
    if (linkedinPdfContent) {
      await generateContentIfInvalid(linkedinPdfContent);
    }

    // setGeneratingAiContent(false);
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

  async function generatePdf() {
    await upsertByteSocialShareMutation({
      variables: {
        spaceId: spaceId,
        input: {
          byteId: byteId,
          spaceId: spaceId,
          linkedinPdfContent: {
            title: byteSocialShare?.linkedinPdfContent?.title || '',
            excerpt: byteSocialShare?.linkedinPdfContent?.excerpt || '',
            steps:
              byteSocialShare?.linkedinPdfContent?.steps.map((step) => ({
                name: step.name,
                content: step.content,
              })) || [],
          },
        },
      },
    });
    const response = await generateSharablePdfForByteMutation({
      variables: {
        spaceId,
        byteId,
      },
    });
    if (response.data?.payload) {
      window.open(response.data.payload, '_blank');
    }
  }

  return {
    initializeByteSocialShare,
    byteSocialShare,
    updateLinkedInPdfContentField,
    updateLinkedInPdfContentStep,
    generatePdf,
    generatingAiContent,
    isInvalidTitle,
    isInvalidExcerpt,
    isInvalidContent,
  };
}
