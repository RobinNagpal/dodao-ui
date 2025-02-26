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
  sector: {
    id: number;
    name: string;
  };
  industryGroup: {
    id: number;
    name: string;
  };
  industry: {
    id: number;
    name: string;
  };
  subIndustry: {
    id: number;
    name: string;
  };
}
