'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { ReportType, EvaluateIndustryContent, EstablishedPlayerRef, NewChallengerRef } from '@/scripts/industry-tariff-reports/tariff-types';
import { getAllHeadingSubheadingCombinations, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState, useEffect, useCallback } from 'react';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

interface GenerationSection {
  id: string;
  name: string;
  contentApi: string;
  contentPayload: any;
  seoType: ReportType;
  contentStatus: 'pending' | 'loading' | 'success' | 'error';
  seoStatus: 'pending' | 'loading' | 'success' | 'error';
  contentError?: string;
  seoError?: string;
  skipSeo?: boolean; // Skip SEO generation for intermediate steps
}

interface GenerateAllClientProps {
  industryId: string;
}

export default function GenerateAllSections({ industryId }: GenerateAllClientProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const [currentStep, setCurrentStep] = useState<'content' | 'seo' | 'idle'>('idle');
  const [sections, setSections] = useState<GenerationSection[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const { postData: postContentData, loading: isContentLoading } = usePostData<any, any>({
    successMessage: '',
    errorMessage: '',
  });

  const { postData: postSeoData, loading: isSeoLoading } = usePostData<any, any>({
    successMessage: '',
    errorMessage: '',
  });

  // Helper function to update section status with proper state management
  const updateSectionStatus = useCallback((index: number, field: 'contentStatus' | 'seoStatus', status: GenerationSection[typeof field], error?: string) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === index
          ? {
              ...section,
              [field]: status,
              ...(error && field === 'contentStatus' ? { contentError: error } : {}),
              ...(error && field === 'seoStatus' ? { seoError: error } : {}),
            }
          : section
      )
    );
  }, []);

  // Helper function to add individual established player sections
  const addEstablishedPlayerSections = (
    baseSectionId: string,
    combination: { headingIndex: number; subHeadingIndex: number; displayName: string },
    establishedPlayers: EstablishedPlayerRef[]
  ): GenerationSection[] => {
    const sections: GenerationSection[] = [];

    // Add individual established player sections
    establishedPlayers.forEach((player) => {
      sections.push({
        id: `${baseSectionId}-established-player-${player.companyTicker}`,
        name: `${combination.displayName} - ${player.companyName}`,
        contentApi: `/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`,
        contentPayload: {
          date: new Date().toISOString().split('T')[0],
          headingIndex: combination.headingIndex,
          subHeadingIndex: combination.subHeadingIndex,
          sectionType: EvaluateIndustryContent.ESTABLISHED_PLAYER,
          establishedPlayerTicker: player.companyTicker,
        },
        seoType: ReportType.EVALUATE_INDUSTRY_AREA,
        contentStatus: 'pending',
        seoStatus: 'pending',
        skipSeo: true,
      });
    });

    return sections;
  };

  // Helper function to add get new challengers section after all established players are done
  const addGetNewChallengersSection = (
    baseSectionId: string,
    combination: { headingIndex: number; subHeadingIndex: number; displayName: string }
  ): GenerationSection => {
    return {
      id: `${baseSectionId}-get-new-challengers`,
      name: `${combination.displayName} - Get New Challengers`,
      contentApi: `/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`,
      contentPayload: {
        date: new Date().toISOString().split('T')[0],
        headingIndex: combination.headingIndex,
        subHeadingIndex: combination.subHeadingIndex,
        sectionType: EvaluateIndustryContent.GET_NEW_CHALLENGERS,
      },
      seoType: ReportType.EVALUATE_INDUSTRY_AREA,
      contentStatus: 'pending',
      seoStatus: 'pending',
      skipSeo: true,
    };
  };

  // Helper function to add individual new challenger sections
  const addNewChallengerSections = (
    baseSectionId: string,
    combination: { headingIndex: number; subHeadingIndex: number; displayName: string },
    newChallengers: NewChallengerRef[]
  ): GenerationSection[] => {
    const sections: GenerationSection[] = [];

    // Add individual new challenger sections
    newChallengers.forEach((challenger) => {
      sections.push({
        id: `${baseSectionId}-new-challenger-${challenger.companyTicker}`,
        name: `${combination.displayName} - ${challenger.companyName}`,
        contentApi: `/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`,
        contentPayload: {
          date: new Date().toISOString().split('T')[0],
          headingIndex: combination.headingIndex,
          subHeadingIndex: combination.subHeadingIndex,
          sectionType: EvaluateIndustryContent.NEW_CHALLENGER,
          challengerTicker: challenger.companyTicker,
        },
        seoType: ReportType.EVALUATE_INDUSTRY_AREA,
        contentStatus: 'pending',
        seoStatus: 'pending',
        skipSeo: true,
      });
    });

    return sections;
  };

  // Helper function to add final evaluation sections
  const addFinalEvaluationSections = (
    baseSectionId: string,
    combination: { headingIndex: number; subHeadingIndex: number; displayName: string }
  ): GenerationSection[] => {
    return [
      {
        id: `${baseSectionId}-headwinds-tailwinds`,
        name: `${combination.displayName} - Headwinds & Tailwinds`,
        contentApi: `/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`,
        contentPayload: {
          date: new Date().toISOString().split('T')[0],
          headingIndex: combination.headingIndex,
          subHeadingIndex: combination.subHeadingIndex,
          sectionType: EvaluateIndustryContent.HEADWINDS_AND_TAILWINDS,
        },
        seoType: ReportType.EVALUATE_INDUSTRY_AREA,
        contentStatus: 'pending',
        seoStatus: 'pending',
        skipSeo: true,
      },
      {
        id: `${baseSectionId}-tariff-impact-by-company-type`,
        name: `${combination.displayName} - Tariff Impact by Company Type`,
        contentApi: `/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`,
        contentPayload: {
          date: new Date().toISOString().split('T')[0],
          headingIndex: combination.headingIndex,
          subHeadingIndex: combination.subHeadingIndex,
          sectionType: EvaluateIndustryContent.TARIFF_IMPACT_BY_COMPANY_TYPE,
        },
        seoType: ReportType.EVALUATE_INDUSTRY_AREA,
        contentStatus: 'pending',
        seoStatus: 'pending',
        skipSeo: true,
      },
      {
        id: `${baseSectionId}-tariff-impact-summary`,
        name: `${combination.displayName} - Tariff Impact Summary`,
        contentApi: `/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`,
        contentPayload: {
          date: new Date().toISOString().split('T')[0],
          headingIndex: combination.headingIndex,
          subHeadingIndex: combination.subHeadingIndex,
          sectionType: EvaluateIndustryContent.TARIFF_IMPACT_SUMMARY,
        },
        seoType: ReportType.EVALUATE_INDUSTRY_AREA,
        contentStatus: 'pending',
        seoStatus: 'pending',
        skipSeo: false, // Generate SEO for the final section
      },
    ];
  };

  // Initialize sections when component mounts or industryId changes
  useEffect(() => {
    if (industryId) {
      const initialSections: GenerationSection[] = [
        {
          id: 'understand-industry',
          name: 'Understand Industry',
          contentApi: `/api/industry-tariff-reports/${industryId}/generate-understand-industry`,
          contentPayload: {},
          seoType: ReportType.UNDERSTAND_INDUSTRY,
          contentStatus: 'pending',
          seoStatus: 'pending',
        },
        {
          id: 'tariff-updates',
          name: 'Tariff Updates',
          contentApi: `/api/industry-tariff-reports/${industryId}/generate-tariff-updates`,
          contentPayload: {
            industry: industryId,
            date: new Date().toISOString().split('T')[0],
          },
          seoType: ReportType.TARIFF_UPDATES,
          contentStatus: 'pending',
          seoStatus: 'pending',
        },
        {
          id: 'industry-areas',
          name: 'Industry Areas',
          contentApi: `/api/industry-tariff-reports/${industryId}/generate-industry-areas`,
          contentPayload: {
            industry: industryId,
          },
          seoType: ReportType.INDUSTRY_AREA_SECTION,
          contentStatus: 'pending',
          seoStatus: 'pending',
        },
      ];

      // Add initial evaluate industry sections (only get established players initially)
      const evaluateIndustryCombinations = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId);
      evaluateIndustryCombinations.forEach((combination) => {
        const baseSectionId = `evaluate-industry-${combination.headingIndex}-${combination.subHeadingIndex}`;

        // Add get established players section only
        initialSections.push({
          id: `${baseSectionId}-get-established-players`,
          name: `${combination.displayName} - Get Established Players`,
          contentApi: `/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`,
          contentPayload: {
            date: new Date().toISOString().split('T')[0],
            headingIndex: combination.headingIndex,
            subHeadingIndex: combination.subHeadingIndex,
            sectionType: EvaluateIndustryContent.GET_ESTABLISHED_PLAYERS,
          },
          seoType: ReportType.EVALUATE_INDUSTRY_AREA,
          contentStatus: 'pending',
          seoStatus: 'pending',
          skipSeo: true,
        });
      });

      // Add remaining sections
      initialSections.push(
        {
          id: 'executive-summary',
          name: 'Executive Summary',
          contentApi: `/api/industry-tariff-reports/${industryId}/generate-executive-summary`,
          contentPayload: {},
          seoType: ReportType.EXECUTIVE_SUMMARY,
          contentStatus: 'pending',
          seoStatus: 'pending',
        },
        {
          id: 'report-cover',
          name: 'Report Cover',
          contentApi: `/api/industry-tariff-reports/${industryId}/generate-report-cover`,
          contentPayload: {},
          seoType: ReportType.REPORT_COVER,
          contentStatus: 'pending',
          seoStatus: 'pending',
        },
        {
          id: 'final-conclusion',
          name: 'Final Conclusion',
          contentApi: `/api/industry-tariff-reports/${industryId}/generate-final-conclusion`,
          contentPayload: {
            industry: industryId,
          },
          seoType: ReportType.FINAL_CONCLUSION,
          contentStatus: 'pending',
          seoStatus: 'pending',
        }
      );

      setSections(initialSections);
    }
  }, [industryId]);

  // Computed value to check if generation is in progress
  const isGenerating = currentSectionIndex !== -1;

  const generateAllSections = async () => {
    if (!industryId || isGenerating) return;

    setShowGenerateModal(false);
    setCurrentSectionIndex(0);

    try {
      let processedCombinations = new Set<string>(); // Track which combinations we've fully processed
      let sectionIndex = 0;

      // Keep processing until all sections are done
      while (true) {
        // Get current sections from state
        const currentSections = sections;

        // Break if we've processed all sections
        if (sectionIndex >= currentSections.length) {
          break;
        }

        setCurrentSectionIndex(sectionIndex);
        const section = currentSections[sectionIndex];

        // Generate Content
        setCurrentStep('content');
        updateSectionStatus(sectionIndex, 'contentStatus', 'loading');

        try {
          const response = await postContentData(`${getBaseUrl()}${section.contentApi}`, section.contentPayload);
          updateSectionStatus(sectionIndex, 'contentStatus', 'success');

          // Handle different section types and add subsequent sections dynamically
          if (section.id.includes('-get-established-players')) {
            // After GET_ESTABLISHED_PLAYERS completes, add individual established player sections
            const match = section.id.match(/evaluate-industry-(\d+)-(\d+)-get-established-players/);
            if (match) {
              const headingIndex = parseInt(match[1]);
              const subHeadingIndex = parseInt(match[2]);
              const baseSectionId = `evaluate-industry-${headingIndex}-${subHeadingIndex}`;

              try {
                // Get established players list
                const establishedPlayersResponse = await postContentData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/get-established-players`, {
                  headingIndex,
                  subHeadingIndex,
                });

                const establishedPlayers = establishedPlayersResponse?.establishedPlayers || [];

                // Get combination info for display name
                const evaluateIndustryCombinations = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId);
                const combination = evaluateIndustryCombinations.find((c) => c.headingIndex === headingIndex && c.subHeadingIndex === subHeadingIndex);

                if (combination && establishedPlayers.length > 0) {
                  // Add individual established player sections
                  const establishedPlayerSections = addEstablishedPlayerSections(baseSectionId, combination, establishedPlayers);

                  // Insert after current section and wait for state update
                  await new Promise<void>((resolve) => {
                    setSections((prev) => {
                      const newSections = [...prev];
                      newSections.splice(sectionIndex + 1, 0, ...establishedPlayerSections);
                      setTimeout(() => resolve(), 0); // Wait for state update
                      return newSections;
                    });
                  });
                }
              } catch (error) {
                console.error('Error getting established players tickers:', error);
              }
            }
          } else if (section.id.includes('-established-player-')) {
            // Check if this is the last established player for this combination
            const match = section.id.match(/evaluate-industry-(\d+)-(\d+)-established-player-/);
            if (match) {
              const headingIndex = parseInt(match[1]);
              const subHeadingIndex = parseInt(match[2]);
              const baseSectionId = `evaluate-industry-${headingIndex}-${subHeadingIndex}`;

              // Find all established player sections for this combination
              const allEstablishedPlayerSections = sections.filter((s) => s.id.startsWith(`${baseSectionId}-established-player-`));

              // Check if all established player sections are completed (including current one)
              const allEstablishedPlayersCompleted = allEstablishedPlayerSections.every((s, idx) => {
                if (s.id === section.id) return true; // Current section is being completed
                return s.contentStatus === 'success' || s.contentStatus === 'error';
              });

              if (allEstablishedPlayersCompleted && !processedCombinations.has(`${baseSectionId}-get-new-challengers`)) {
                processedCombinations.add(`${baseSectionId}-get-new-challengers`);

                // Get combination info for display name
                const evaluateIndustryCombinations = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId);
                const combination = evaluateIndustryCombinations.find((c) => c.headingIndex === headingIndex && c.subHeadingIndex === subHeadingIndex);

                if (combination) {
                  // Add GET_NEW_CHALLENGERS section
                  const getNewChallengersSection = addGetNewChallengersSection(baseSectionId, combination);

                  // Insert after current section and wait for state update
                  await new Promise<void>((resolve) => {
                    setSections((prev) => {
                      const newSections = [...prev];
                      newSections.splice(sectionIndex + 1, 0, getNewChallengersSection);
                      setTimeout(() => resolve(), 0); // Wait for state update
                      return newSections;
                    });
                  });
                }
              }
            }
          } else if (section.id.includes('-get-new-challengers')) {
            // After GET_NEW_CHALLENGERS completes, add individual new challenger sections
            const match = section.id.match(/evaluate-industry-(\d+)-(\d+)-get-new-challengers/);
            if (match) {
              const headingIndex = parseInt(match[1]);
              const subHeadingIndex = parseInt(match[2]);
              const baseSectionId = `evaluate-industry-${headingIndex}-${subHeadingIndex}`;

              try {
                // Get new challengers list
                const newChallengersResponse = await postContentData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/get-new-challengers`, {
                  headingIndex,
                  subHeadingIndex,
                });

                const newChallengers = newChallengersResponse?.newChallengers || [];

                // Get combination info for display name
                const evaluateIndustryCombinations = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId);
                const combination = evaluateIndustryCombinations.find((c) => c.headingIndex === headingIndex && c.subHeadingIndex === subHeadingIndex);

                if (combination && newChallengers.length > 0) {
                  // Add individual new challenger sections
                  const newChallengerSections = addNewChallengerSections(baseSectionId, combination, newChallengers);

                  // Insert after current section and wait for state update
                  await new Promise<void>((resolve) => {
                    setSections((prev) => {
                      const newSections = [...prev];
                      newSections.splice(sectionIndex + 1, 0, ...newChallengerSections);
                      setTimeout(() => resolve(), 0); // Wait for state update
                      return newSections;
                    });
                  });
                }
              } catch (error) {
                console.error('Error getting new challengers tickers:', error);
              }
            }
          } else if (section.id.includes('-new-challenger-')) {
            // Check if this is the last new challenger for this combination
            const match = section.id.match(/evaluate-industry-(\d+)-(\d+)-new-challenger-/);
            if (match) {
              const headingIndex = parseInt(match[1]);
              const subHeadingIndex = parseInt(match[2]);
              const baseSectionId = `evaluate-industry-${headingIndex}-${subHeadingIndex}`;

              // Find all new challenger sections for this combination
              const allNewChallengerSections = sections.filter((s) => s.id.startsWith(`${baseSectionId}-new-challenger-`));

              // Check if all new challenger sections are completed (including current one)
              const allNewChallengersCompleted = allNewChallengerSections.every((s, idx) => {
                if (s.id === section.id) return true; // Current section is being completed
                return s.contentStatus === 'success' || s.contentStatus === 'error';
              });

              if (allNewChallengersCompleted && !processedCombinations.has(`${baseSectionId}-final`)) {
                processedCombinations.add(`${baseSectionId}-final`);

                // Get combination info for display name
                const evaluateIndustryCombinations = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId);
                const combination = evaluateIndustryCombinations.find((c) => c.headingIndex === headingIndex && c.subHeadingIndex === subHeadingIndex);

                if (combination) {
                  // Add final evaluation sections
                  const finalSections = addFinalEvaluationSections(baseSectionId, combination);

                  // Insert after current section and wait for state update
                  await new Promise<void>((resolve) => {
                    setSections((prev) => {
                      const newSections = [...prev];
                      newSections.splice(sectionIndex + 1, 0, ...finalSections);
                      setTimeout(() => resolve(), 0); // Wait for state update
                      return newSections;
                    });
                  });
                }
              }
            }
          }
        } catch (error) {
          updateSectionStatus(sectionIndex, 'contentStatus', 'error', error instanceof Error ? error.message : 'Unknown error');
          // Continue with SEO generation even if content fails
        }

        // Small delay between content and SEO
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Generate SEO (skip if section has skipSeo flag)
        if (!section.skipSeo) {
          setCurrentStep('seo');
          updateSectionStatus(sectionIndex, 'seoStatus', 'loading');

          try {
            let seoPayload: any = { section: section.seoType };

            // For evaluate industry areas, we need to include headingIndex and subHeadingIndex
            if (
              section.seoType === ReportType.EVALUATE_INDUSTRY_AREA &&
              section.contentPayload.headingIndex !== undefined &&
              section.contentPayload.subHeadingIndex !== undefined
            ) {
              seoPayload = {
                section: section.seoType,
                headingIndex: section.contentPayload.headingIndex,
                subHeadingIndex: section.contentPayload.subHeadingIndex,
              };
            }

            await postSeoData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-seo-info`, seoPayload);
            updateSectionStatus(sectionIndex, 'seoStatus', 'success');
          } catch (error) {
            updateSectionStatus(sectionIndex, 'seoStatus', 'error', error instanceof Error ? error.message : 'Unknown error');
          }
        } else {
          // Mark SEO as success for skipped sections
          updateSectionStatus(sectionIndex, 'seoStatus', 'success');
        }

        // Move to next section
        sectionIndex++;

        // Small delay before next section
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Generation process error:', error);
    } finally {
      setCurrentSectionIndex(-1);
      setCurrentStep('idle');
    }
  };

  const getStatusIcon = (status: 'pending' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
      case 'loading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
      case 'success':
        return <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>;
      case 'error':
        return <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">✗</div>;
    }
  };

  const getProgressPercentage = () => {
    if (!isGenerating) return 0;

    let totalSteps = 0;
    let completedSteps = 0;

    sections.forEach((section, index) => {
      // Count content step for all sections
      totalSteps += 1;
      // Count SEO step only for sections that don't skip SEO
      if (!section.skipSeo) {
        totalSteps += 1;
      }

      if (index < currentSectionIndex) {
        // Previous sections are fully completed
        completedSteps += 1; // content
        if (!section.skipSeo) {
          completedSteps += 1; // seo
        }
      } else if (index === currentSectionIndex) {
        // Current section
        if (section.contentStatus === 'success' || section.contentStatus === 'error') {
          completedSteps += 1;
        }
        if (!section.skipSeo && (section.seoStatus === 'success' || section.seoStatus === 'error')) {
          completedSteps += 1;
        }
      }
    });

    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  return (
    <PrivateWrapper>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Generate Complete Tariff Report</h1>
          <p className="mb-6">
            This will generate all sections of the tariff report sequentially. Each section will generate content first, then SEO metadata only for the final
            sections.
          </p>

          {!isGenerating && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Generate Whole Report
            </button>
          )}

          {isGenerating && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-medium text-gray-700">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${getProgressPercentage()}%` }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`border rounded-lg p-4 ${index === currentSectionIndex && isGenerating ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{section.name}</h3>
                <div className="text-sm text-gray-500">
                  {index + 1} of {sections.length}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Content Generation */}
                <div className="flex items-center space-x-3 p-3 border rounded-md">
                  {getStatusIcon(section.contentStatus)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">Content Generation</div>
                    {section.contentStatus === 'loading' && currentStep === 'content' && index === currentSectionIndex && (
                      <div className="text-xs text-blue-600">Generating content...</div>
                    )}
                    {section.contentStatus === 'error' && section.contentError && <div className="text-xs text-red-600">{section.contentError}</div>}
                    {section.contentStatus === 'success' && <div className="text-xs text-green-600">Content generated successfully</div>}
                  </div>
                </div>

                {/* SEO Generation */}
                <div className="flex items-center space-x-3 p-3 border rounded-md">
                  {section.skipSeo ? (
                    <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">-</div>
                  ) : (
                    getStatusIcon(section.seoStatus)
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">SEO Generation</div>
                    {section.skipSeo ? (
                      <div className="text-xs text-gray-500">Skipped for intermediate step</div>
                    ) : (
                      <>
                        {section.seoStatus === 'loading' && currentStep === 'seo' && index === currentSectionIndex && (
                          <div className="text-xs text-blue-600">Generating SEO metadata...</div>
                        )}
                        {section.seoStatus === 'error' && section.seoError && <div className="text-xs text-red-600">{section.seoError}</div>}
                        {section.seoStatus === 'success' && <div className="text-xs text-green-600">SEO generated successfully</div>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isGenerating && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-yellow-800">Generation in progress... Please do not close this page.</span>
            </div>
          </div>
        )}

        {!isGenerating &&
          sections.length > 0 &&
          sections.every(
            (s) => (s.contentStatus === 'success' || s.contentStatus === 'error') && (s.skipSeo || s.seoStatus === 'success' || s.seoStatus === 'error')
          ) && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-800 font-medium">Report generation completed! You can now view the generated sections.</div>
            </div>
          )}

        {showGenerateModal && (
          <ConfirmationModal
            open={showGenerateModal}
            onClose={() => setShowGenerateModal(false)}
            onConfirm={generateAllSections}
            title="Generate Complete Tariff Report"
            confirmationText="Are you sure you want to generate all sections of the tariff report? This will generate content and SEO metadata for all sections sequentially."
            confirming={false}
            askForTextInput={false}
          />
        )}
      </div>
    </PrivateWrapper>
  );
}
