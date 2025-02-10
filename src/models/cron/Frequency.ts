import Identifiable from "../Identifyable";
import { Survey } from "../Survey";

export enum CalendarUnit {
    DAILY, // = "dag",
    WEEKLY, // = "uge",
    MONTHLY, // = "måned",
}

export enum EndType {
    NEVER = 'Never',
    OCCUR = 'Occur',
    IMMEDIATE = 'Immediate'
}

export enum Weekday {
    MONDAY, // = "mandag",
    TUESDAY, //  = "tirsdag",
    WEDNESDAY, // = "onsdag",
    THURSDAY, // = "torsdag",
    FRIDAY, // = "fredag",
    SATURDAY, // = "lørdag",
    SUNDAY, // = "søndag"
}

export interface End {
    type: EndType;
    occurrences: number;
    endDate: Date;
}

export interface Frequency {
    createdAt?: string;
    parentId: string;
    id: string;
    end: End;
    cronExpression: string;
    surveys: Survey[];
    patientsId: string[];
}
export interface FrequencyStatus {
    createdAt: string;
    status: Date;
}

export interface SendoutFrequency {
    parentId: string;
    id: string;
    end: End;
    cronExpression: string;
}

export interface CronFrequencyExpression {
    count: number;
    unit: CalendarUnit;
    weekDays: number[];
    monthDays: number[];
    hour: number;
    minute: number;
}

export interface FrequencyExpression {
    count: number;
    unit: CalendarUnit;
    weekDays: number[];
    monthDays: number[];
    hour: number;
    minute: number;
}

export const defaultFrequency: Frequency = {
    parentId: '',
    id: '',
    surveys: [],
    patientsId: [],
    end: {
        type: EndType.OCCUR,
        occurrences: 10,
        endDate: new Date()
    },
    cronExpression: "0 12 * * *"
}

export interface FrequencyFormValues extends Identifiable {
    expression: FrequencyExpression,
    end: End
}

export interface BatchSendoutData {
    id: string,
    surveys: Survey[];
    patientsId: string[];
    type: string;
    frequencyFormValues: FrequencyFormValues;
}
