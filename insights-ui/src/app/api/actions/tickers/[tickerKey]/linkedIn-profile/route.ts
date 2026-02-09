import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { LinkedinProfile } from '@/types/public-equity/ticker-report-types';
import { getTodayDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { invokePrompt } from '@/util/run-prompt';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';
import fetch from 'node-fetch';

interface SingleMemberInfo {
  name: string;
  position: string;
}

interface TickerTeamInfo {
  members: SingleMemberInfo[];
}

const saveTeamLinkedInProfilesForTicker = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> => {
  const { tickerKey } = await params;

  const existingTicker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });

  if (!existingTicker) {
    throw new Error(`Ticker not found for key: ${tickerKey}`);
  }

  const inputJson = {
    tickerKey: existingTicker.tickerKey,
    companyName: existingTicker.companyName,
    shortDescription: existingTicker.shortDescription,
    referenceDate: getTodayDateAsMonthDDYYYYFormat(),
  };

  const aboutTickerTeamString = await invokePrompt('US/public-equities/real-estate/equity-reits/ticker-team-info', inputJson);
  const teamInfo = JSON.parse(aboutTickerTeamString) as TickerTeamInfo;

  console.log('search preview result: ', JSON.stringify(teamInfo, null, 2));

  // for each team member, call your Python backend
  const pythonBackendBaseUrl = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || 'https://ai-insights.dodao.io';
  const endpoint = `${pythonBackendBaseUrl}/api/public-equities/US/get-linkedIn-profile`;

  const profilesOrNull = await Promise.all(
    teamInfo.members.map(async ({ name, position }) => {
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            position,
            company_name: existingTicker.companyName,
          }),
        });
        const json = (await resp.json()) as { message?: string; data?: any };

        if (!resp.ok) {
          console.warn(`Skipping LinkedIn fetch for ${name}: ${json.message || resp.statusText}`);
          return null;
        }

        return keysToCamel<LinkedinProfile>(json.data);
      } catch (err) {
        console.error(`Error fetching LinkedIn for ${name}:`, err);
        return null;
      }
    })
  );

  // 2) filter out the nulls
  const profiles = profilesOrNull.filter((p): p is LinkedinProfile => p !== null);

  // 4) write the collected array into your Prisma JSON field
  const updatedTicker = await prisma.ticker.update({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    data: {
      managementTeam: profiles,
    },
  });

  return updatedTicker;
};

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, chr) => chr.toUpperCase());
}

function keysToCamel<T>(input: any): T {
  if (Array.isArray(input)) {
    return input.map((item) => keysToCamel(item)) as any;
  } else if (input !== null && typeof input === 'object') {
    return Object.entries(input).reduce((acc, [key, value]) => {
      (acc as any)[snakeToCamel(key)] = keysToCamel(value);
      return acc;
    }, {} as any) as T;
  }
  return input as T;
}

interface DeleteMemberBody {
  publicIdentifier: string;
}

const deleteTeamMember = async (req: NextRequest, { params }: { params: { tickerKey: string } }): Promise<Ticker> => {
  const { tickerKey } = params;
  const body = (await req.json()) as DeleteMemberBody;
  const { publicIdentifier } = body;

  // 1. Fetch existing ticker
  const existingTicker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });

  if (!existingTicker) {
    throw new Error(`Ticker not found for key: ${tickerKey}`);
  }

  // 2. Filter out the member to delete
  const oldTeam = (existingTicker.managementTeam as LinkedinProfile[]) || [];
  const newTeam = oldTeam.filter((m) => m.publicIdentifier !== publicIdentifier);

  const updatedTicker = await prisma.ticker.update({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    data: {
      managementTeam: newTeam,
    },
  });

  return updatedTicker;
};

interface AddMemberBody {
  name: string;
  position: string;
}

const addTeamMember = async (req: NextRequest, { params }: { params: { tickerKey: string } }): Promise<Ticker> => {
  const { tickerKey } = params;
  const { name, position } = (await req.json()) as AddMemberBody;

  const existingTicker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });
  if (!existingTicker) {
    throw new Error(`Ticker not found for key: ${tickerKey}`);
  }

  const pythonBackendBaseUrl = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || 'https://ai-insights.dodao.io';
  const endpoint = `${pythonBackendBaseUrl}/api/public-equities/US/get-linkedIn-profile`;

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      position,
      company_name: existingTicker.companyName,
    }),
  });
  const payload = (await resp.json()) as { data?: any };

  if (!resp.ok || !payload.data) {
    throw new Error(`Could not find LinkedIn profile for "${name}" at "${endpoint}"`);
  }

  const newProfile = keysToCamel<LinkedinProfile>(payload.data);

  const oldTeam = Array.isArray(existingTicker.managementTeam) ? (existingTicker.managementTeam as LinkedinProfile[]) : [];
  const updatedTeam = [...oldTeam, newProfile];

  const updatedTicker = await prisma.ticker.update({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    data: {
      managementTeam: updatedTeam,
    },
  });
  return updatedTicker;
};

export const POST = withErrorHandlingV2<Ticker>(saveTeamLinkedInProfilesForTicker);
export const DELETE = withErrorHandlingV2<Ticker>(deleteTeamMember);
export const PUT = withErrorHandlingV2<Ticker>(addTeamMember);
