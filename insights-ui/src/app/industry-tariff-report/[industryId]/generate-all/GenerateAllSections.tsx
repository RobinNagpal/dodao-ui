'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { EvaluateIndustryContent, ReportType } from '@/scripts/industry-tariff-reports/tariff-types';
import { getAllHeadingSubheadingCombinations, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState, useEffect } from 'react';
import { tariffReportTag } from '@/utils/tariff-report-cache-utils';

// Define types for tracking API call status
type ApiCallStatus = 'pending' | 'loading' | 'completed';

interface ApiCall {
  id: string;
  name: string;
  status: ApiCallStatus;
}

interface TariffReportApiCalls {
  id: string;
  headingIndex: number;
  subHeadingIndex: number;
  displayName: string;
  apiCalls: ApiCall[];
  allCompleted: boolean;
}

export default function GenerateWholeReport({ industryId }: { industryId: string }) {
  const { postData } = usePostData<any, any>({ successMessage: '', errorMessage: '' });
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  // New state variables for tracking API calls
  const [topLevelApiCalls, setTopLevelApiCalls] = useState<ApiCall[]>([
    { id: 'understand-industry', name: 'Industry Understanding', status: 'pending' },
    { id: 'tariff-updates', name: 'Tariff Updates', status: 'pending' },
    { id: 'all-countries-tariff-updates', name: 'All Countries Tariff Updates', status: 'pending' },
    { id: 'industry-areas', name: 'Industry Areas', status: 'pending' },
  ]);

  const [comboApiCalls, setComboApiCalls] = useState<TariffReportApiCalls[]>([]);

  const [finalApiCalls, setFinalApiCalls] = useState<ApiCall[]>([
    { id: 'executive-summary', name: 'Executive Summary', status: 'pending' },
    { id: 'report-cover', name: 'Report Cover', status: 'pending' },
    { id: 'final-conclusion', name: 'Final Conclusion', status: 'pending' },
    { id: 'seo-metadata', name: 'SEO Metadata', status: 'pending' },
  ]);

  // Simple fetch functions for API calls
  const fetchEstablishedPlayers = async (headingIndex: number, subHeadingIndex: number) => {
    const url = `${getBaseUrl()}/api/industry-tariff-reports/${industryId}/get-established-players?headingIndex=${headingIndex}&subHeadingIndex=${subHeadingIndex}`;
    const response = await fetch(url, {
      next: { tags: [tariffReportTag(industryId)] },
    });
    return await response.json();
  };

  const fetchNewChallengers = async (headingIndex: number, subHeadingIndex: number) => {
    const url = `${getBaseUrl()}/api/industry-tariff-reports/${industryId}/get-new-challengers?headingIndex=${headingIndex}&subHeadingIndex=${subHeadingIndex}`;
    const response = await fetch(url, {
      next: { tags: [tariffReportTag(industryId)] },
    });
    return await response.json();
  };

  // Initialize comboApiCalls when the component loads
  useEffect(() => {
    if (industryId) {
      const combos = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId);
      const initialComboApiCalls = combos.map((combo) => ({
        id: `combo-${combo.headingIndex}-${combo.subHeadingIndex}`,
        headingIndex: combo.headingIndex,
        subHeadingIndex: combo.subHeadingIndex,
        displayName: combo.displayName,
        apiCalls: [
          {
            id: `established-players-tickers-${combo.headingIndex}-${combo.subHeadingIndex}`,
            name: 'Get Established Players',
            status: 'pending' as ApiCallStatus,
          },
          { id: `new-challengers-tickers-${combo.headingIndex}-${combo.subHeadingIndex}`, name: 'Get New Challengers', status: 'pending' as ApiCallStatus },
          { id: `headwinds-tailwinds-${combo.headingIndex}-${combo.subHeadingIndex}`, name: 'Headwinds & Tailwinds', status: 'pending' as ApiCallStatus },
          { id: `tariff-impact-${combo.headingIndex}-${combo.subHeadingIndex}`, name: 'Tariff Impact Analysis', status: 'pending' as ApiCallStatus },
          { id: `final-summary-${combo.headingIndex}-${combo.subHeadingIndex}`, name: 'Final Summary', status: 'pending' as ApiCallStatus },
        ],
        allCompleted: false,
      }));

      setComboApiCalls(initialComboApiCalls);
    }
  }, [industryId]);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    setProgress(0);

    // Reset all API call statuses to pending
    setTopLevelApiCalls((prev) => prev.map((call) => ({ ...call, status: 'pending' })));
    setComboApiCalls((prev) =>
      prev.map((combo) => ({
        ...combo,
        apiCalls: combo.apiCalls.map((call) => ({ ...call, status: 'pending' })),
        allCompleted: false,
      }))
    );
    setFinalApiCalls((prev) => prev.map((call) => ({ ...call, status: 'pending' })));

    try {
      const today = new Date().toISOString().split('T')[0];
      const combos = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId);

      // Calculate total steps dynamically based on actual data
      let totalSteps = 3; // top-level sections
      let done = 0;

      const bump = (stepName: string) => {
        done++;
        // Progress is now calculated based on completed API calls
        setCurrentStep(stepName);
      };

      // Helper function to set API call to loading state
      const setApiCallLoading = (apiCallId: string, setStateFn: React.Dispatch<React.SetStateAction<ApiCall[]>>) => {
        setStateFn((prev) => prev.map((call) => (call.id === apiCallId ? { ...call, status: 'loading' } : call)));
      };

      // Helper function to set combo API call to loading state
      const setComboApiCallLoading = (comboId: string, apiCallId: string) => {
        setComboApiCalls((prev: TariffReportApiCalls[]) => {
          return prev.map((combo) => {
            if (combo.id === comboId) {
              const newApiCalls: ApiCall[] = combo.apiCalls.map((call) => (call.id === apiCallId ? { ...call, status: 'loading' } : call));

              return {
                ...combo,
                apiCalls: newApiCalls,
                // Don't update allCompleted here as we're just setting to loading
              };
            }
            return combo;
          });
        });
      };

      // Helper function to update API call status to completed
      const updateApiCallStatus = (apiCallId: string, setStateFn: React.Dispatch<React.SetStateAction<ApiCall[]>>) => {
        setStateFn((prev) => prev.map((call) => (call.id === apiCallId ? { ...call, status: 'completed' } : call)));
      };

      // Helper function to update combo API call status to completed
      const updateComboApiCallStatus = (comboId: string, apiCallId: string) => {
        setComboApiCalls((prev: TariffReportApiCalls[]) => {
          const newCombos = prev.map((combo) => {
            if (combo.id === comboId) {
              const newApiCalls: ApiCall[] = combo.apiCalls.map((call) => (call.id === apiCallId ? { ...call, status: 'completed' } : call));

              // Check if all API calls in this combo are completed
              const allCompleted = newApiCalls.every((call) => call.status === 'completed');

              return {
                ...combo,
                apiCalls: newApiCalls,
                allCompleted,
              };
            }
            return combo;
          });

          return newCombos;
        });
      };

      // Calculate total number of API calls
      const calculateTotalApiCalls = () => {
        const topLevelCount = topLevelApiCalls.length;
        const comboCount = comboApiCalls.reduce((total, combo) => total + combo.apiCalls.length, 0);
        const finalCount = finalApiCalls.length;
        return topLevelCount + comboCount + finalCount;
      };

      // Calculate number of completed API calls
      const calculateCompletedApiCalls = () => {
        const topLevelCompleted = topLevelApiCalls.filter((call) => call.status === 'completed').length;
        const comboCompleted = comboApiCalls.reduce((total, combo) => total + combo.apiCalls.filter((call) => call.status === 'completed').length, 0);
        const finalCompleted = finalApiCalls.filter((call) => call.status === 'completed').length;
        return topLevelCompleted + comboCompleted + finalCompleted;
      };

      // Update progress based on completed API calls
      const updateProgress = () => {
        const total = calculateTotalApiCalls();
        const completed = calculateCompletedApiCalls();
        const newProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
        setProgress(newProgress);
      };

      /* -------- 1. top-level sections ------------------------------------ */
      setCurrentStep('Generating industry understanding...');
      setApiCallLoading('understand-industry', setTopLevelApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-understand-industry`, {});
      updateApiCallStatus('understand-industry', setTopLevelApiCalls);
      updateProgress();
      bump('Industry understanding complete');

      setCurrentStep('Generating tariff updates...');
      setApiCallLoading('tariff-updates', setTopLevelApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-tariff-updates`, {
        industry: industryId,
        date: today,
      });
      updateApiCallStatus('tariff-updates', setTopLevelApiCalls);
      updateProgress();
      bump('Tariff updates complete');

      setCurrentStep('Generating all countries tariff updates...');
      setApiCallLoading('all-countries-tariff-updates', setTopLevelApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-all-countries-tariff-updates`, {
        industry: industryId,
      });
      updateApiCallStatus('all-countries-tariff-updates', setTopLevelApiCalls);
      updateProgress();
      bump('All countries tariff updates complete');

      setCurrentStep('Generating industry areas...');
      setApiCallLoading('industry-areas', setTopLevelApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-industry-areas`, {
        industry: industryId,
      });
      updateApiCallStatus('industry-areas', setTopLevelApiCalls);
      updateProgress();
      bump('Industry areas complete');

      /* -------- 2. every heading/sub-heading combo ----------------------- */
      for (const c of combos) {
        const basePayload = { date: today, headingIndex: c.headingIndex, subHeadingIndex: c.subHeadingIndex };
        const sectionName = `${c.displayName}`;
        const comboId = `combo-${c.headingIndex}-${c.subHeadingIndex}`;

        setComboApiCallLoading(comboId, `established-players-tickers-only-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();
        await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`, {
          ...basePayload,
          sectionType: EvaluateIndustryContent.ESTABLISHED_PLAYERS_TICKERS_ONLY,
        });
        updateComboApiCallStatus(comboId, `established-players-tickers-only-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();

        /* 2-a  get list of established players */
        setCurrentStep(`Getting established players for ${sectionName}...`);
        setComboApiCallLoading(comboId, `established-players-tickers-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();
        const establishedPlayersResponse = await fetchEstablishedPlayers(c.headingIndex, c.subHeadingIndex);
        const { establishedPlayers = [] } = establishedPlayersResponse || {};
        updateComboApiCallStatus(comboId, `established-players-tickers-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();

        // Update total steps now that we know how many players/challengers there are
        if (done === 3) {
          // Only do this once, after the first combo
          const estimatedPlayersPerCombo = Math.max(establishedPlayers.length, 3);
          const estimatedChallengersPerCombo = 3; // Conservative estimate
          totalSteps = 3 + combos.length * (1 + estimatedPlayersPerCombo + 1 + estimatedChallengersPerCombo + 3);
        }

        console.log(`Found ${establishedPlayers.length} established players for ${sectionName}`);

        bump(`Found ${establishedPlayers.length} established players for ${sectionName}`);

        /* 2-b  detail for each player */
        for (const p of establishedPlayers) {
          console.log(`Generating details for established player: ${p.companyName} (${p.companyTicker})`);
          setCurrentStep(`Generating details for ${p.companyName} (${p.companyTicker})...`);
          const playerApiCallId = `established-player-${c.headingIndex}-${c.subHeadingIndex}-${p.companyTicker}`;
          setComboApiCallLoading(comboId, playerApiCallId);
          updateProgress();
          await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`, {
            ...basePayload,
            sectionType: EvaluateIndustryContent.ESTABLISHED_PLAYER,
            establishedPlayerTicker: p.companyTicker,
          });
          updateComboApiCallStatus(comboId, playerApiCallId);
          updateProgress();
          bump(`${p.companyName} details complete`);
        }

        /* 2-c  get list of new challengers */
        setComboApiCallLoading(comboId, `new-challengers-tickers-only-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();
        await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`, {
          ...basePayload,
          sectionType: EvaluateIndustryContent.NEW_CHALLENGERS_TICKERS_ONLY,
        });
        updateComboApiCallStatus(comboId, `new-challengers-tickers-only-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();

        setCurrentStep(`Getting new challengers for ${sectionName}...`);
        setComboApiCallLoading(comboId, `new-challengers-tickers-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();
        const newChallengersResponse = await fetchNewChallengers(c.headingIndex, c.subHeadingIndex);
        const { newChallengers = [] } = newChallengersResponse || {};
        updateComboApiCallStatus(comboId, `new-challengers-tickers-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();
        bump(`Found ${newChallengers.length} new challengers for ${sectionName}`);

        /* 2-d  detail for each challenger */
        if (newChallengers.length > 0) {
          for (const n of newChallengers) {
            setCurrentStep(`Generating details for ${n.companyName} (${n.companyTicker})...`);
            const challengerApiCallId = `new-challenger-${c.headingIndex}-${c.subHeadingIndex}-${n.companyTicker}`;
            setComboApiCallLoading(comboId, challengerApiCallId);
            updateProgress();
            await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`, {
              ...basePayload,
              sectionType: EvaluateIndustryContent.NEW_CHALLENGER,
              challengerTicker: n.companyTicker,
            });
            updateComboApiCallStatus(comboId, challengerApiCallId);
            updateProgress();
            bump(`${n.companyName} details complete`);
          }
        }

        /* 2-e  headwinds / tailwinds */
        setCurrentStep(`Generating headwinds & tailwinds for ${sectionName}...`);
        setComboApiCallLoading(comboId, `headwinds-tailwinds-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();
        await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`, {
          ...basePayload,
          sectionType: EvaluateIndustryContent.HEADWINDS_AND_TAILWINDS,
        });
        updateComboApiCallStatus(comboId, `headwinds-tailwinds-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();
        bump(`Headwinds & tailwinds complete for ${sectionName}`);

        /* 2-f  tariff impact by company-type */
        setCurrentStep(`Generating tariff impact analysis for ${sectionName}...`);
        setComboApiCallLoading(comboId, `tariff-impact-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();
        await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`, {
          ...basePayload,
          sectionType: EvaluateIndustryContent.TARIFF_IMPACT_BY_COMPANY_TYPE,
        });
        updateComboApiCallStatus(comboId, `tariff-impact-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();
        bump(`Tariff impact analysis complete for ${sectionName}`);

        /* 2-g  final summary */
        setCurrentStep(`Generating final summary for ${sectionName}...`);
        setComboApiCallLoading(comboId, `final-summary-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();
        await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`, {
          ...basePayload,
          sectionType: EvaluateIndustryContent.TARIFF_IMPACT_SUMMARY,
        });
        updateComboApiCallStatus(comboId, `final-summary-${c.headingIndex}-${c.subHeadingIndex}`);
        updateProgress();
        bump(`${sectionName} complete!`);
      }

      /* -------- 3. Final sections ----------------------------------------- */
      setCurrentStep('Generating executive summary...');
      setApiCallLoading('executive-summary', setFinalApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-executive-summary`, {});
      updateApiCallStatus('executive-summary', setFinalApiCalls);
      updateProgress();
      bump('Executive summary complete');

      setCurrentStep('Generating report cover...');
      setApiCallLoading('report-cover', setFinalApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-report-cover`, {});
      updateApiCallStatus('report-cover', setFinalApiCalls);
      updateProgress();
      bump('Report cover complete');

      setCurrentStep('Generating final conclusion...');
      setApiCallLoading('final-conclusion', setFinalApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-final-conclusion`, {
        industry: industryId,
      });
      updateApiCallStatus('final-conclusion', setFinalApiCalls);
      updateProgress();
      bump('Final conclusion complete');

      setCurrentStep('Generating SEO metadata...');
      setApiCallLoading('seo-metadata', setFinalApiCalls);
      updateProgress();
      await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-seo-info`, {
        section: ReportType.ALL,
      });
      updateApiCallStatus('seo-metadata', setFinalApiCalls);
      updateProgress();
      bump('SEO metadata complete');

      setCurrentStep('Report generation completed successfully! 🎉');
      // Set progress to 100% when all API calls are completed
      setProgress(100);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err?.message || 'Generation failed');
      setCurrentStep('Generation failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <PrivateWrapper>
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Generate Full Tariff Report</h1>
        <p className="text-gray-600 mb-6">
          This will generate all sections of the tariff report sequentially. The process may take several minutes to complete.
        </p>
        <div className="mt-4 border-t border-blue-100 pt-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">API Calls Status:</h3>

          {/* Top Level API Calls */}
          <div className="mb-4">
            <h4 className="text-xs font-medium mb-1">Top Level Sections:</h4>
            <ul className="space-y-1">
              {topLevelApiCalls.map((call) => (
                <li key={call.id} className="flex items-center text-sm">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs mr-2 ${
                      call.status === 'completed' ? 'bg-green-500' : call.status === 'loading' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    {call.status === 'completed' ? (
                      '✓'
                    ) : call.status === 'loading' ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      ''
                    )}
                  </div>
                  <span>{call.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Combo API Calls */}
          <div className="mb-4">
            <h4 className="text-xs font-medium mb-1">Heading/Subheading Combinations:</h4>
            <ul className="space-y-3">
              {comboApiCalls.map((combo) => (
                <li key={combo.id} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex items-center mb-1">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs mr-2 ${
                        combo.allCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      {combo.allCompleted ? '✓' : ''}
                    </div>
                    <span className="text-sm font-medium">
                      [{combo.headingIndex}, {combo.subHeadingIndex}] {combo.displayName}
                    </span>
                  </div>
                  <ul className="space-y-1 ml-6">
                    {combo.apiCalls.map((call) => (
                      <li key={call.id} className="flex items-center text-xs">
                        <div
                          className={`w-3 h-3 rounded-full flex items-center justify-center text-white text-xs mr-2 ${
                            call.status === 'completed' ? 'bg-green-500' : call.status === 'loading' ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          {call.status === 'completed' ? (
                            '✓'
                          ) : call.status === 'loading' ? (
                            <div className="w-2 h-2 border-1 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            ''
                          )}
                        </div>
                        <span>{call.name}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          {/* Final API Calls */}
          <div>
            <h4 className="text-xs font-medium mb-1">Final Sections:</h4>
            <ul className="space-y-1">
              {finalApiCalls.map((call) => (
                <li key={call.id} className="flex items-center text-sm">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs mr-2 ${
                      call.status === 'completed' ? 'bg-green-500' : call.status === 'loading' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    {call.status === 'completed' ? (
                      '✓'
                    ) : call.status === 'loading' ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      ''
                    )}
                  </div>
                  <span>{call.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {!running && !error && (
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors" onClick={run}>
            Start Generation
          </button>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold">Generation Failed</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium" onClick={run}>
              Retry
            </button>
          </div>
        )}

        {running && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
                <span className="text-blue-800 font-medium">Generation in Progress</span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-800 font-medium">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-2 bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                <strong>Current:</strong> {currentStep}
              </p>

              {/* API Call Status Section */}
            </div>

            <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              ⚠️ <strong>Important:</strong> Keep this tab open during generation. The process will continue in the background.
            </div>
          </div>
        )}

        {!running && progress === 100 && !error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-3">✓</div>
              <span className="text-green-800 font-medium">Report Generation Complete!</span>
            </div>
            <p className="text-green-700 text-sm mt-2">All sections have been generated successfully. You can now view the complete report.</p>
          </div>
        )}
      </div>
    </PrivateWrapper>
  );
}
