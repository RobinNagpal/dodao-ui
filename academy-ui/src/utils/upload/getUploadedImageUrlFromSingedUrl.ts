export function getUploadedImageUrlFromSingedUrl(signedUrl: string) {
  return signedUrl
    ?.replace('https://dodao-prod-public-assets.s3.amazonaws.com', 'https://d31h13bdjwgzxs.cloudfront.net')
    ?.replace('https://dodao-prod-public-assets.s3.us-east-1.amazonaws.com', 'https://d31h13bdjwgzxs.cloudfront.net')
    ?.split('?')[0];
}
