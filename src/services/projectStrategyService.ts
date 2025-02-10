import { RequestMethod, RestClient } from "./restClient";
import Strategy, { ProjectRegistration } from "../models/Strategy";
import { crudService, CrudServiceType } from "./crudService";
import RestResponse, { responseFromError } from "../models/rest/RestResponse";
import { EntryBatch, Survey } from "../models/Survey";
import { Frequency } from "../models/cron/Frequency";
import Registration, { PatientRegistrationDataGrid } from "../models/Registration";

export interface ProjectStrategyServiceType extends CrudServiceType<Strategy> {
    readonly getStrategyPatients: (strategyId: string) => RestResponse<EntryBatch[]>;
    readonly getStrategySurveys: (strategyId: string) => RestResponse<EntryBatch[]>;
    readonly postBatchSendout: (Frequency: Frequency, JobType: string) => RestResponse<Frequency>;
    readonly postBatchRegisteration: (strategyId: string, patientRegistrationDataGrid: PatientRegistrationDataGrid[]) => RestResponse<PatientRegistrationDataGrid[]>;
    readonly updateFrequencyBatchSendout: (Frequency: Frequency) => RestResponse<Frequency>;
    readonly getFrequencyById: (strategyId: string, frequencyId: string) => RestResponse<Frequency>;
    readonly deleteFrequency: (strategyId: string, frequencyId: string) => RestResponse<Frequency>;
    readonly deleteEffects: (strategyId: string, effectsId: string[]) => RestResponse<ProjectRegistration[]>;
    readonly createEffects: (strategyId: string, projectRegistrations: ProjectRegistration[]) => RestResponse<ProjectRegistration[]>;
    readonly updateEffects: (strategyId: string, projectRegistrations: ProjectRegistration[]) => RestResponse<ProjectRegistration[]>;
    readonly assignSurveys: (strategyId: string, projectSurveys: Survey[]) => RestResponse<Survey[]>;
    readonly getRegistrations: (effectId: string) => RestResponse<Registration[]>;
    readonly getRegisteredPatients: (strategyId: string, category: string) => RestResponse<Registration[]>;
}

export const projectStrategyService = (client: RestClient, path: string,): ProjectStrategyServiceType => {
    return {
        ...crudService<Strategy>(client, path),
        async getStrategyPatients(strategyId) {
            return await client.fetchJSON(RequestMethod.GET, `${path}/${strategyId}/patients`);
        },
        async getStrategySurveys(strategyId) {
            return await client.fetchJSON(RequestMethod.GET, `${path}/${strategyId}/surveys`);
        },
        async postBatchSendout(sendoutFrequency, jobType) {
            if (!sendoutFrequency.id || (jobType === 'Frequent' ? !sendoutFrequency.end : null) || !sendoutFrequency.parentId || sendoutFrequency.patientsId.length === 0 || sendoutFrequency.surveys.length === 0) return responseFromError(400);
            return await client.fetchJSON<Frequency>(RequestMethod.POST, `${path}/${sendoutFrequency.parentId}/batchsendouts/create/${jobType}`, sendoutFrequency);
        },
        async postBatchRegisteration(strategyId, patientRegistrationDataGrid) {
            if (patientRegistrationDataGrid.length === 0) return responseFromError(400);
            return await client.fetchJSON<PatientRegistrationDataGrid[]>(RequestMethod.POST, `${path}/${strategyId}/registrations/create`, patientRegistrationDataGrid);
        },
        async updateFrequencyBatchSendout(sendoutFrequency) {
            if (!sendoutFrequency.id || !sendoutFrequency.end || !sendoutFrequency.parentId || sendoutFrequency.patientsId.length === 0 || sendoutFrequency.surveys.length === 0) return responseFromError(400);
            return await client.fetchJSON<Frequency>(RequestMethod.PUT, `${path}/${sendoutFrequency.parentId}/batchsendouts`, sendoutFrequency);
        },
        async getFrequencyById(strategyId, frequencyId) {
            return await client.fetchJSON(RequestMethod.GET, `${path}/${strategyId}/frequency/${frequencyId}`);
        },
        async deleteFrequency(strategyId, frequencyId) {
            return await client.fetchJSON(RequestMethod.DELETE, `${path}/${strategyId}/batchsendouts/delete/${frequencyId}`);
        },
        async deleteEffects(strategyId, effectsId) {
            return await client.fetchJSON(RequestMethod.DELETE, `${path}/${strategyId}/effects/delete`, effectsId);
        },
        async createEffects(strategyId, projectRegistrations) {
            return await client.fetchJSON(RequestMethod.POST, `${path}/${strategyId}/effects/create`, projectRegistrations);
        },
        async updateEffects(strategyId, projectRegistrations) {
            return await client.fetchJSON(RequestMethod.PUT, `${path}/${strategyId}/effects`, projectRegistrations);
        },
        async assignSurveys(strategyId, projectSurveys) {
            return await client.fetchJSON(RequestMethod.POST, `${path}/${strategyId}/surveys/create`, projectSurveys);
        },
        async getRegistrations(effectId) {
            return await client.fetchJSON(RequestMethod.GET, `${path}/${effectId}/registrations`);
        },
        async getRegisteredPatients(strategyId, category) {
            return await client.fetchJSON(RequestMethod.GET, `${path}/${strategyId}/registrations/${category}`);
        },
    };
}

export default projectStrategyService;
