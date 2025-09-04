import { CompetitionAnalysisArray as CompetitionAnalysisArrayType } from '@/types/public-equity/analysis-factors-types';

declare global {
  namespace PrismaJson {
    // you can use classes, interfaces, types, etc.
    type CompetitionAnalysisArray = CompetitionAnalysisArrayType;
  }
}
