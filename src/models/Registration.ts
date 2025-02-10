import Identifyable from "./Identifyable";
import searchFilter from "../lib/list/searchFilter";
import { PStatusRegistration } from "./Strategy";
import { PatientTag } from "./ProjectTag";

export interface ChartDatas {
  Name: string;
  key: string;
  Value: number;
}

interface PatientRegistration extends Identifyable {
  parentId: string;
  projectId: string;
  patientId: string;
  effectId: string;
  effectName: string;
  note: string;
  date: Date;
  populationSize: { [key: string]: number };
  chartDatas: ChartDatas[];
  sampleSizes: { [key: string]: number };
}

export interface CountRegistration extends PatientRegistration {
  type: "count";
}

export interface NumericRegistration extends PatientRegistration {
  type: "numeric";
  value: number;
}

export interface IncidentRegistration extends PatientRegistration {
  type: "incident";
  value: number;
}

export interface StatusRegistration extends PatientRegistration {
  type: "status";
  before: PStatusRegistration | undefined;
  now: PStatusRegistration;
}

export interface RegistrationStatus {
  projectId: string;
  name: string;
  id: string;
  type: string;
  isRegistered: boolean;
  status: string;
  latestRegisteredDate: Date;
  note: string;
  effectId: string;
  value: number;
  category: string;
  tags: PatientTag[];
  latestEffect: PStatusRegistration;
}

export interface PatientRegistrationDataGrid {
  projectId: string;
  patientId: string;
  patientName: string;
  effectId: string;
  effectName: string;
  note: string;
  date: Date;
  value: number;

  type?: string;
  category: string;
  before?: PStatusRegistration | undefined;
  now?: PStatusRegistration;
  tags?: string[];
}

export interface BatchSendoutRegistration {
  ids: string[];
  value: number;
  effectId: string;
  registrationDate: Date;
  patientRegistrationDataGrid: PatientRegistrationDataGrid[];
}

type Registration =
  | CountRegistration
  | StatusRegistration
  | NumericRegistration;

export const registrationSearchFilter =
  (search: string) =>
  ({ effectName, note }: Registration) =>
    searchFilter(
      {
        effectName: effectName ?? "",
        note: note ?? "",
      },
      search
    );

export default Registration;
