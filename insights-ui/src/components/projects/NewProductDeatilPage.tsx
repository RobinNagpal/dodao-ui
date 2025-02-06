import { ProjectDetails, SpiderGraph } from '@/types/project/project';
import RadarChart from '../ui/RadarChart';

interface ProjectDetailPageProps {
  projectId: string;
  initialProjectDetails: ProjectDetails;
  spiderGraph: SpiderGraph | null;
}

export default function NewProjectDetailPage({ projectId, initialProjectDetails, spiderGraph }: ProjectDetailPageProps) {
  return (
    <div className="py-24 sm:py-32 text-color">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto  lg:text-center">
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">{initialProjectDetails.name}</p>
          <>
            {spiderGraph && (
              <div className="max-w-lg mx-auto">
                <RadarChart data={spiderGraph} />
              </div>
            )}
            <div className="mt-6 border-t border-gray-100 text-left">
              <dl className="divide-y text-color">
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm/6 font-medium ">Crowd Funding Link</dt>
                  <dd className="mt-1 text-sm/6  sm:col-span-2 sm:mt-0">{initialProjectDetails.projectInfoInput.crowdFundingUrl}</dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm/6 font-medium ">Website Link</dt>
                  <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">{initialProjectDetails.projectInfoInput.websiteUrl}</dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm/6 font-medium ">SEC Filing Link</dt>
                  <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">{initialProjectDetails.projectInfoInput.secFilingUrl}</dd>
                </div>
                {initialProjectDetails.projectInfoInput.additionalUrls && (
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium ">Additional Links</dt>
                    {initialProjectDetails.projectInfoInput.additionalUrls.map((url, index) => (
                      <dd key={index} className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">
                        {url}
                      </dd>
                    ))}
                  </div>
                )}
              </dl>
            </div>
            <div className="mx-auto mt-16 sm:mt-20 lg:mt-24 text-left">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {spiderGraph &&
                  Object.entries(spiderGraph).map(([key, values]) => (
                    <div key={key} className="relative text-left">
                      <dt className="font-semibold">
                        <div className="absolute left-0 top-0 flex size-10 items-center justify-center heading-color rounded-lg">
                          {/* Placeholder for Icon (you can replace with actual icons) */}
                          <span aria-hidden="true" className="size-6">
                            📊
                          </span>
                        </div>
                        <div className="ml-6 text-xl">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</div>
                      </dt>
                      <dd className="text-color">
                        <ul className="list-disc mt-2">
                          {values.map((item, index) => (
                            <li key={index} className="mb-1 flex items-start">
                              <span className="mr-2">{item.score === 1 ? '✅' : '❌'}</span>
                              <span>{item.comment}</span>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          </>
        </div>
      </div>
    </div>
  );
}
