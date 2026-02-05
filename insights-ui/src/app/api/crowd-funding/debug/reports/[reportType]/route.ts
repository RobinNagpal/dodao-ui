import { ProjectDetails } from '@/types/project/project';
import { ProjectInfoAndReport } from '@/types/project/report';
import { InsightsConstants } from '@/util/insights-constants';
import { GetObjectCommand, ListObjectsV2Command, ListObjectsV2CommandInput, S3Client } from '@aws-sdk/client-s3';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { Readable } from 'stream';

const s3Client = new S3Client({
  region: process.env.DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

async function getProjectReport(projectId: string, reportType: string): Promise<ProjectInfoAndReport> {
  const key = `${InsightsConstants.CROWDFUND_ANALYSIS_PREFIX}/${projectId}/agent-status.json`;

  const command = new GetObjectCommand({
    Bucket: InsightsConstants.S3_BUCKET_NAME,
    Key: key,
  });
  const response = await s3Client.send(command);

  const jsonContent = response.Body instanceof Readable ? await streamToString(response.Body) : await new Response(response.Body as ReadableStream).text();

  const projectData = JSON.parse(jsonContent) as ProjectDetails;
  const reports = projectData.reports;

  return {
    projectId,
    projectInfo: projectData.projectInfoInput,
    report: reports?.[reportType],
  };
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ reportType: string }> }) {
  const { reportType } = await params;

  const projectIds = await getProjects();

  // Fetch reports sequentially to avoid rate limits
  const projectsWithReports: ProjectInfoAndReport[] = [];
  for (const projectId of projectIds) {
    const projectReport = await getProjectReport(projectId, reportType);
    projectsWithReports.push(projectReport);
  }

  return projectsWithReports;
}

export const GET = withErrorHandlingV2<ProjectInfoAndReport[]>(getHandler);
