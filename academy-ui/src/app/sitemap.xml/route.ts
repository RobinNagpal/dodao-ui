import { CourseDetailsFragment, CourseTopicFragment, GuideFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { getSpaceBasedOnHostHeader } from '@/utils/space/getSpaceServerSide';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
}

async function getAllGuidesWithSteps(spaceId: string) {
  const guidesUrl = process.env.V2_API_SERVER_URL?.replace('/graphql', '') + `/${spaceId}/guides`;

  const response = await axios.get(guidesUrl);

  return response?.data as GuideFragment[];
}

async function getAllCourses(spaceId: string) {
  const coursesUrl = process.env.V2_API_SERVER_URL?.replace('/graphql', '') + `/${spaceId}/courses`;

  const response = await axios.get(coursesUrl);
  return response?.data as CourseDetailsFragment[];
}

async function getGuideUrlsForAcademy(spaceId: string): Promise<SiteMapUrl[]> {
  const allGuides: GuideFragment[] = await getAllGuidesWithSteps(spaceId);
  const urls: SiteMapUrl[] = [];
  for (const guide of allGuides) {
    guide.steps.forEach((s, index) => {
      if (s.content.length > 50) {
        const sitemapUrl = {
          url: `/guides/view/${guide.uuid}/${index}`,
          changefreq: 'weekly',
        };
        urls.push(sitemapUrl);
      }
    });
  }
  return urls;
}

async function getCourseUrlsForAcademy(space: SpaceWithIntegrationsFragment): Promise<SiteMapUrl[]> {
  const gitCourses: CourseDetailsFragment[] = await getAllCourses(space.id);

  const urls: SiteMapUrl[] = [];
  (gitCourses || []).forEach((course: CourseDetailsFragment) => {
    urls.push({ url: `/courses/view/${course.key}`, changefreq: 'weekly' });

    course.topics.forEach((topic: CourseTopicFragment) => {
      urls.push({ url: `/courses/view/${course.key}/${topic.key}`, changefreq: 'weekly' });

      (topic.explanations || []).forEach((explanation) => {
        urls.push({
          url: `/courses/view/${course.key}/${topic.key}/explanation/${explanation.key}`,
          changefreq: 'weekly',
        });
      });
    });
  });
  return urls;
}

async function writeUrlsToStream(space: SpaceWithIntegrationsFragment, host: string, smStream: SitemapStream) {
  const guideUrls = await getGuideUrlsForAcademy(space.id);

  for (const guideUrl of guideUrls) {
    smStream.write(guideUrl);
  }

  const courseUrls = await getCourseUrlsForAcademy(space);

  for (const courseUrl of courseUrls) {
    smStream.write(courseUrl);
  }
}
async function GET(req: NextRequest, res: NextResponse) {
  const host = req.headers.get('host') as string;
  const space = await getSpaceBasedOnHostHeader(req.headers);

  if (!space) {
    return new NextResponse(`Space Not found`, { status: 500 });
  }

  const smStream = new SitemapStream({ hostname: 'https://' + host });

  // pipe your entries or directly write them.
  await writeUrlsToStream(space!, host, smStream);

  smStream.end();
  // cache the response
  const response: Buffer = await streamToPromise(smStream);

  return new NextResponse(response, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

export { GET };
