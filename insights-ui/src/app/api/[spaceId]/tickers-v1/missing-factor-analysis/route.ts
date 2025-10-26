import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { NextRequest } from 'next/server';

export interface MissingFactorAnalysisForIndustry {
  industryKey: string;
  industryName: string;
  industrySummary: string;
  subIndustryKey: string;
  subIndustryName: string;
  subIndustrySummary: string;
  businessAndMoatFactorsCount: number;
  financialAnalysisFactorsCount: number;
  pastPerformanceFactorsCount: number;
  futureGrowthFactorsCount: number;
  fairValueFactorsCount: number;
}

const getHandler = async (
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<MissingFactorAnalysisForIndustry[]> => {
  const { spaceId } = await params;

  const industriesWithMissingFactors = await prisma.$queryRaw<MissingFactorAnalysisForIndustry[]>`
    WITH factor_counts AS (
      SELECT 
        i.industry_key       AS "industryKey",
        i.name               AS "industryName",
        i.summary            AS "industrySummary",
        si.sub_industry_key  AS "subIndustryKey",
        si.name              AS "subIndustryName",
        si.summary           AS "subIndustrySummary",

        COUNT(*) FILTER (WHERE acf.category_key::text = ${TickerAnalysisCategory.BusinessAndMoat})::int               AS "businessAndMoatFactorsCount",
        COUNT(*) FILTER (WHERE acf.category_key::text = ${TickerAnalysisCategory.FinancialStatementAnalysis})::int    AS "financialAnalysisFactorsCount",
        COUNT(*) FILTER (WHERE acf.category_key::text = ${TickerAnalysisCategory.PastPerformance})::int               AS "pastPerformanceFactorsCount",
        COUNT(*) FILTER (WHERE acf.category_key::text = ${TickerAnalysisCategory.FutureGrowth})::int                  AS "futureGrowthFactorsCount",
        COUNT(*) FILTER (WHERE acf.category_key::text = ${TickerAnalysisCategory.FairValue})::int                     AS "fairValueFactorsCount"
      FROM 
        "TickerV1Industry" i
      JOIN 
        "TickerV1SubIndustry" si 
          ON i.industry_key = si.industry_key
      LEFT JOIN 
        "analysis_category_factors" acf 
          ON acf.industry_key = i.industry_key
         AND acf.sub_industry_key = si.sub_industry_key
         AND acf.space_id = ${spaceId}
      WHERE 
        i.archived = false
        AND si.archived = false
      GROUP BY 
        i.industry_key, i.name, i.summary,
        si.sub_industry_key, si.name, si.summary
    )
    SELECT * FROM factor_counts
    WHERE 
      "businessAndMoatFactorsCount"        < 5 OR
      "financialAnalysisFactorsCount"      < 5 OR
      "pastPerformanceFactorsCount"        < 5 OR
      "futureGrowthFactorsCount"           < 5 OR
      "fairValueFactorsCount"              < 5
    ORDER BY "industryName", "subIndustryName";
  `;

  return industriesWithMissingFactors;
};

export const GET = withLoggedInAdmin<MissingFactorAnalysisForIndustry[]>(getHandler);
