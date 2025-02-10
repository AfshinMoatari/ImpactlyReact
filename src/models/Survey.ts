import Identifiable from "./Identifyable";
import { Notification } from "./Notifications";

export interface Survey {
  parentId: string;
  id: string;
  index: number;
  name: string;
  longName: string;
  description: string;
  fields: SurveyField[];
  validated?: boolean;
  notification?: Notification;
  max: number;
  min: number;
  threshold: number[];
  isNegative?: boolean;
}

export type SurveyFieldType = "choice" | "text" | "skiller" | "likert";

export interface FieldValidation {
  required: boolean;
}
export interface AnswerProps {
  answeredAt: string;
  answer: string;
}
export interface SurveyField {
  answer?: AnswerProps[];
  parentId: string;
  id: string;
  choices: FieldChoice[];
  validation: FieldValidation;
  index: number;
  fieldIndex?: number;
  text: string;
  type: SurveyFieldType;
  likertScaleChoiceAmount?: number;
  skipNeutral: boolean;
  scaleCategory: string;
  isNonMandatory?: boolean;
  isMultipleChoices?: boolean;

  // For builder
  isNew?: boolean;
}

export interface FieldChoice {
  parentId: string;
  id: string;
  index: number;
  text: string;
  value: number;
}

export interface FieldEntry extends Identifiable {
  createdAt: Date;
  parentId: string;
  score: number;
  text: string;
  value: number;
  fieldId: string;
  fieldText: string;
  choiceId: string;
  choiceText: string;
  index: number;
  fieldIndex: number;
}

export interface EntryBatch extends Identifiable {
  text?: string;
  projectId: string;
  patientId: string;
  surveyId: string;
  score: number;
  entries: FieldEntry[];
  choiceId?: string;
  fieldId?: string;
  choiceText?: string;
  value?: number;
  index?: number;

  createdAt: Date;
  answeredAt: Date;
}
