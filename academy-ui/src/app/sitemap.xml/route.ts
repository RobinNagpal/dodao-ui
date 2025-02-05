import {
  CourseDetailsFragment,
  CourseFragment,
  CourseTopicFragment,
  GuideFragment,
  GuideSummaryFragment,
  ClickableDemo,
} from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto, SpaceTypes } from '@/types/space/SpaceDto';
import { getSpaceBasedOnHostHeader } from '@/utils/space/getSpaceServerSide';
import { PredefinedSpaces } from '@dodao/web-core/src/utils/constants/constants';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
}

async function getAllGuidesWithSteps(spaceId: string) {
  const baseUrl = getBaseUrl();

  const response = await axios.get(`${baseUrl}/api/guide/guides`, {
    params: {
      spaceId,
    },
  });

  return response.data.guides as GuideSummaryFragment[];
}

async function getClickableDemos(spaceId: string): Promise<ClickableDemo[]> {
  const baseUrl = getBaseUrl();

  const response = await axios.get(`${baseUrl}/api/clickable-demos`, {
    params: { spaceId },
  });

  return response.data.clickableDemos as ClickableDemo[];
}

async function getClickableDemoUrls(spaceId: string): Promise<SiteMapUrl[]> {
  const demos = await getClickableDemos(spaceId);
  const urls: SiteMapUrl[] = [];

  for (const demo of demos) {
    urls.push({
      url: `/clickable-demos/view/${demo.id}`,
      changefreq: 'weekly',
      priority: 0.8,
    });
  }

  return urls;
}

async function getGuideUrlsForAcademy(spaceId: string): Promise<SiteMapUrl[]> {
  const allGuides: GuideSummaryFragment[] = await getAllGuidesWithSteps(spaceId);
  const urls: SiteMapUrl[] = [];
  for (const guide of allGuides) {
    urls.push({
      url: `/guides/view/${guide.id}/0`,
      changefreq: 'monthly',
      priority: 0.8,
    });
  }
  return urls;
}

async function getAllCourseKeys(spaceId: string) {
  const baseUrl = getBaseUrl();
  const response = await axios.get(`${baseUrl}/api/courses`, {
    params: { spaceId },
  });

  return response.data.courses as CourseFragment[];
}

async function getCourseDetails(spaceId: string, courseKey: string) {
  const baseUrl = getBaseUrl();
  const response = await axios.get(`${baseUrl}/api/courses/${courseKey}`, {
    params: { spaceId },
  });
  return response.data.course as CourseDetailsFragment;
}

async function getCourseUrlsForAcademy(spaceId: string): Promise<SiteMapUrl[]> {
  const courses = await getAllCourseKeys(spaceId);
  const urls: SiteMapUrl[] = [];

  for (const course of courses) {
    urls.push({
      url: `/courses/view/${course.key}`,
      changefreq: 'weekly',
      priority: 0.8,
    });

    const detailedCourse = await getCourseDetails(spaceId, course.key);

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

async function writeDoDAOSiteMapToStream(smStream: SitemapStream) {
  const dodaoUrls = await getDoDAOSiteMapUrls();
  for (const url of dodaoUrls) {
    smStream.write(url);
  }
}

async function getTidbitsHubSiteMapUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [{ url: '/', changefreq: 'daily', priority: 1.0 }];

  return urls;
}

async function writeTidbitsHubSiteMapToStream(smStream: SitemapStream) {
  const dodaoUrls = await getTidbitsHubSiteMapUrls();
  for (const url of dodaoUrls) {
    smStream.write(url);
  }
}

async function getTidbitCollections(spaceId: string) {
  const baseUrl = getBaseUrl();
  const response = await axios.get(`${baseUrl}/api/${spaceId}/byte-collections`);
  return response.data;
}

async function getTidbitCollectionUrlsForAcademy(spaceId: string): Promise<SiteMapUrl[]> {
  const collections = await getTidbitCollections(spaceId);
  const urls: SiteMapUrl[] = [];

  for (const collection of collections) {
    for (const item of collection.items || []) {
      switch (item.type) {
        case ByteCollectionItemType.Byte:
          urls.push({
            url: `/tidbit-collections/view/${collection.id}/${item.byte.byteId}`,
            changefreq: 'weekly',
            priority: 0.7,
          });
          break;
      }
    }
  }

  return urls;
}

async function writeUrlsToStream(space: SpaceWithIntegrationsDto, host: string, smStream: SitemapStream) {
  const guideUrls = await getGuideUrlsForAcademy(space.id);
  for (const guideUrl of guideUrls) {
    smStream.write(guideUrl);
  }

  const courseUrls = await getCourseUrlsForAcademy(space.id);
  for (const courseUrl of courseUrls) {
    smStream.write(courseUrl);
  }

  const demoUrls = await getClickableDemoUrls(space.id);
  for (const demoUrl of demoUrls) {
    smStream.write(demoUrl);
  }

  const tidbitUrls = await getTidbitCollectionUrlsForAcademy(space.id);
  for (const tidbitUrl of tidbitUrls) {
    smStream.write(tidbitUrl);
  }
}

async function GET(req: NextRequest): Promise<NextResponse<Buffer>> {
  const host = req.headers.get('host') as string;
  const space = (await getSpaceBasedOnHostHeader(req.headers))!;

  const smStream = new SitemapStream({ hostname: 'https://' + host });

  if (space.id === PredefinedSpaces.DODAO_HOME) {
    await writeDoDAOSiteMapToStream(smStream);
  }
  if (space.id === PredefinedSpaces.TIDBITS_HUB) {
    await writeTidbitsHubSiteMapToStream(smStream);
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
