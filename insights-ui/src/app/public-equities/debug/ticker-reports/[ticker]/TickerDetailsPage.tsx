'use client';

import { IndustryGroupCriteria } from '@/types/criteria/criteria';
import { CreateAllReportsRequest, CreateSingleReportsRequest, TickerReport } from '@/types/public-equity/ticker-report';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useEffect, useState } from 'react';

export default function TickerDetailsPage({ ticker }: { ticker: string }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reportExists, setReportExists] = useState(false);

  const checkReportExists = async () => {
    const response = await fetch(`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/${ticker}/latest-10q-report.json`);
    if (response.status === 200) {
      setReportExists(true);
    } else {
      setReportExists(false);
    }
  };
  useEffect(() => {
    checkReportExists();
  }, []);

  const { data: industryGroupCriteria } = useFetchData<IndustryGroupCriteria>(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json`,
    {},
    'Failed to fetch criteria data'
  );
  const {
    data: reponse,
    postData,
    loading,
    error,
  } = usePostData<{ message: string }, CreateSingleReportsRequest>({
    errorMessage: 'Failed to create ticker report',
    successMessage: 'Ticker report created successfully',
    redirectPath: `/public-equities/debug/ticker-reports/${ticker}`,
  });
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';

  const handleCreateSingleCriterionReport = async (criterionKey: string) => {
    postData(`${baseURL}/api/public-equities/US/upsert-ai-criteria`, {
      sectorId: 60,
      industryGroupId: 6010,
      ticker,
      criterionKey,
    });
  };

  return (
    <PageWrapper>
      <table className="border-2 w-full">
        <thead>
          <tr>
            <th className="border-2 px-2">Name</th>
            <th className="border-2 px-2">Value</th>
            <th className="border-2 px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-2 px-2">Ticker</td>
            <td className="border-2 px-2">{ticker}</td>
            <td className="border-2 px-2"></td>
          </tr>
          <tr>
            <td className="border-2 px-2">Ticker Report Url</td>
            <td className="border-2 px-2">
              <a href={`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/${ticker}/latest-10q-report.json`} target="_blank">
                {`/public-equities/US/${ticker}/latest-10q-report.json`}
              </a>
            </td>
            <td className="border-2 px-2">
              <IconButton
                iconName={IconTypes.PlusIcon}
                tooltip="Create Ticker Report"
                onClick={() => setShowConfirmModal(true)}
                disabled={loading}
                loading={loading}
                variant="text"
                removeBorder={true}
                className="link-color pointer-cursor"
              />
            </td>
          </tr>
          {industryGroupCriteria?.criteria?.map((item) => {
            return (
              <tr key={item.key}>
                <td className="border-2 px-2">
                  {item.key} - {item.name}
                </td>
                <td className="border-2 px-2">{item.shortDescription}</td>
                <td className="border-2 px-2">
                  <IconButton
                    iconName={IconTypes.Reload}
                    tooltip="Create Ticker Report"
                    onClick={() => handleCreateSingleCriterionReport(item.key)}
                    disabled={loading}
                    loading={loading}
                    variant="text"
                    removeBorder={true}
                    className="link-color pointer-cursor"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PageWrapper>
  );
}
