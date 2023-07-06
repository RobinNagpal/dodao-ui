import { useGenerateSharablePdfForByteMutation } from '@/graphql/generated/generated-types';

export default function useGenerateByteSocialContent(spaceId: string, byteId: string) {
  const [generateSharablePdfForByteMutation] = useGenerateSharablePdfForByteMutation();
  async function generatePdf() {
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
    generatePdf,
  };
}
