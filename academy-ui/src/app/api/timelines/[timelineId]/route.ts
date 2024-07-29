import { TimelineModel } from '@/app/api/helpers/deprecatedSchemas/models/timeline/TimelineModel';
import { MutationUpsertTimelineArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { slugify } from '@/app/api/helpers/space/slugify';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  const args: MutationUpsertTimelineArgs = await req.json();
  const spaceById = await getSpaceById(args.spaceId);

  await checkEditSpacePermission(spaceById, req);

  const timelineInput = args.input;

  const timelineObject: TimelineModel = {
    ...timelineInput,
    id: timelineInput.id || slugify(timelineInput.name),
    thumbnail: timelineInput.thumbnail || undefined,
  };
  const timeline = await prisma.timeline.upsert({
    where: {
      id: args.input.id!,
    },
    create: {
      spaceId: args.spaceId,
      ...timelineObject,
    },
    update: {
      ...timelineObject,
    },
  });
  return NextResponse.json({ status: 200, timeline });
}

export async function GET(req: NextRequest, { params: { timelineId } }: { params: { timelineId: string } }) {
  const timeline = await prisma.timeline.findUnique({
    where: {
      id: timelineId,
    },
  });

  return NextResponse.json({ status: 200, timeline });
}
