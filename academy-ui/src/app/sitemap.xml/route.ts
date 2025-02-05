import { CourseDetailsFragment, CourseFragment, CourseTopicFragment, GuideFragment, GuideSummaryFragment } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto, SpaceTypes } from '@/types/space/SpaceDto';
import { getSpaceBasedOnHostHeader } from '@/utils/space/getSpaceServerSide';
import { PredefinedSpaces } from '@dodao/web-core/src/utils/constants/constants';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
}

async function getAllGuidesWithSteps(host: string, spaceId: string) {
  const baseUrl = `http://${host}`;

  const response = await axios.get(`${baseUrl}/api/guide/guides`, {
    params: {
      spaceId,
    },
  });

  return response.data.guides as GuideSummaryFragment[];
}

async function getAllCourses(spaceId: string) {
  const coursesUrl = process.env.V2_API_SERVER_URL?.replace('/graphql', '') + `/${spaceId}/courses`;

  const response = await axios.get(coursesUrl);
  return response?.data as CourseDetailsFragment[];
}

async function getGuideUrlsForAcademy(host: string, spaceId: string): Promise<SiteMapUrl[]> {
  const allGuides: GuideSummaryFragment[] = await getAllGuidesWithSteps(host, spaceId);
  const urls: SiteMapUrl[] = [];
  for (const guide of allGuides) {
    urls.push({
      url: `/guides/view/${guide.id}/0`,
      changefreq: 'monthly',
      priority: 0.7,
    });
  }
  return urls;
}

async function getAllCourseKeys(host: string, spaceId: string) {
  const baseUrl = `http://${host}`;
  const response = await axios.get(`${baseUrl}/api/courses`, {
    params: { spaceId },
  });

  return response.data.courses as CourseFragment[];
}

async function getCourseDetails(host: string, spaceId: string, courseKey: string) {
  const baseUrl = `http://${host}`;
  const response = await axios.get(`${baseUrl}/api/courses/${courseKey}`, {
    params: { spaceId },
  });
  return response.data.course as CourseDetailsFragment;
}

async function getCourseUrlsForAcademy(host: string, space: SpaceWithIntegrationsDto): Promise<SiteMapUrl[]> {
  const courses = await getAllCourseKeys(host, space.id);
  const urls: SiteMapUrl[] = [];

  for (const course of courses) {
    urls.push({
      url: `/courses/view/${course.key}`,
      changefreq: 'weekly',
      priority: 0.8,
    });

    const detailedCourse = await getCourseDetails(host, space.id, course.key);

    for (const topic of detailedCourse.topics || []) {
      urls.push({
        url: `/courses/view/${detailedCourse.key}/${topic.key}`,
        changefreq: 'weekly',
        priority: 0.7,
      });

      for (const explanation of topic.explanations || []) {
        urls.push({
          url: `/courses/view/${detailedCourse.key}/${topic.key}/explanations/${explanation.key}`,
          changefreq: 'weekly',
          priority: 0.6,
        });
      }
    }
  }

  return urls;
}

async function getDoDAOSiteMapUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/home-section/dodao-io/products/tidbitshub', changefreq: 'weekly', priority: 0.8 },
    { url: '/home-section/dodao-io/products/academysites', changefreq: 'weekly', priority: 0.8 },
    { url: '/home-section/dodao-io/products/ai-crowdfunding-agent', changefreq: 'weekly', priority: 0.8 },
    { url: '/home-section/dodao-io/services/smart-contract', changefreq: 'monthly', priority: 0.7 },
    { url: '/home-section/dodao-io/services/blockchain-tooling', changefreq: 'monthly', priority: 0.7 },
    { url: '/home-section/dodao-io/services/defi-analytics', changefreq: 'monthly', priority: 0.7 },
    { url: '/home-section/dodao-io/services/custom-ai-agent-dev', changefreq: 'monthly', priority: 0.7 },
    { url: '/home-section/dodao-io/services/maintenance-support', changefreq: 'monthly', priority: 0.7 },
    { url: '/home-section/dodao-io/education/blockchain-bootcamp', changefreq: 'monthly', priority: 0.7 },
    { url: '/home-section/dodao-io/education/educational-content', changefreq: 'monthly', priority: 0.7 },
    { url: '/home-section/dodao-io/research/real-world-assets', changefreq: 'monthly', priority: 0.8 },
    { url: '/home-section/dodao-io/research/decen-sol-reviews', changefreq: 'monthly', priority: 0.6 },
    { url: '/home-section/dodao-io/research/credit-union', changefreq: 'monthly', priority: 0.6 },
    { url: 'https://publications.dodao.io/dodao-engaging-gen-z-website', changefreq: 'yearly', priority: 0.5 },
  ];

  return urls;
}

async function writeDoDAOSiteMapToStream(space: SpaceWithIntegrationsDto, host: string, smStream: SitemapStream) {
  const dodaoUrls = await getDoDAOSiteMapUrls();
  for (const url of dodaoUrls) {
    smStream.write(url);
  }
}

async function getTidbitsHubSiteMapUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [{ url: '/', changefreq: 'daily', priority: 1.0 }];

  return urls;
}

async function writeTidbitsHubSiteMapToStream(space: SpaceWithIntegrationsDto, host: string, smStream: SitemapStream) {
  const dodaoUrls = await getTidbitsHubSiteMapUrls();
  for (const url of dodaoUrls) {
    smStream.write(url);
  }
}

async function writeUrlsToStream(space: SpaceWithIntegrationsDto, host: string, smStream: SitemapStream) {
  const guideUrls = await getGuideUrlsForAcademy(host, space.id);

  for (const guideUrl of guideUrls) {
    smStream.write(guideUrl);
  }

  const courseUrls = await getCourseUrlsForAcademy(host, space);
  for (const courseUrl of courseUrls) {
    smStream.write(courseUrl);
  }
}

async function GET(req: NextRequest): Promise<NextResponse<Buffer>> {
  const host = req.headers.get('host') as string;
  const space = (await getSpaceBasedOnHostHeader(req.headers))!;

  const smStream = new SitemapStream({ hostname: 'https://' + host });

  if (space.id === PredefinedSpaces.DODAO_HOME) {
    await writeDoDAOSiteMapToStream(space, host, smStream);
  }
  if (space.id === PredefinedSpaces.TIDBITS_HUB) {
    await writeTidbitsHubSiteMapToStream(space, host, smStream);
  }
  if (space.type === SpaceTypes.AcademySite) {
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 }), smStream.write({ url: '/guides', changefreq: 'weekly', priority: 0.9 });
    smStream.write({ url: '/tidbit-collections', changefreq: 'weekly', priority: 0.9 });
    smStream.write({ url: '/clickable-demos', changefreq: 'weekly', priority: 0.9 });
    smStream.write({ url: '/courses', changefreq: 'weekly', priority: 0.9 });
    await writeUrlsToStream(space, host, smStream);
  }

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
