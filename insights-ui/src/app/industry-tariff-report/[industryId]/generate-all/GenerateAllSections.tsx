'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { ReportType, EvaluateIndustryContent, EstablishedPlayerRef, NewChallengerRef } from '@/scripts/industry-tariff-reports/tariff-types';
import { getAllHeadingSubheadingCombinations, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
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
  skipSeo?: boolean; // skip SEO generation for intermediate steps
}

interface GenerateAllClientProps {
  industryId: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export default function GenerateAllSections({ industryId }: GenerateAllClientProps) {
  // ---------------------------------------------------------------------------
  // React state + refs ---------------------------------------------------------
  // ---------------------------------------------------------------------------
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const [currentStep, setCurrentStep] = useState<'content' | 'seo' | 'idle'>('idle');
  const [sections, setSections] = useState<GenerationSection[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  /**
   * A mutable ref mirroring `sections` so that the async generation loop always
   * has a fresh reference (avoids stale‐state races when we splice the array
   * during the same tick in which we read from it).
   */
  const sectionsRef = useRef<GenerationSection[]>([]);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // ---------------------------------------------------------------------------
  // Fetch helpers --------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const { postData: postContentData } = usePostData<any, any>({
    successMessage: '',
    errorMessage: '',
  });
  const { postData: postSeoData } = usePostData<any, any>({
    successMessage: '',
    errorMessage: '',
  });

  // ---------------------------------------------------------------------------
  // Helper: update section status ---------------------------------------------
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Factory helpers to create follow‑up sections -------------------------------
  // ---------------------------------------------------------------------------
  const addEstablishedPlayerSections = (
    baseSectionId: string,
    combination: { headingIndex: number; subHeadingIndex: number; displayName: string },
    establishedPlayers: EstablishedPlayerRef[]
  ): GenerationSection[] =>
    establishedPlayers.map((player) => ({
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
    }));

  const addGetNewChallengersSection = (
    baseSectionId: string,
    combination: { headingIndex: number; subHeadingIndex: number; displayName: string }
  ): GenerationSection => ({
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
  });

  const addNewChallengerSections = (
    baseSectionId: string,
    combination: { headingIndex: number; subHeadingIndex: number; displayName: string },
    newChallengers: NewChallengerRef[]
  ): GenerationSection[] =>
    newChallengers.map((challenger) => ({
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
    }));

  const addFinalEvaluationSections = (
    baseSectionId: string,
    combination: { headingIndex: number; subHeadingIndex: number; displayName: string }
  ): GenerationSection[] => [
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
      skipSeo: false, // final part – SEO required
    },
  ];

  // ---------------------------------------------------------------------------
  // Initialise root sections when industryId changes -------------------------
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!industryId) return;

    const today = new Date().toISOString().split('T')[0];

    const initial: GenerationSection[] = [
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
        contentPayload: { industry: industryId, date: today },
        seoType: ReportType.TARIFF_UPDATES,
        contentStatus: 'pending',
        seoStatus: 'pending',
      },
      {
        id: 'industry-areas',
        name: 'Industry Areas',
        contentApi: `/api/industry-tariff-reports/${industryId}/generate-industry-areas`,
        contentPayload: { industry: industryId },
        seoType: ReportType.INDUSTRY_AREA_SECTION,
        contentStatus: 'pending',
        seoStatus: 'pending',
      },
    ];

    // Evaluate‑industry combinations (initial – list only)
    getAllHeadingSubheadingCombinations(industryId as TariffIndustryId).forEach((combination) => {
      const baseSectionId = `evaluate-industry-${combination.headingIndex}-${combination.subHeadingIndex}`;
      initial.push({
        id: `${baseSectionId}-get-established-players`,
        name: `${combination.displayName} - Get Established Players`,
        contentApi: `/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`,
        contentPayload: {
          date: today,
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

    // Wrap‑up sections
    initial.push(
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
        contentPayload: { industry: industryId },
        seoType: ReportType.FINAL_CONCLUSION,
        contentStatus: 'pending',
        seoStatus: 'pending',
      }
    );

    setSections(initial);
  }, [industryId]);

  // ---------------------------------------------------------------------------
  // Generation orchestrator ----------------------------------------------------
  // ---------------------------------------------------------------------------
  const isGenerating = currentSectionIndex !== -1;

  const generateAllSections = async () => {
    if (!industryId || isGenerating) return;

    setShowGenerateModal(false);
    setCurrentSectionIndex(0);

    const processedCombinations = new Set<string>();
    let sectionIndex = 0;

    try {
      /* eslint-disable no-await-in-loop */
      // Loop until we exhaust sectionsRef.current
      while (sectionIndex < sectionsRef.current.length) {
        const section = sectionsRef.current[sectionIndex];
        setCurrentSectionIndex(sectionIndex);

        // ------------------ 1. CONTENT ---------------------------------------
        setCurrentStep('content');
        updateSectionStatus(sectionIndex, 'contentStatus', 'loading');
        try {
          await postContentData(`${getBaseUrl()}${section.contentApi}`, section.contentPayload);
          updateSectionStatus(sectionIndex, 'contentStatus', 'success');
        } catch (err: any) {
          updateSectionStatus(sectionIndex, 'contentStatus', 'error', err?.message || 'Unknown error');
        }

        // ------------------ 2. Decide what to enqueue next -------------------
        await maybeEnqueueFollowUps(section, sectionIndex, processedCombinations);

        // ------------------ 3. SEO -------------------------------------------
        await new Promise((r) => setTimeout(r, 500)); // small pause
        if (!section.skipSeo) {
          setCurrentStep('seo');
          updateSectionStatus(sectionIndex, 'seoStatus', 'loading');
          try {
            let seoPayload: any = { section: section.seoType };
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
          } catch (err: any) {
            updateSectionStatus(sectionIndex, 'seoStatus', 'error', err?.message || 'Unknown error');
          }
        } else {
          updateSectionStatus(sectionIndex, 'seoStatus', 'success'); // mark skipped as done
        }

        sectionIndex += 1;
        await new Promise((r) => setTimeout(r, 1000));
      }
      /* eslint-enable no-await-in-loop */
    } finally {
      setCurrentSectionIndex(-1);
      setCurrentStep('idle');
    }
  };

  // ---------------------------------------------------------------------------
  // Decide & enqueue follow‑up steps ------------------------------------------
  // ---------------------------------------------------------------------------
  const maybeEnqueueFollowUps = async (section: GenerationSection, sectionIndex: number, processedCombinations: Set<string>) => {
    const today = new Date().toISOString().split('T')[0];

    // -------------- HELPERS --------------------------------------------------
    const enqueue = async (newSections: GenerationSection | GenerationSection[]) => {
      await new Promise<void>((resolve) => {
        setSections((prev) => {
          const arr = [...prev];
          const toInsert = Array.isArray(newSections) ? newSections : [newSections];
          arr.splice(sectionIndex + 1, 0, ...toInsert);
          return arr;
        });
        // let React flush state, then resolve so that loop sees updated length
        setTimeout(() => resolve(), 0);
      });
    };

    // ------------------------------------------------------------------------
    // ★ GET_ESTABLISHED_PLAYERS → enqueue per‑company or, if none, next steps
    // ------------------------------------------------------------------------
    if (section.id.includes('-get-established-players')) {
      const match = section.id.match(/evaluate-industry-(\d+)-(\d+)-get-established-players/);
      if (!match) return;
      const [headingIndex, subHeadingIndex] = match.slice(1).map(Number);
      const baseSectionId = `evaluate-industry-${headingIndex}-${subHeadingIndex}`;

      try {
        const { establishedPlayers = [] } =
          (await postContentData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/get-established-players`, { headingIndex, subHeadingIndex })) || {};

        const combination = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId).find(
          (c) => c.headingIndex === headingIndex && c.subHeadingIndex === subHeadingIndex
        );

        if (combination) {
          if (establishedPlayers.length) {
            await enqueue(addEstablishedPlayerSections(baseSectionId, combination, establishedPlayers));
          }
          // even if list is empty, jump straight to challengers step
          if (!processedCombinations.has(`${baseSectionId}-get-new-challengers`)) {
            processedCombinations.add(`${baseSectionId}-get-new-challengers`);
            await enqueue(addGetNewChallengersSection(baseSectionId, combination));
          }
        }
      } catch (err) {
        console.error('Error fetching established players list', err);
      }
    }

    // ------------------------------------------------------------------------
    // ★ ESTABLISHED_PLAYER completion  ---------------------------------------
    // ------------------------------------------------------------------------
    else if (section.id.includes('-established-player-')) {
      const m = section.id.match(/evaluate-industry-(\d+)-(\d+)-established-player-/);
      if (!m) return;
      const [headingIndex, subHeadingIndex] = m.slice(1).map(Number);
      const baseSectionId = `evaluate-industry-${headingIndex}-${subHeadingIndex}`;

      const allPlayersComplete = sectionsRef.current
        .filter((s) => s.id.startsWith(`${baseSectionId}-established-player-`))
        .every((s) => s.contentStatus === 'success' || s.contentStatus === 'error');

      if (allPlayersComplete && !processedCombinations.has(`${baseSectionId}-get-new-challengers`)) {
        processedCombinations.add(`${baseSectionId}-get-new-challengers`);
        const combination = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId).find(
          (c) => c.headingIndex === headingIndex && c.subHeadingIndex === subHeadingIndex
        );
        if (combination) await enqueue(addGetNewChallengersSection(baseSectionId, combination));
      }
    }

    // ------------------------------------------------------------------------
    // ★ GET_NEW_CHALLENGERS completion ---------------------------------------
    // ------------------------------------------------------------------------
    else if (section.id.includes('-get-new-challengers')) {
      const m = section.id.match(/evaluate-industry-(\d+)-(\d+)-get-new-challengers/);
      if (!m) return;
      const [headingIndex, subHeadingIndex] = m.slice(1).map(Number);
      const baseSectionId = `evaluate-industry-${headingIndex}-${subHeadingIndex}`;

      try {
        const { newChallengers = [] } =
          (await postContentData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/get-new-challengers`, { headingIndex, subHeadingIndex })) || {};

        const combination = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId).find(
          (c) => c.headingIndex === headingIndex && c.subHeadingIndex === subHeadingIndex
        );

        if (combination) {
          if (newChallengers.length) {
            await enqueue(addNewChallengerSections(baseSectionId, combination, newChallengers));
          }
          // even if zero, still enqueue final evaluation sections
          if (!processedCombinations.has(`${baseSectionId}-final`)) {
            processedCombinations.add(`${baseSectionId}-final`);
            await enqueue(addFinalEvaluationSections(baseSectionId, combination));
          }
        }
      } catch (err) {
        console.error('Error fetching challengers list', err);
      }
    }

    // ------------------------------------------------------------------------
    // ★ NEW_CHALLENGER completion --------------------------------------------
    // ------------------------------------------------------------------------
    else if (section.id.includes('-new-challenger-')) {
      const m = section.id.match(/evaluate-industry-(\d+)-(\d+)-new-challenger-/);
      if (!m) return;
      const [headingIndex, subHeadingIndex] = m.slice(1).map(Number);
      const baseSectionId = `evaluate-industry-${headingIndex}-${subHeadingIndex}`;
      const allChallengersComplete = sectionsRef.current
        .filter((s) => s.id.startsWith(`${baseSectionId}-new-challenger-`))
        .every((s) => s.contentStatus === 'success' || s.contentStatus === 'error');

      if (allChallengersComplete && !processedCombinations.has(`${baseSectionId}-final`)) {
        processedCombinations.add(`${baseSectionId}-final`);
        const combination = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId).find(
          (c) => c.headingIndex === headingIndex && c.subHeadingIndex === subHeadingIndex
        );
        if (combination) await enqueue(addFinalEvaluationSections(baseSectionId, combination));
      }
    }
  };

  // ---------------------------------------------------------------------------
  // UI helpers -----------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const getStatusIcon = (status: GenerationSection['contentStatus']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'loading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>;
      case 'error':
        return <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">✗</div>;
    }
  };

  const getProgressPercentage = () => {
    if (!isGenerating) return 0;

    let total = 0;
    let done = 0;

    sectionsRef.current.forEach((s, idx) => {
      total += 1; // content
      if (!s.skipSeo) total += 1; // seo

      if (idx < currentSectionIndex) {
        done += 1 + (s.skipSeo ? 0 : 1);
      } else if (idx === currentSectionIndex) {
        if (s.contentStatus === 'success' || s.contentStatus === 'error') done += 1;
        if (!s.skipSeo && (s.seoStatus === 'success' || s.seoStatus === 'error')) done += 1;
      }
    });

    return total ? Math.round((done / total) * 100) : 0;
  };

  // ---------------------------------------------------------------------------
  // Render --------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  return (
    <PrivateWrapper>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Generate Complete Tariff Report</h1>
          <p className="mb-6">
            This will generate all sections of the tariff report sequentially. Each section will generate content first, then SEO metadata (SEO only for final
            sections).
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
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${getProgressPercentage()}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Sections list */}
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className={`border rounded-lg p-4 ${idx === currentSectionIndex && isGenerating ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{section.name}</h3>
                <span className="text-sm text-gray-500">
                  {idx + 1} of {sections.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Content */}
                <div className="flex items-center space-x-3 p-3 border rounded-md">
                  {getStatusIcon(section.contentStatus)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">Content Generation</div>
                    {section.contentStatus === 'loading' && currentStep === 'content' && idx === currentSectionIndex && (
                      <div className="text-xs text-blue-600">Generating content...</div>
                    )}
                    {section.contentStatus === 'error' && section.contentError && <div className="text-xs text-red-600">{section.contentError}</div>}
                    {section.contentStatus === 'success' && <div className="text-xs text-green-600">Content generated successfully</div>}
                  </div>
                </div>

                {/* SEO */}
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
                        {section.seoStatus === 'loading' && currentStep === 'seo' && idx === currentSectionIndex && (
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

        {/* Footer states */}
        {isGenerating && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-3" />
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

        {/* Confirm modal */}
        {showGenerateModal && (
          <ConfirmationModal
            open={showGenerateModal}
            onClose={() => setShowGenerateModal(false)}
            onConfirm={generateAllSections}
            title="Generate Complete Tariff Report"
            confirmationText="Are you sure you want to generate all sections of the tariff report? This will generate content and SEO metadata sequentially."
            confirming={false}
            askForTextInput={false}
          />
        )}
      </div>
    </PrivateWrapper>
  );
}
