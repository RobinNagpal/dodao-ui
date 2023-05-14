import { CreateSignedUrlDocument, CreateSignedUrlInput, CreateSignedUrlMutation, CreateSignedUrlMutationVariables } from '@/graphql/generated/generated-types';
import apolloClient from '@/utils/apolloClient';
import axios from 'axios';

export async function uploadImageToS3(spaceId: string, input: CreateSignedUrlInput, file: any) {
  const response = await apolloClient.mutate<CreateSignedUrlMutation, CreateSignedUrlMutationVariables>({
    mutation: CreateSignedUrlDocument,
    variables: {
      spaceId: spaceId,
      input,
    },
  });
  const signedUrl = response?.data?.payload!;
  await axios.put(signedUrl, file, {
    headers: { 'Content-Type': file.type },
  });

  const imageUrl = signedUrl
    ?.replace('https://dodao-prod-public-assets.s3.amazonaws.com', 'https://d31h13bdjwgzxs.cloudfront.net')
    ?.replace('https://dodao-prod-public-assets.s3.us-east-1.amazonaws.com', 'https://d31h13bdjwgzxs.cloudfront.net')
    ?.split('?')[0];

  return imageUrl;
}
