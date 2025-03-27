'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ImportantMetricsReport from '@/components/ticker-reports/ImportantMetricsReport';
import PerformanceChecklistEvaluation from '@/components/ticker-reports/PerformanceChecklistEvaluation';
import DebugCriterionReport from '@/components/ticker/debug/DebugCriterionReport';
import WebhookUrlInput, { getWebhookUrlFromLocalStorage } from '@/components/ticker/debug/WebhookUrlInput';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getGicsNames } from '@/lib/gicsHelper';
import { getCriteriaByIds } from '@/lib/industryGroupCriteria';
import { CriterionDefinition, IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { FullCriterionEvaluation, FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import { CreateAllCriterionReportsRequest, CreateSingleCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { useCallback, useEffect, useState } from 'react';
import { ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import ReloadingData from '@/components/ui/ReloadingData';

interface CriterionDebugPageProps {
  ticker: string;
  criterionKey: string;
}

export default function CriterionDebugPage({ ticker, criterionKey }: CriterionDebugPageProps) {
  const [industryGroupCriteria, setIndustryGroupCriteria] = useState<IndustryGroupCriteriaDefinition | null>(null);
  const [showCriterionConfirmModal, setShowCriterionConfirmModal] = useState(false);
  const [showSectionConfirmModal, setShowSectionConfirmModal] = useState(false);
  const [selectedSectionForRegeneration, setSelectedSectionForRegeneration] = useState<{
    section: string;
    reportKey?: string;
  } | null>(null);

  /**
   * 1. Fetch the Ticker’s entire report
   */
  const {
    data: tickerReport,
    error: tickerReportError,
    loading: tickerReportLoading,
    reFetchData: reFetchTickerReport,
  } = useFetchData<FullNestedTickerReport>(`${getBaseUrl()}/api/tickers/${ticker}`, { cache: 'no-cache' }, 'Failed to fetch ticker data');

  const fetchIndustryGroupCriteria = async (sectorId: number, industryGroupId: number) => {
    const industryGroupCriteria = await getCriteriaByIds(sectorId, industryGroupId);
    setIndustryGroupCriteria(industryGroupCriteria);
  };

  useEffect(() => {
    if (tickerReport?.sectorId && tickerReport?.industryGroupId) {
      fetchIndustryGroupCriteria(tickerReport.sectorId, tickerReport.industryGroupId);
    }
  }, [tickerReport]);

  // Hooks for re-generation
  const {
    data: allSingleCriterionReportsResponse,
    postData: regenerateAllSingleCriterionReports,
    loading: allSingleCriterionReportsLoading,
    error: allSingleCriterionReportsError,
  } = usePostData<{ message: string }, CreateAllCriterionReportsRequest>({
    errorMessage: 'Failed to regenerate criterion reports',
    successMessage: 'Criterion regeneration started successfully',
    redirectPath: ``,
  });

  const {
    data: singleCriterionReportsResponse,
    postData: regenerateSingleCriterionReports,
    loading: singleCriterionReportsLoading,
    error: singleCriterionReportsError,
  } = usePostData<{ message: string }, CreateSingleCriterionReportRequest>({
    errorMessage: 'Failed to regenerate criterion reports',
    successMessage: 'Criterion regeneration started successfully',
    redirectPath: ``,
  });

  const handleRegenerateAllSingleCriterionReports = useCallback(async () => {
    if (!tickerReport || !criterionKey) return;
    await regenerateAllSingleCriterionReports(`${getBaseUrl()}/api/actions/tickers/${ticker}/criterion/${criterionKey}/trigger-all-criterion-reports`, {
      langflowWebhookUrl: getWebhookUrlFromLocalStorage(tickerReport.sectorId, tickerReport.industryGroupId, criterionKey)!,
    });
  }, [tickerReport, criterionKey, regenerateAllSingleCriterionReports, ticker]);

  const handleRegenerateSingleCriterionReports = useCallback(
    async (section: string, reportKey: string | undefined) => {
      if (!tickerReport || !criterionKey) return;

      // For "report" we pass `reportKey`, otherwise we pass section
      await regenerateSingleCriterionReports(`${getBaseUrl()}/api/actions/tickers/${ticker}/criterion/${criterionKey}/trigger-single-criterion-reports`, {
        langflowWebhookUrl: getWebhookUrlFromLocalStorage(tickerReport.sectorId, tickerReport.industryGroupId, criterionKey)!,
        reportKey: section === 'report' && reportKey ? reportKey : section,
      });

      await reFetchTickerReport();
    },
    [tickerReport, criterionKey, regenerateSingleCriterionReports, ticker]
  );

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Debug',
      href: `/public-equities/debug/`,
      current: false,
    },
    {
      name: 'Debug Tickers',
      href: `/public-equities/debug/tickers`,
      current: false,
    },
    {
      name: `Debug ${ticker}`,
      href: `/public-equities/debug/tickers/${ticker}`,
      current: false,
    },
    {
      name: `${criterionKey}`,
      href: `/public-equities/debug/tickers/${ticker}/${criterionKey}`,
      current: true,
    },
  ];

  const criterionDefinition = industryGroupCriteria?.criteria.find((c) => c.key === criterionKey);
  const criterionEvaluation = tickerReport?.evaluationsOfLatest10Q?.find((evaluationItem) => evaluationItem.criterionKey === criterionKey);

  const shouldPollPage =
    criterionEvaluation?.importantMetricsEvaluation?.status === ProcessingStatus.InProgress ||
    criterionEvaluation?.performanceChecklistEvaluation?.status === ProcessingStatus.InProgress ||
    criterionEvaluation?.reports?.some((r) => r.status === ProcessingStatus.InProgress);

  if (tickerReportLoading || !tickerReport || !industryGroupCriteria) {
    return (
      <PageWrapper>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <FullPageLoader />
      </PageWrapper>
    );
  }

  // If the user typed a criterionKey that does not exist
  if (!criterionDefinition) {
    return (
      <PageWrapper>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <div className="mt-8 text-red-500">Criterion Definition not found.</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <ReloadingData
        loadDataFn={reFetchTickerReport}
        needsLoading={!!shouldPollPage}
        reloadDurationInSec={20} // optional, defaults to 20
        message="Reloading In-progress reports ..."
      />

      <div className="mt-8">
        <h1 className="font-bold text-2xl mb-4">Debug: {criterionKey}</h1>

        <PrivateWrapper>
          <div className="mb-5 flex items-center space-x-5">
            {/* Webhook URL input (per-criterion) */}
            <WebhookUrlInput criterionDefinition={criterionDefinition} sectorId={tickerReport.sectorId} industryGroupId={tickerReport.industryGroupId} />

            {/* This is the "Regenerate (3m)" button for the entire criterion */}
            <Button
              disabled={allSingleCriterionReportsLoading}
              onClick={() => setShowCriterionConfirmModal(true)}
              loading={allSingleCriterionReportsLoading}
              className="w-48"
            >
              Regenerate (3m)
            </Button>
          </div>
        </PrivateWrapper>

        {/** Confirm modal for regenerating all (3 modules) */}
        {showCriterionConfirmModal && (
          <ConfirmationModal
            open={showCriterionConfirmModal}
            onClose={() => setShowCriterionConfirmModal(false)}
            onConfirm={async () => {
              await handleRegenerateAllSingleCriterionReports();
              setShowCriterionConfirmModal(false);
            }}
            title="Regenerate Criterion Reports"
            confirmationText={`Are you sure you want to regenerate reports for ${criterionKey}?`}
            askForTextInput={true}
          />
        )}

        <div className="mt-8">
          <div className="mb-8">
            <div className="flex">
              <h2 className="text-lg font-bold">Performance Checklist</h2>
              <PrivateWrapper>
                <IconButton
                  iconName={IconTypes.Reload}
                  primary
                  variant="outlined"
                  disabled={selectedSectionForRegeneration?.section === 'performanceChecklist' && singleCriterionReportsLoading}
                  onClick={() => {
                    setSelectedSectionForRegeneration({ section: 'performanceChecklist' });
                    setShowSectionConfirmModal(true);
                  }}
                  loading={selectedSectionForRegeneration?.section === 'performanceChecklist' && singleCriterionReportsLoading}
                  className="ml-2"
                />
              </PrivateWrapper>
            </div>

            <PerformanceChecklistEvaluation criterionEvaluation={criterionEvaluation || undefined} />
          </div>

          {/* Important Metrics */}
          <div className="mb-8">
            <div className="flex mb-4">
              <h2 className="text-lg font-bold">Important Metrics</h2>
              <PrivateWrapper>
                <IconButton
                  iconName={IconTypes.Reload}
                  primary
                  variant="outlined"
                  disabled={selectedSectionForRegeneration?.section === 'importantMetrics' && singleCriterionReportsLoading}
                  onClick={() => {
                    setSelectedSectionForRegeneration({ section: 'importantMetrics' });
                    setShowSectionConfirmModal(true);
                  }}
                  loading={selectedSectionForRegeneration?.section === 'importantMetrics' && singleCriterionReportsLoading}
                  className="ml-2"
                />
              </PrivateWrapper>
            </div>

            <ImportantMetricsReport criterionEvaluation={criterionEvaluation} showAllInformationUsed={true} />
          </div>

          {/* Reports */}
          <div className="mb-8">
            <h2 className="text-lg font-bold">Reports</h2>
            {/* We show each "reportDefinition" in the IndustryGroupCriteria to keep ordering/keys consistent */}
            {criterionDefinition.reports?.map((reportDef) => {
              const actualReportEval = criterionEvaluation?.reports?.find((r) => r.reportKey === reportDef.key);
              return (
                <div key={reportDef.key} className="my-4">
                  <DebugCriterionReport
                    tickerReport={tickerReport}
                    industryGroupCriteria={industryGroupCriteria}
                    criterionDefinition={criterionDefinition}
                    reportDefinition={reportDef}
                    report={actualReportEval}
                    onRegenerate={handleRegenerateSingleCriterionReports}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for section-specific regeneration */}
      {showSectionConfirmModal && selectedSectionForRegeneration && (
        <ConfirmationModal
          open={showSectionConfirmModal}
          onClose={() => setShowSectionConfirmModal(false)}
          onConfirm={async () => {
            await handleRegenerateSingleCriterionReports(selectedSectionForRegeneration.section, selectedSectionForRegeneration.reportKey);
            setShowSectionConfirmModal(false);
            await reFetchTickerReport();
          }}
          title="Regenerate Section"
          confirmationText={`Are you sure you want to regenerate ${
            selectedSectionForRegeneration.section === 'report' && selectedSectionForRegeneration.reportKey
              ? `report ${selectedSectionForRegeneration.reportKey}`
              : selectedSectionForRegeneration.section
          } for criterion ${criterionKey}?`}
          askForTextInput={true}
          confirming={singleCriterionReportsLoading}
          // disabled={singleCriterionReportsLoading}
        />
      )}
    </PageWrapper>
  );
}
