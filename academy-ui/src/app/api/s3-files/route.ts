import { ImageSource, MutationUploadImageFromUrlToS3Args } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { presignedUrlCreator } from '@/app/api/helpers/s3/getPresignedUrl';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import axios from 'axios';
import fs from 'fs';
import mime from 'mime-types';
import * as path from 'path';

import { URL } from 'url';

import { v4 as uuid } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

function getUploadedImageUrlFromSingedUrl(signedUrl: string) {
  return signedUrl
    ?.replace('https://dodao-prod-public-assets.s3.amazonaws.com', 'https://d31h13bdjwgzxs.cloudfront.net')
    ?.replace('https://dodao-prod-public-assets.s3.us-east-1.amazonaws.com', 'https://d31h13bdjwgzxs.cloudfront.net')
    ?.split('?')[0];
}

function getFileExtensionAndContentType(args: MutationUploadImageFromUrlToS3Args) {
  if (args.input.imageSource === ImageSource.Dalle) {
    // for eg - 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-n1hsT6SCH6MusA88ydSKoFsO/user-shBhgdej0GxBk0lmq5tCfPJy/img-WD7Jwmj2c6qm6mIlsxQcxSsn.png?st=2024-03-12T14%3A56%3A16Z&se=2024-03-12T16%3A56%3A16Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-03-12T14%3A02%3A08Z&ske=2024-03-13T14%3A02%3A08Z&sks=b&skv=2021-08-06&sig=cABEopLXXcsvniSdBEuG3dsh4vkLo7DvY%2BGGl4VMipc%3D'
    const givenUrl = args.input.imageUrl;

    const url = new URL(givenUrl);

    // Use path.basename to get the filename with extension from the pathname
    const filename = path.basename(url.pathname);

    // Splitting the filename to get the name and extension separately
    const fileExtension = path.extname(filename);

    // Getting the rsct parameter value
    const contentType = url.searchParams.get('rsct');
    return { fileExtension, contentType };
  } else {
    // https://images.unsplash.com/photo-1563473213013-de2a0133c100?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NjY3MDJ8MHwxfGFsbHwyfHx8fHx8MXx8MTcxMDI2ODUxNnw&ixlib=rb-4.0.3&q=80&w=400
    const givenUrl = args.input.imageUrl;

    const url = new URL(givenUrl);

    // Splitting the filename to get the name and extension separately
    const fileExtension = url.searchParams.get('fm');

    return { fileExtension: fileExtension, contentType: mime.lookup(fileExtension!) };
  }
}

export async function POST(req: NextRequest) {
  const args: MutationUploadImageFromUrlToS3Args = await req.json();
  try {
    const spaceById = await getSpaceById(args.spaceId);

    await checkEditSpacePermission(spaceById, req);
    const { fileExtension, contentType } = getFileExtensionAndContentType(args);
    if (!contentType) {
      throw new Error(`No content type found for image  -  ${JSON.stringify({ ...args.input })}`);
    }
    const imageResp = await axios({
      method: 'get',
      url: args.input.imageUrl,
      responseType: 'stream',
    });

    const filePath = `/tmp/${uuid()}.pdf`;

    // Create a promise to handle the asynchronous file write operation
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      imageResp.data.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const file = fs.readFileSync(filePath);

    const name = args.input.name;
    const signedUrl = await presignedUrlCreator.createSignedUrl(spaceById.id, {
      ...args.input,
      name: name.includes('.') ? name : name + '.' + fileExtension,
      imageType: args.input.imageType,
      contentType: contentType,
    });

    await axios.put(signedUrl, file, {
      headers: { 'Content-Type': contentType },
    });

    return NextResponse.json({ imageUrl: getUploadedImageUrlFromSingedUrl(signedUrl) }, { status: 200 });
  } catch (e) {
    await logError((e as any)?.response?.data || 'Error in createSignedUrlMutation', {}, e as any, null, null);
    throw e;
  }
}
