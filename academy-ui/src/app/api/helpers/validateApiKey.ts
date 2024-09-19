import { prisma } from '@/prisma';

export async function validateApiKey(apiKey: string, spaceId: string) {
  const spaceIntegration = await prisma.spaceIntegration.findUnique({
    where: { spaceId },
  });

  if (!spaceIntegration?.spaceApiKeys) {
    throw new Error('API Key is not valid');
  }

  const apiKeyEntry = spaceIntegration.spaceApiKeys.find((key) => key.apiKey === apiKey);

  if (!apiKeyEntry) {
    throw new Error('API Key is not valid');
  }

  apiKeyEntry.lastUsed = new Date();

  await prisma.spaceIntegration.update({
    where: { spaceId },
    data: { spaceApiKeys: spaceIntegration.spaceApiKeys },
  });
}
