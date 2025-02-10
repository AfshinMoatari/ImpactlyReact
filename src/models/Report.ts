import BDate from "./BDate";
import ProjectTag from "./ProjectTag";
import { Layout, Layouts } from "react-grid-layout";
import { ProjectRegistration } from "./Strategy";

interface Report {
  id: string;
  name: string;
  moduleConfigs: ReportModuleConfig[];
  createdAt: BDate;
  updatedAt: BDate;
  imageURL: string;
  codeId?: string;
  images?: Images[];
  layouts: Layouts;
  freeTexts: FreeText[];
}
export interface FreeText {
  contents: string;
  createdAt: Date;
  createdBy: string;
  id: string;
}
export interface Images {
  description: string;
  key: string;
  title: string;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface ReportModuleConfig {
  freeTextId?: string;
  freeTextContents?: string;
  title?: string;
  description?: string;
  showAllData?: boolean;
  id?: string;
  type: string;
  name?: string;
  tags: ProjectTag[];
  frequency: number;
  viewType?: string | undefined;
  graphType?: number | undefined;
  projectId: string;
  strategyId: string;
  surveyId: string;
  fieldId: string;
  effectId: string;
  category: string;
  isEmpty?: boolean | undefined;
  isAverageScore?: boolean | undefined;
  isExcludeOnlyOneAnswer?: boolean | undefined;
  pointSystemType?: number | string;
  layout: Layout;
  timePreset: string;
  timeUnit: string;
  start?: BDate;
  end?: BDate;
  endDates?: (Date | null)[];
  dateRanges?: DateRange[];
  effects: ProjectRegistration[];
  file?: File | string;
  labelOnInside?: boolean | undefined;
  colors?: { [key: number]: string };
  slantedLabel?: boolean | undefined;
  labels?: { [key: number]: string };
  customGuideLabel?: { [key: number]: string };
  multipleQuestionsIds?: { [key: number]: string };
  xAxisDataType: string | undefined;
  questionType: string;
  likertScale?: number;
}

export const breakpoints = {
  // lg: 1200,
  // sm: 768,
  xs: 0,
  // xxs: -1
};
export type BreakpointKeys = keyof typeof breakpoints;
export const columns = {
  // lg: 12,
  // sm: 8,
  xs: 12,
};

export default Report;
