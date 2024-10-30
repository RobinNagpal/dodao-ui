import { CourseDetailsFragment, CourseTopicFragment, GuideFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { getSpaceBasedOnHostHeader } from '@/utils/space/getSpaceServerSide';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import { PredefinedSpaces } from '@dodao/web-core/src/utils/constants/constants';

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

async function getDoDAOSiteMapUrls(spaceId: string): Promise<SiteMapUrl[]> {
  if (spaceId === PredefinedSpaces.DODAO_HOME) {
    const urls: SiteMapUrl[] = [
      { url: '/', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/products/tidbitshub', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/products/academysites', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/products/decen-reviews', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/services/smart-contract', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/services/blockchain-tooling', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/services/defi-analytics', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/services/risk-analysis', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/services/ai-llm-dev', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/education/blockchain-bootcamp', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/education/educational-content', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/research/real-world-assets', changefreq: 'weekly' },
      { url: '/home-section/dodao-io/research/decen-sol-reviews', changefreq: 'weekly' },
    ];

    return urls;
  }

  return [];
}

async function writeDoDAOSiteMapToStream(space: SpaceWithIntegrationsFragment, host: string, smStream: SitemapStream) {
  if (space.id === PredefinedSpaces.DODAO_HOME) {
    const dodaoUrls = await getDoDAOSiteMapUrls(space.id);
    for (const url of dodaoUrls) {
      smStream.write(url);
    }
  }
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
  // await writeUrlsToStream(space!, host, smStream);
  await writeDoDAOSiteMapToStream(space, host, smStream);

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
