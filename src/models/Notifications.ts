import {Survey} from "./Survey";
import Identifiable from "./Identifyable";
import searchFilter from "../lib/list/searchFilter";


export interface Notification extends Identifiable{
    active: boolean,
    deliveryType: string,
    id: string,
    message: string,
    notificationType: string,
    answeredAt?: string,
    patientId?: string,
    sendOutDate?: Date,
    strategyId?: string,
    patientName?: string,
    surveyName?: string,
    surveys?: Survey[],
    surveyCode?: string,
    displaySendout?: string,
    surveyIds?: string[],
}

export enum NotificationType {
    Spørgeskemaer = 0,
}
export const NotificationSearchFilter = (search: string) => ({surveyName, patientName}: Notification) =>  {
    return searchFilter({
        surveyName: surveyName ?? '',
        patientName: patientName ?? '',
    }, search);
}