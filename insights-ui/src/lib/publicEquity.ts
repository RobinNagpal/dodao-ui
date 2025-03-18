// lib/publicEquity.ts
import { getCriteriaReportDefinition } from '@/lib/industryGroupCriteria';
import { getCriterionPerformanceChecklistKey, getTickerFileKey, uploadToS3 } from '@/lib/koalagainsS3Utils';
import { prisma } from '@/prisma';
import { PerformanceChecklistItem, TickerReport } from '@/types/public-equity/ticker-report-types';
import { CriterionEvaluation } from '@prisma/client';
import fetch from 'node-fetch'; // or use the native fetch if available in your Node version
// --- Ticker Report Functions ---

export async function getTickerReport(ticker: string): Promise<TickerReport> {
  return await prisma.ticker.findUniqueOrThrow({ where: { tickerKey: ticker } });
}

export async function saveCriteriaEvaluation(ticker: string, criterionKey: string, reportKey: string, data: string): Promise<CriterionEvaluation> {
  const report = await getTickerReport(ticker);
  const reportDefinition = await getCriteriaReportDefinition(report.sectorId, report.industryGroupId, criterionKey, reportKey);

  const reportData = {
    textData: reportDefinition.outputType === 'Text' ? data : undefined,
    jsonData: reportDefinition.outputType !== 'Text' ? data : undefined,
  };

  const criterionEvaluation = await prisma.criterionEvaluation.upsert({
    where: {
      tickerKey_criterionKey: {
        tickerKey: ticker,
        criterionKey,
      },
    },
    create: {
      tickerKey: ticker,
      criterionKey,
      reports: {
        createMany: {
          data: [{ reportKey, createdBy: 'system', createdAt: new Date(), tickerKey: ticker, criterionKey, ...reportData, status: 'Completed' }],
        },
      },
    },
    update: {
      reports: {
        upsert: {
          where: {
            tickerKey_criterionKey_reportKey: {
              tickerKey: ticker,
              criterionKey,
              reportKey,
            },
          },
          create: {
            reportKey,
            createdBy: 'system',
            createdAt: new Date(),
            tickerKey: ticker,
            criterionKey,
            ...reportData,
            status: 'Completed',
          },
          update: {
            ...reportData,
            status: 'Completed',
          },
        },
      },
    },
  });

  return criterionEvaluation;
}

export async function savePerformanceChecklist(ticker: string, criterionKey: string, checklist: PerformanceChecklistItem[]): Promise<string> {
  const fileKey = getCriterionPerformanceChecklistKey(ticker, criterionKey);
  const checklistJson = JSON.stringify(
    checklist.map((item) => ({ ...item })),
    null,
    2
  );
  return await uploadToS3(checklistJson, fileKey, 'application/json');
}

export async function triggerCriteriaMatching(ticker: string, force: boolean): Promise<string> {
  const criteriaMatches = await prisma.criteriaMatchesOfLatest10Q.findUnique({
    where: {
      tickerKey: ticker,
    },
  });

  if (!force && criteriaMatches?.status === 'Completed') {
    return `Criteria matching already done for ${ticker}`;
  }
  prisma.criteriaMatchesOfLatest10Q.upsert({
    where: {
      tickerKey: ticker,
    },
    create: {
      tickerKey: ticker,
      status: 'InProgress',
    },
    update: {
      status: 'InProgress',
    },
  });
  const url = 'https://4mbhgkl77s4gubn7i2rdcllbru0wzyxl.lambda-url.us-east-1.on.aws/populate-criteria-matches';
  const payload = { ticker };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await response.text();
}

export const saveTickerReport = async (ticker: string, report: TickerReport): Promise<void> => {
  prisma.ticker.upsert({
    where: {
      tickerKey: ticker,
    },
    create: {
      ...report,
      tickerKey: ticker,
    },
    update: {
      ...report,
    },
  });
};
