import {RequestMethod, RestClient} from "./restClient";
import ProjectPatient from "../models/ProjectPatient";
import {BindOneFunction, crudService, CrudServiceType} from "./crudService";
import Registration, { RegistrationStatus } from "../models/Registration";
import RestResponse, {responseFromError} from "../models/rest/RestResponse";
import ProjectTag from "../models/ProjectTag";
import {EntryBatch, Survey} from "../models/Survey";
import SurveyCode from "../models/codes/SurveyCode";

export type ProjectPatientServiceType = CrudServiceType<ProjectPatient> & {
    assignStrategy: BindOneFunction<ProjectPatient>;
    addTags: (patientId: string, tags: ProjectTag[]) => RestResponse<ProjectPatient>;
    getSurveyAnswers: (patientId: string) => RestResponse<EntryBatch[]>;
    getCustomSurveyAnswers: (patientId: string) => RestResponse<EntryBatch[]>;
    getRegistrations: (patientId: string) => RestResponse<Registration[]>;
    createRegistration: (patientId: string, registration: Partial<Registration>) => RestResponse<ProjectPatient>;
    deleteRegistration: (patientId: string, registrationId: string) => RestResponse<ProjectPatient>;
    updateRegistration: (patientId: string, registration: Partial<Registration>) => RestResponse<ProjectPatient>;

    archiveTag: (patientId: string, tagId: string) => RestResponse<ProjectPatient>;
    createSurveyCode: (patientId: string, strategyId: string, surveyIds: Survey[]) => RestResponse<SurveyCode>;
    sendSurveyCode: (patientId: string, strategyId: string, surveyIds: Survey[]) => RestResponse<SurveyCode>;
};

export const projectPatientService = (client: RestClient, path: string)
    : ProjectPatientServiceType => {
    return {
        ...crudService<ProjectPatient>(client, path),
        async assignStrategy(patientId, strategyId) {
            return await client.fetchJSON(RequestMethod.PUT, `${path}/${patientId}/assign/${strategyId}`, {});
        },
        async addTags(patientId, tags) {
            return await client.fetchJSON(RequestMethod.POST, `${path}/${patientId}/tags`, tags);
        },
        async archiveTag(patientId, tagId) {
            return await client.fetchJSON(RequestMethod.DELETE, `${path}/${patientId}/tags/${tagId}`)
        },
        async getSurveyAnswers(patientId) {
            return await client.fetchJSON(RequestMethod.GET, `${path}/${patientId}/surveys/`);
        },
        async getCustomSurveyAnswers(patientId) {
            return await client.fetchJSON(RequestMethod.GET, `${path}/${patientId}/custom-surveys?/`);
        },
        async createRegistration(patientId, registration) {
            return await client.fetchJSON(RequestMethod.POST, `${path}/${patientId}/registrations`, registration);
        },
        async deleteRegistration(patientId, registrationId) {
            return await client.fetchJSON(RequestMethod.DELETE, `${path}/${patientId}/registrations/${registrationId}`);
        },
        async updateRegistration(patientId, registration) {
            return await client.fetchJSON(RequestMethod.PUT, `${path}/${patientId}/registrations/${registration.id}`, registration);
        },
        async getRegistrations(patientsId) {
            return await client.fetchJSON(RequestMethod.GET, `${path}/${patientsId}/registrations`);
        },
        async createSurveyCode(patientId, strategyId, surveyIds) {
            if (!patientId || !strategyId || strategyId.length === 0) return responseFromError(400);
            return await client.fetchJSON(RequestMethod.POST, `${path}/${patientId}/code/${strategyId}`, surveyIds);
        },
        async sendSurveyCode(patientId, strategyId, surveyIds) {
            if (!patientId || !strategyId || strategyId.length === 0) return responseFromError(400);
            return await client.fetchJSON(RequestMethod.POST, `${path}/${patientId}/code/${strategyId}/send`, surveyIds);
        }
    };
};


export default projectPatientService;


