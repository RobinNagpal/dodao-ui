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

export interface GicsIndustryGroup {
  id: number;
  name: string;
  industries: Record<string, Industry>;
}

export interface GicsSector {
  id: number;
  name: string;
  industryGroups: Record<string, GicsIndustryGroup>;
}

export interface SectorsData {
  [key: string]: GicsSector;
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
