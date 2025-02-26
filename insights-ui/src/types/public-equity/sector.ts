interface SubIndustry {
  id: number;
  name: string;
  description: string;
}

interface Industry {
  id: number;
  name: string;
  subIndustries: Record<string, SubIndustry>;
}

interface IndustryGroup {
  id: number;
  name: string;
  industries: Record<string, Industry>;
}

interface Sector {
  id: number;
  name: string;
  industryGroups: Record<string, IndustryGroup>;
}

export interface SectorsData {
  [key: string]: Sector;
}

export interface PublicEquitySubmissionData {
  sector: string;
  industryGroup: string;
  industry: string;
  subIndustry: string;
}
