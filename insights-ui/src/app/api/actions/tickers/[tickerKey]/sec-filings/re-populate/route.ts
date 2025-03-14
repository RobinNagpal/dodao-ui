import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { SecFiling } from '@prisma/client';
import { NextRequest } from 'next/server';

const API_URL = 'https://4mbhgkl77s4gubn7i2rdcllbru0wzyxl.lambda-url.us-east-1.on.aws/all-filings-for-ticker';

interface Attachment {
  sequenceNumber: string;
  description: string;
  purpose: string | null;
  url: string;
  documentType: string;
}

interface SecFilingResponse {
  filingDate: string; // ISO date string (e.g. "2025-02-14")
  form: string;
  filingUrl: string;
  accessionNumber: string;
  periodOfReport: string;
  attachments: Attachment[];
}

interface ApiResponse {
  secFilings: SecFilingResponse[];
  hasMore: boolean;
}

/**
 * Calls the SEC filings API with the given ticker, page, and pageSize.
 */
async function fetchFilingsFromAPI(ticker: string, page: number, pageSize: number): Promise<ApiResponse> {
  const body = JSON.stringify({
    ticker,
    page,
    pageSize,
  });
  console.log('Calling API with body:', body);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const jsonResponse = (await response.json()) as ApiResponse;
  console.log('API response:', JSON.stringify(jsonResponse, null, 2));
  console.log('First filing data', jsonResponse.secFilings[0].filingDate);
  console.log('Has More', jsonResponse.hasMore);
  return jsonResponse;
}

/**
 * Fetches and saves all filings (with attachments) for the given ticker.
 *
 * For each filing from the API:
 *   - If it already exists, we update it by adding any missing attachments.
 *   - If it doesn’t exist, we create it.
 *
 * The loop continues until the API indicates no more filings are available.
 */
async function fetchAndSaveFilings(tickerKey: string, page: number): Promise<void> {
  console.log(`Fetching and saving filings for ${tickerKey}, page ${page}`);

  const existingCount = await prisma.secFiling.count({
    where: {
      tickerKey: {
        equals: tickerKey,
      },
    },
  });
  console.log(`Existing filings count for ${tickerKey}: ${existingCount}`);
  if (page === 0) {
    const { secFilings } = await fetchFilingsFromAPI(tickerKey, 0, 1);
    if (!secFilings || secFilings.length === 0) {
      console.log('No filings returned from API. Ending loop.');
      return;
    } else {
      const where = { accessionNumber: secFilings[0].accessionNumber, filingDate: secFilings[0].filingDate, form: secFilings[0].form };
      console.log('Checking if filings already populated', where);
      const isAlreadyPopulated = await prisma.secFiling.findFirst({
        where: {
          accessionNumber: secFilings[0].accessionNumber,
        },
      });
      console.log('Is already populated:', isAlreadyPopulated);
      if (isAlreadyPopulated) {
        console.log('Filings already populated. Ending loop.');
        return;
      }
    }
  }

  const { secFilings, hasMore } = await fetchFilingsFromAPI(tickerKey, page, 25);
  if (!secFilings || secFilings.length === 0) {
    console.log('No filings returned from API. Ending loop.');
    return;
  }

  const isAlreadyPresent = await prisma.secFiling.findFirst({
    where: {
      accessionNumber: {
        in: secFilings.map((f) => f.accessionNumber),
      },
    },
  });

  for (const secFiling of secFilings) {
    await prisma.secFiling.upsert({
      where: { accessionNumber: secFiling.accessionNumber },
      update: {},
      create: {
        tickerKey,
        filingDate: new Date(secFiling.filingDate),
        form: secFiling.form,
        filingUrl: secFiling.filingUrl,
        accessionNumber: secFiling.accessionNumber,
        periodOfReport: secFiling.periodOfReport,
        attachments: {
          create: secFiling.attachments.map((att) => ({
            sequenceNumber: att.sequenceNumber,
            description: att.description,
            purpose: att.purpose,
            url: att.url,
            documentType: att.documentType,
          })),
        },
      },
    });
  }

  if (isAlreadyPresent) {
    console.log('Filings already present. Ending loop.');
    return;
  }

  if (!hasMore) {
    console.log('No more filings available. Ending loop.');
    return;
  }

  return fetchAndSaveFilings(tickerKey, page + 1);
}

async function rePopulateSecFilings(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<SecFiling[]> {
  const { tickerKey } = await params;
  try {
    await fetchAndSaveFilings(tickerKey, 0);
    const listOfFilings = await prisma.secFiling.findMany({
      where: {
        tickerKey: {
          equals: tickerKey,
        },
      },
      orderBy: { filingDate: 'desc' },
    });
    console.log(`Returning ${listOfFilings.length} filings for ${tickerKey}`);
    return listOfFilings;
  } catch (e) {
    console.error('Error fetching and saving filings:');
    console.log((e as any).stack);
    throw e;
  }
}

export const POST = withErrorHandlingV2<SecFiling[]>(rePopulateSecFilings);
