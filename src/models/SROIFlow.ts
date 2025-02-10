export interface SroiFlow {
  id: string;
  parentId: string;
  general: General;
  intervention: Intervention;
  targetGroup: TargetGroup;
  stakeholders: Stakeholder[];
  fundingSource: FundingSource;
  outcomes: Outcome[];
  method: Method;
  confirmation: Confirmation;
}
export interface General {
  isForcast: boolean;
  reportName: string;
  executiveSummary: string;
  reportLanguage: string;
  currency: string;
  logo: string;
}

export interface Intervention {
  interventionName: string;
  interventionDescription: string;
  purpose: string;
  activities: string[];
  participants: number | null;
  businessCaseLength: number | null;
}

export interface TargetGroup {
  category: string;
  customCategory: string;
  ageGroupMin: number | null;
  ageGroupMax: number | null;
  targetGroupDescription: string;
  riskFactors: string;
}

export interface Stakeholder {
  stakeholderName: string;
  stakeholderAmount: number | null;
  changes: string[];
}

export interface FundingSource {
  totalCosts: number | null;
  fundings: Funding[];
}

export interface Funding {
  fundingName: string;
  proportion: number | null;
}

// export interface Outcomes {
//   outcomes: Outcome[];
// }

export interface Outcome {
  outcomeName: string;
  outcomeDescription: string;
  measurementMethod: string;
  outcomeStart: string;
  outcomeDuration: number | null;
  outcomePopulation: number | null;
  effectType: string;
  effectSize: number | null;
  answerRate: number | null;
  startYears: number | null;
  yearsCollected: number | null;
  significance: string;
  source: string;
  comments: string;
  skipAlternative: boolean;
  alternative: Alternative;
  skipSensitivityAnalysis: boolean;
  sensitivityAnalysis: SensitivityAnalysis;
  beneficiaries: Beneficiaries[];
}

export interface Alternative {
  amount: number | null;
  source: string;
  comment: string;
}

export interface SensitivityAnalysis {
  deadweight: number | null;
  displacement: number | null;
  attribution: number | null;
  dropoff: number | null;
}

export interface Beneficiaries {
  name: string;
  type: string;
  valueType: string;
  value: number | null;
  source: string;
  comments: string;
}

export interface Method {
  description: string;
}

export interface Confirmation {
  isSavedTemplate: boolean;
  templateName: string | null;
}
