import { withErrorHandlingV1 } from "@dodao/web-core/api/helpers/middlewares/withErrorHandling";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validateAdminKey } from "@/utils/auth/validateAdminKey";

async function putHandler(
  req: NextRequest,
  { params }: { params: Promise<{ tweetId: string }> }
): Promise<NextResponse> {
  const { tweetId } = await params;
  
  const validationError = validateAdminKey(req);
  if (validationError) return validationError;
  
  try {
    const body = await req.json();
    const { archive } = body;

    await prisma.tweet.update({
      where: { id: tweetId },
      data: {
        archive,
      },
    });

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error updating tweet:", error);
    return NextResponse.json(
      { error: "Failed to update tweet." },
      { status: 500 }
    );
  }
}

export const PUT = withErrorHandlingV1(putHandler);
