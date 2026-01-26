import { CourseDetailsFragment, CourseFragment, GuideSummaryFragment, ClickableDemo, Timeline } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto, SpaceTypes } from '@/types/space/SpaceDto';
import { getSpaceBasedOnHostHeader } from '@/utils/space/getSpaceServerSide';
import { PredefinedSpaces } from '@dodao/web-core/utils/constants/constants';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getFeaturesArray } from '@/utils/features';
import { FeatureName } from '@dodao/web-core/types/features/spaceFeatures';

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

async function writeTidbitsSiteUrlsToStream(space: SpaceWithIntegrationsDto, smStream: SitemapStream) {
  const demoUrls = await getClickableDemoUrls(space.id);
  for (const demoUrl of demoUrls) {
    smStream.write(demoUrl);
  }

  const tidbitUrls = await getTidbitCollectionUrlsForAcademy(space.id);
  for (const tidbitUrl of tidbitUrls) {
    smStream.write(tidbitUrl);
  }
}

async function writeGuidesUrls(spaceId: string, smStream: SitemapStream) {
  smStream.write({ url: '/guides', changefreq: 'weekly', priority: 0.9 });

  const allGuides: GuideSummaryFragment[] = await getAllGuidesWithSteps(spaceId);
  for (const guide of allGuides) {
    smStream.write({
      url: `/guides/view/${guide.id}/0`,
      changefreq: 'monthly',
      priority: 0.8,
    });
  }
}

async function writeCoursesUrls(spaceId: string, smStream: SitemapStream) {
  smStream.write({ url: '/courses', changefreq: 'weekly', priority: 0.9 });

  const courses = await getAllCourseKeys(spaceId);
  for (const course of courses) {
    smStream.write({
      url: `/courses/view/${course.key}`,
      changefreq: 'weekly',
      priority: 0.8,
    });

    const detailedCourse = await getCourseDetails(spaceId, course.key);
    for (const topic of detailedCourse.topics || []) {
      smStream.write({
        url: `/courses/view/${detailedCourse.key}/${topic.key}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
      for (const explanation of topic.explanations || []) {
        smStream.write({
          url: `/courses/view/${detailedCourse.key}/${topic.key}/explanations/${explanation.key}`,
          changefreq: 'weekly',
          priority: 0.6,
        });
      }
    }
  }
}

async function writeTidbitUrls(spaceId: string, smStream: SitemapStream) {
  smStream.write({ url: '/tidbit-collections', changefreq: 'weekly', priority: 0.9 });

  const collections = await getTidbitCollections(spaceId);
  for (const collection of collections) {
    for (const item of collection.items || []) {
      if (item.type === ByteCollectionItemType.Byte) {
        smStream.write({
          url: `/tidbit-collections/view/${collection.id}/${item.byte.byteId}`,
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
    }
  }
}

async function writeClickableDemoUrls(spaceId: string, smStream: SitemapStream) {
  smStream.write({ url: '/clickable-demos', changefreq: 'weekly', priority: 0.9 });

  const demos = await getClickableDemos(spaceId);
  for (const demo of demos) {
    smStream.write({
      url: `/clickable-demos/view/${demo.id}`,
      changefreq: 'weekly',
      priority: 0.8,
    });
  }
}

async function writeTimelinesUrls(spaceId: string, smStream: SitemapStream) {
  smStream.write({ url: '/timelines', changefreq: 'weekly', priority: 0.9 });

  const baseUrl = getBaseUrl();
  const { data } = await axios.get(`${baseUrl}/api/timelines`, {
    params: { spaceId },
  });

  const timelines = data?.timelines as Timeline[];
  if (!timelines?.length) {
    return;
  }

  for (const timeline of timelines) {
    smStream.write({
      url: `/timelines/view/${timeline.id}`,
      changefreq: 'weekly',
      priority: 0.8,
    });
  }
}

async function GET(req: NextRequest): Promise<NextResponse<Buffer>> {
  const host = req.headers.get('host') as string;
  const space = (await getSpaceBasedOnHostHeader(req.headers))!;

  const smStream = new SitemapStream({ hostname: 'https://' + host });

  if (space.id === PredefinedSpaces.DODAO_HOME) {
    await writeDoDAOSiteMapToStream(smStream);
  } else if (space.id === PredefinedSpaces.TIDBITS_HUB) {
    await writeTidbitsHubSiteMapToStream(smStream);
  } else if (space.type === SpaceTypes.AcademySite) {
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    const features = getFeaturesArray(space.id);
    for (const feature of features) {
      if (!feature.enabled) continue;
      switch (feature.featureName) {
        case FeatureName.Guides:
          await writeGuidesUrls(space.id, smStream);
          break;
        case FeatureName.Courses:
          await writeCoursesUrls(space.id, smStream);
          break;
        case FeatureName.ByteCollections:
          await writeTidbitUrls(space.id, smStream);
          break;
        case FeatureName.ClickableDemos:
          await writeClickableDemoUrls(space.id, smStream);
          break;
        case FeatureName.Timelines:
          await writeTimelinesUrls(space.id, smStream);
          break;
      }
    }
  } else if (space.type === SpaceTypes.TidbitsSite) {
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 }), await writeTidbitsSiteUrlsToStream(space, smStream);
  } else {
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
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
