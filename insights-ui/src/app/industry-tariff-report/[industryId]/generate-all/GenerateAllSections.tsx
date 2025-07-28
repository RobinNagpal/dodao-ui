'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { ReportType, EvaluateIndustryContent } from '@/scripts/industry-tariff-reports/tariff-types';
import { getAllHeadingSubheadingCombinations, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState, useEffect } from 'react';
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

      // Add multiple sections for each heading/subheading combination
      const evaluateIndustryCombinations = getAllHeadingSubheadingCombinations(industryId as TariffIndustryId);
      const sectionTypes = [
        { type: EvaluateIndustryContent.ESTABLISHED_PLAYERS, label: 'Established Players' },
        { type: EvaluateIndustryContent.NEW_CHALLENGERS, label: 'New Challengers' },
        { type: EvaluateIndustryContent.HEADWINDS_AND_TAILWINDS, label: 'Headwinds & Tailwinds' },
        { type: EvaluateIndustryContent.TARIFF_IMPACT_BY_COMPANY_TYPE, label: 'Tariff Impact by Company Type' },
        { type: EvaluateIndustryContent.TARIFF_IMPACT_SUMMARY, label: 'Tariff Impact Summary' },
      ];
      evaluateIndustryCombinations.forEach((combination) => {
        sectionTypes.forEach((sectionTypeObj) => {
          initialSections.push({
            id: `evaluate-industry-areas-${combination.headingIndex}-${combination.subHeadingIndex}-${sectionTypeObj.type}`,
            name: `${combination.displayName} - ${sectionTypeObj.label}`,
            contentApi: `/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`,
            contentPayload: {
              date: new Date().toISOString().split('T')[0],
              headingIndex: combination.headingIndex,
              subHeadingIndex: combination.subHeadingIndex,
              sectionType: sectionTypeObj.type,
            },
            seoType: ReportType.EVALUATE_INDUSTRY_AREA,
            contentStatus: 'pending',
            seoStatus: 'pending',
          });
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

  const updateSectionStatus = (index: number, field: 'contentStatus' | 'seoStatus', status: GenerationSection[typeof field], error?: string) => {
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
  };

  const generateAllSections = async () => {
    if (!industryId || isGenerating) return;

    setShowGenerateModal(false);
    setCurrentSectionIndex(0);

    try {
      for (let i = 0; i < sections.length; i++) {
        setCurrentSectionIndex(i);
        const section = sections[i];

        // Generate Content
        setCurrentStep('content');
        updateSectionStatus(i, 'contentStatus', 'loading');

        try {
          await postContentData(`${getBaseUrl()}${section.contentApi}`, section.contentPayload);
          updateSectionStatus(i, 'contentStatus', 'success');
        } catch (error) {
          updateSectionStatus(i, 'contentStatus', 'error', error instanceof Error ? error.message : 'Unknown error');
          // Continue with SEO generation even if content fails
        }

        // Small delay between content and SEO
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Generate SEO
        setCurrentStep('seo');
        updateSectionStatus(i, 'seoStatus', 'loading');

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
          updateSectionStatus(i, 'seoStatus', 'success');
        } catch (error) {
          updateSectionStatus(i, 'seoStatus', 'error', error instanceof Error ? error.message : 'Unknown error');
        }

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

    const totalSteps = sections.length * 2; // content + seo for each section
    let completedSteps = 0;

    sections.forEach((section, index) => {
      if (index < currentSectionIndex) {
        // Previous sections are fully completed
        completedSteps += 2;
      } else if (index === currentSectionIndex) {
        // Current section
        if (section.contentStatus === 'success' || section.contentStatus === 'error') {
          completedSteps += 1;
        }
        if (section.seoStatus === 'success' || section.seoStatus === 'error') {
          completedSteps += 1;
        }
      }
    });

    return Math.round((completedSteps / totalSteps) * 100);
  };

  return (
    <PrivateWrapper>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Generate Complete Tariff Report</h1>
          <p className="mb-6">
            This will generate all sections of the tariff report sequentially. Each section will generate content first, then SEO metadata.
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
                  {getStatusIcon(section.seoStatus)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">SEO Generation</div>
                    {section.seoStatus === 'loading' && currentStep === 'seo' && index === currentSectionIndex && (
                      <div className="text-xs text-blue-600">Generating SEO metadata...</div>
                    )}
                    {section.seoStatus === 'error' && section.seoError && <div className="text-xs text-red-600">{section.seoError}</div>}
                    {section.seoStatus === 'success' && <div className="text-xs text-green-600">SEO generated successfully</div>}
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
          sections.every((s) => (s.contentStatus === 'success' || s.contentStatus === 'error') && (s.seoStatus === 'success' || s.seoStatus === 'error')) && (
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
