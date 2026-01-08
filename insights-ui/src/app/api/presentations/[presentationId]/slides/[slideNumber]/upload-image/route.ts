import { NextRequest } from 'next/server';
import { getPresentationsPrefix, uploadFileToS3, getJsonFromS3, putJsonToS3, getBucketName } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { UploadImageResponse } from '@/types/presentation/presentation-types';

type SlideParams = { params: Promise<{ presentationId: string; slideNumber: string }> };

/**
 * POST /api/presentations/[presentationId]/slides/[slideNumber]/upload-image
 * Upload a custom image for a slide
 */
async function postHandler(req: NextRequest, { params }: SlideParams): Promise<UploadImageResponse> {
  const { presentationId, slideNumber } = await params;

  const formData = await req.formData();
  const file = formData.get('image') as File | null;

  if (!file) {
    throw new Error('No image file provided');
  }

  // Validate file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Supported: PNG, JPEG, WebP, GIF');
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate the S3 key for the uploaded image
  const extension = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
  const imageKey = `${getPresentationsPrefix()}/${presentationId}/output/${slideNumber}-slide/uploaded-slide-image.${extension}`;

  try {
    // Upload the image to S3
    const imageUrl = await uploadFileToS3(imageKey, buffer, file.type);

    // Update render metadata to mark image as uploaded
    const metadataKey = `${getPresentationsPrefix()}/${presentationId}/output/${slideNumber}-slide/render-metadata.json`;
    const existingMetadata = (await getJsonFromS3(metadataKey).catch(() => ({}))) || {};

    const updatedMetadata = {
      ...existingMetadata,
      image: {
        renderId: 'uploaded',
        status: 'completed',
        url: imageUrl,
        uploadedAt: new Date().toISOString(),
        isUploaded: true,
      },
    };

    await putJsonToS3(metadataKey, updatedMetadata);

    return {
      success: true,
      presentationId,
      slideNumber,
      imageUrl,
      message: 'Image uploaded successfully',
    };
  } catch (error: any) {
    console.error('Failed to upload image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
}

export const POST = withErrorHandlingV2<UploadImageResponse>(postHandler);
