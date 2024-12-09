import { withErrorHandlingV1 } from "@dodao/web-core/api/helpers/middlewares/withErrorHandling";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validateAdminKey } from "@/utils/auth/validateAdminKey";

async function putHandler(
  req: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
): Promise<NextResponse> {
  const { collectionId } = await params;
  
  const validationError = validateAdminKey(req);
  if (validationError) return validationError;

  try {
    const body = await req.json();
    const { name, description, handles, archive } = body;

    const updatedTweetCollection = await prisma.tweetCollection.update({
      where: { id: collectionId },
      data: {
        name,
        description,
        handles,
        archive,
      },
    });

    return NextResponse.json(updatedTweetCollection, { status: 200 });
  } catch (error) {
    console.error("Error updating tweet collection:", error);
    return NextResponse.json(
      { error: "Failed to update tweet collection." },
      { status: 500 }
    );
  }
}

export const PUT = withErrorHandlingV1(putHandler);
