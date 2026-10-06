import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';

// Report fields an admin can hand-edit from a chapter page's `/edit` route.
export type EditableReportField =
  | 'reportCover'
  | 'executiveSummary'
  | 'tariffUpdates'
  | 'understandIndustry'
  | 'industryAreasSections'
  | 'finalConclusion'
  | 'tariffEngineering';

export type EditableReportContent = { [K in EditableReportField]?: NonNullable<IndustryTariffReport[K]> };

// Which report fields each chapter page renders (and therefore edits). Keyed by page slug —
// 'overview' is the chapter cover, the rest match CHAPTER_REPORT_SECTIONS.
export const CHAPTER_EDIT_FIELDS: Record<string, EditableReportField[]> = {
  overview: ['reportCover', 'executiveSummary'],
  'tariff-updates': ['tariffUpdates'],
  'understand-industry': ['understandIndustry'],
  'industry-areas': ['industryAreasSections'],
  'tariff-engineering': ['tariffEngineering'],
  'final-conclusion': ['finalConclusion'],
};

export const EDIT_FIELD_LABELS: Record<EditableReportField, string> = {
  reportCover: 'Overview',
  executiveSummary: 'Executive Summary',
  tariffUpdates: 'Tariff Updates',
  understandIndustry: 'Understand Industry',
  industryAreasSections: 'Industry Areas',
  finalConclusion: 'Final Conclusion',
  tariffEngineering: 'Tariff Engineering',
};

// Starting shape when a section hasn't been generated yet, so admins can author it from scratch.
// Arrays carry one empty item so the editor knows the item shape for "Add".
export const EMPTY_EDIT_CONTENT: Required<EditableReportContent> = {
  reportCover: { title: '', reportCoverContent: '' },
  executiveSummary: { title: '', executiveSummary: '' },
  tariffUpdates: {
    countryNames: [],
    countrySpecificTariffs: [
      {
        countryName: '',
        tariffDetails: '',
        existingTradeAmountAndAgreement: '',
        newChanges: '',
        tradeImpactedByNewTariff: '',
        tradeExemptedByNewTariff: '',
        tariffChangesForIndustrySubArea: [''],
      },
    ],
  },
  understandIndustry: { title: '', sections: [{ title: '', paragraphs: [''] }] },
  industryAreasSections: { title: '', industryAreas: '' },
  finalConclusion: {
    title: '',
    conclusionBrief: '',
    positiveImpacts: { title: '', positiveImpacts: '' },
    negativeImpacts: { title: '', negativeImpacts: '' },
    finalStatements: '',
  },
  tariffEngineering: {
    title: '',
    overview: '',
    classificationLevers: [{ leverTitle: '', currentClassification: '', engineeredClassification: '', basisForReclassification: '', dutyDelta: '' }],
    strategies: [
      { title: '', technique: '', applicabilityToChapter: '', potentialDutyImpact: '', implementationSteps: [''], risksAndCaveats: '', precedent: '' },
    ],
    countryOfOriginPlaybook: '',
    valuationOpportunities: '',
    ftzAndDrawback: '',
    complianceGuardrails: '',
    bottomLine: '',
  },
};
