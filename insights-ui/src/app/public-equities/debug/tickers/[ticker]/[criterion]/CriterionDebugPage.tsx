'use client';

import { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { FullNestedTickerReport, FullCriterionEvaluation } from '@/types/public-equity/ticker-report-types';
import { IndustryGroupCriteriaDefinition, CriterionDefinition } from '@/types/public-equity/criteria-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getGicsNames } from '@/lib/gicsHelper';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { CreateAllCriterionReportsRequest, CreateSingleCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import WebhookUrlInput, { getWebhookUrlFromLocalStorage } from '@/components/ticker/debug/WebhookUrlInput';
import DebugCriterionReport from '@/components/ticker/debug/DebugCriterionReport';

interface CriterionDebugPageProps {
  ticker: string;
  criterionKey: string;
}

export default function CriterionDebugPage({ ticker, criterionKey }: CriterionDebugPageProps) {
  const [reportExists, setReportExists] = useState(false);
  const [report, setReport] = useState<FullNestedTickerReport | null>(null);
  const [industryGroupCriteria, setIndustryGroupCriteria] = useState<IndustryGroupCriteriaDefinition | null>(null);
  const [criterionDefinition, setCriterionDefinition] = useState<CriterionDefinition | null>(null);
  const [criterionEvaluation, setCriterionEvaluation] = useState<FullCriterionEvaluation | null>(null);

  // Confirmation modal states
  const [showCriterionConfirmModal, setShowCriterionConfirmModal] = useState(false);
  const [showSectionConfirmModal, setShowSectionConfirmModal] = useState(false);
  const [selectedSectionForRegeneration, setSelectedSectionForRegeneration] = useState<{
    section: string;
    reportKey?: string;
  } | null>(null);

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

  // On mount, fetch the Ticker’s entire report and the sector’s custom criteria
  useEffect(() => {
    const checkReportExists = async () => {
      const response = await fetch(`${getBaseUrl()}/api/tickers/${ticker}`, {
        cache: 'no-cache',
      });
      if (response.status === 200) {
        setReportExists(true);
        const fetchedReport: FullNestedTickerReport = await response.json();
        setReport(fetchedReport);

        // Retrieve sectorName & industryGroupName
        const { sectorName, industryGroupName } = getGicsNames(fetchedReport.sectorId, fetchedReport.industryGroupId);

        // Then fetch custom criteria JSON for the ticker's sector/industry group
        const criteriaResponse = await fetch(
          `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/${slugify(sectorName)}/${slugify(
            industryGroupName
          )}/custom-criteria.json`,
          { cache: 'no-cache' }
        );

        if (criteriaResponse.status === 200) {
          const igCriteria: IndustryGroupCriteriaDefinition = await criteriaResponse.json();
          setIndustryGroupCriteria(igCriteria);

          // Now find the one criterionDefinition that matches the route param
          const cDef = igCriteria.criteria?.find((c) => c.key === criterionKey) || null;
          setCriterionDefinition(cDef);

          // Also get the actual ticker's evaluation of that criterion
          // The array is `evaluationsOfLatest10Q`, which are FullCriterionEvaluation
          const evaluationOfLatest10QMap =
            fetchedReport.evaluationsOfLatest10Q && Object.fromEntries(fetchedReport.evaluationsOfLatest10Q.map((crit) => [crit.criterionKey, crit]));

          // Grab the specific evaluation object
          const cEval = (evaluationOfLatest10QMap && evaluationOfLatest10QMap[criterionKey]) || null;

          setCriterionEvaluation(cEval);
        }
      } else {
        setReportExists(false);
      }
    };

    checkReportExists();
  }, [ticker, criterionKey]);

  // Button Handlers
  const handleRegenerateAllSingleCriterionReports = async () => {
    if (!report || !criterionKey) return;

    regenerateAllSingleCriterionReports(`${getBaseUrl()}/api/actions/tickers/${ticker}/criterion/${criterionKey}/trigger-all-criterion-reports`, {
      langflowWebhookUrl: getWebhookUrlFromLocalStorage(report.sectorId, report.industryGroupId, criterionKey)!,
    });
  };

  const handleRegenerateSingleCriterionReports = async (section: string, reportKey: string | undefined) => {
    if (!report || !criterionKey) return;

    // For "report" we pass `reportKey`, otherwise we pass section
    regenerateSingleCriterionReports(`${getBaseUrl()}/api/actions/tickers/${ticker}/criterion/${criterionKey}/trigger-single-criterion-reports`, {
      langflowWebhookUrl: getWebhookUrlFromLocalStorage(report.sectorId, report.industryGroupId, criterionKey)!,
      reportKey: section === 'report' && reportKey ? reportKey : section,
    });
  };

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

  // Render
  if (!reportExists || !report || !industryGroupCriteria) {
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
        <div className="mt-8 text-red-500">Criterion Key not found.</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {/* Single Criterion Debug UI */}
      <div className="mt-8">
        <h1 className="font-bold text-2xl mb-4">Debug: {criterionKey}</h1>

        <PrivateWrapper>
          <div className="mb-5 flex items-center space-x-5">
            {/* Webhook URL input (per-criterion) */}
            <WebhookUrlInput criterionDefinition={criterionDefinition} sectorId={report.sectorId} industryGroupId={report.industryGroupId} />

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

        {/* Now the actual displayed data for the single criterion */}
        {criterionEvaluation ? (
          <div className="mt-8">
            {/* Performance Checklist */}
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

              <div className="block-bg-color m-4 p-3">
                {criterionEvaluation.performanceChecklistEvaluation?.performanceChecklistItems?.length ? (
                  <ul className="list-disc pl-8">
                    {criterionEvaluation.performanceChecklistEvaluation.performanceChecklistItems.map((item, idx) => (
                      <li key={idx} className="mb-2">
                        <div>
                          {item.score === 1 ? '✅' : '❌'} {item.checklistItem}
                        </div>
                        <div className="pl-4 text-sm text-gray-600">
                          <div>{item.oneLinerExplanation}</div>
                          <div>{item.detailedExplanation}</div>
                          <div>{item.evaluationLogic}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>No performance checklist items found.</div>
                )}
              </div>
            </div>

            {/* Important Metrics */}
            <div className="mb-8">
              <div className="flex">
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

              <div className="block-bg-color m-4 p-3 overflow-x-auto">
                <table className="w-full text-left border-collapse border border-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">Key</th>
                      <th className="px-4 py-2 border">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criterionEvaluation.importantMetricsEvaluation?.metrics?.map((metric) => (
                      <tr key={metric.metricKey}>
                        <td className="px-4 py-2 border">{metric.metricKey}</td>
                        <td className="px-4 py-2 border">{metric.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reports */}
            <div className="mb-8">
              <h2 className="text-lg font-bold">Reports</h2>
              {/* We show each "reportDefinition" in the IndustryGroupCriteria to keep ordering/keys consistent */}
              {criterionDefinition.reports?.map((reportDef) => {
                const actualReportEval = criterionEvaluation.reports?.find((r) => r.reportKey === reportDef.key);
                return (
                  <div key={reportDef.key} className="my-4">
                    <DebugCriterionReport
                      tickerReport={report}
                      industryGroupCriteria={industryGroupCriteria}
                      criterionDefinition={criterionDefinition}
                      reportDefinition={reportDef}
                      report={actualReportEval}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <p>No evaluation data found for criterion &quot;{criterionKey}&quot;.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for section-specific regeneration */}
      {showSectionConfirmModal && selectedSectionForRegeneration && (
        <ConfirmationModal
          open={showSectionConfirmModal}
          onClose={() => setShowSectionConfirmModal(false)}
          onConfirm={async () => {
            await handleRegenerateSingleCriterionReports(selectedSectionForRegeneration.section, selectedSectionForRegeneration.reportKey);
            setShowSectionConfirmModal(false);
          }}
          title="Regenerate Section"
          confirmationText={`Are you sure you want to regenerate ${
            selectedSectionForRegeneration.section === 'report' && selectedSectionForRegeneration.reportKey
              ? `report ${selectedSectionForRegeneration.reportKey}`
              : selectedSectionForRegeneration.section
          } for criterion ${criterionKey}?`}
          askForTextInput={true}
        />
      )}
    </PageWrapper>
  );
}
