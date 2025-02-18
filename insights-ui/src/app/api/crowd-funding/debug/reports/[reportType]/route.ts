import { GetObjectCommand, ListObjectsV2Command, ListObjectsV2CommandInput, S3Client } from '@aws-sdk/client-s3';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { InsightsConstants } from '@/util/insights-constants';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: process.env.DEFAULT_REGION });

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function getProjects(): Promise<string[]> {
  const input: ListObjectsV2CommandInput = {
    Bucket: InsightsConstants.S3_BUCKET_NAME,
    Prefix: `${InsightsConstants.CROWDFUND_ANALYSIS_PREFIX}/`,
    Delimiter: '/',
  };

  const command = new ListObjectsV2Command(input);
  const response = await s3Client.send(command);

  return (
    response.CommonPrefixes?.map((commonPrefix) => commonPrefix.Prefix?.replace(`${InsightsConstants.CROWDFUND_ANALYSIS_PREFIX}/`, '').replace('/', '')).filter(
      (prefix): prefix is string => !!prefix
    ) || []
  );
}

async function getProjectReport(projectId: string, reportType: string): Promise<any | null> {
  const key = `${InsightsConstants.CROWDFUND_ANALYSIS_PREFIX}/${projectId}/agent-status.json`;

  try {
    const command = new GetObjectCommand({
      Bucket: InsightsConstants.S3_BUCKET_NAME,
      Key: key,
    });
    const response = await s3Client.send(command);

    const jsonContent = response.Body instanceof Readable ? await streamToString(response.Body) : await new Response(response.Body as ReadableStream).text();

    const projectData = JSON.parse(jsonContent);
    const reports = projectData.reports || {};

    return {
      projectId,
      report: reports[reportType] || null, // Only return the requested report type
    };
  } catch (error) {
    console.error(`Error fetching agent-status.json for ${projectId}:`, error);
    return { projectId, report: null }; // Return null if there's an error
  }
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ reportType: string }> }) {
  const { reportType } = await params;

  const projectIds = await getProjects();

  // Fetch reports sequentially to avoid rate limits
  const projectsWithReports = [];
  for (const projectId of projectIds) {
    const projectReport = await getProjectReport(projectId, reportType);
    projectsWithReports.push(projectReport);
  }

  return { projects: projectsWithReports };
}

export const GET = withErrorHandlingV2(getHandler);
