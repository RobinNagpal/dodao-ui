import { ByteLinkedinPdfContent, ByteLinkedinPdfContentStep, ByteSocialShare } from '@/graphql/generated/generated-types';
import { rewriteToCharacterLengthUsingAi, rewriteToWordsCountUsingAi } from '@/utils/ai/rewriteUsingAi';
import getBaseUrl from '@/utils/api/getBaseURL';
import { Byte } from '@prisma/client';
import axios from 'axios';
import { useState } from 'react';

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

  function cleanUpString(str: string) {
    return str.replace(/[\n\t\r]/g, '').trim();
  }

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
      const title = await rewriteToCharacterLengthUsingAi(linkedinPdfContent.title, 18);
      updateLinkedInPdfContentField('title', cleanUpString(title));
    }

    if (isInvalidExcerpt(linkedinPdfContent.excerpt)) {
      const excerpt = await rewriteToWordsCountUsingAi(linkedinPdfContent.excerpt, 14);
      updateLinkedInPdfContentField('excerpt', cleanUpString(excerpt));
    }

    const steps = [];
    for (const step of linkedinPdfContent.steps) {
      const stepCopy = {
        ...step,
      };

      if (isInvalidContent(step.content)) {
        const content = await rewriteToWordsCountUsingAi(step.content, 40);
        stepCopy.content = cleanUpString(content);
      }

      if (isInvalidTitle(step.name)) {
        const name = await rewriteToCharacterLengthUsingAi(step.name, 18);
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
    const byteShareQueryResponse = await axios.get(`${getBaseUrl()}/api/byte/byte-social-share`, { params: { spaceId, byteId } });
    const socialShare = byteShareQueryResponse.data?.byteSocialShare;
    let linkedinPdfContent: ByteLinkedinPdfContent | undefined = undefined;
    if (socialShare?.linkedinPdfContent) {
      linkedinPdfContent = socialShare.linkedinPdfContent;
      setSocialShareDetails(socialShare);
    } else {
      const byteResponse = await axios.get(`${getBaseUrl()}/api/byte/byte`, {
        params: {
          spaceId,
          byteId,
        },
      });

      const byte: Byte = byteResponse.data?.byte;
      if (byte) {
        const relevantSteps = byte.steps
          .filter((s) => s.content.length > 15)
          .map((step, index) => ({
            name: step.name,
            content: step.content,
          }));

        try {
          const upsertResponse = await fetch('/api/byte/upsert-byte-social-share', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
            }),
          });
          if (!upsertResponse.ok) {
            throw new Error('Failed to upsert byte social share');
          }
          const responseData = await upsertResponse.json();

          setSocialShareDetails(responseData.byteSocialShare);

          linkedinPdfContent = responseData.byteSocialShare.linkedinPdfContent || undefined;
        } catch (e) {
          console.error(e);
        }
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
    await fetch('/api/byte/upsert-byte-social-share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });

    const response = await fetch('/api/byte/generate-sharable-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId,
        byteId,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to generate pdf');
    }
    const responseData = await response.json();
    if (responseData.outputLocation) {
      window.open(responseData.outputLocation, '_blank');
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
