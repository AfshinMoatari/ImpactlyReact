import {ListRequestFunction} from "./crudService";
import {RequestMethod, RestClient} from "./restClient";
import {AdminUser, OverviewUser} from "../models/AuthUser";
import RestResponse from "../models/rest/RestResponse";
import {Survey} from "../models/Survey";
import SROIReport, {UpdateSroiRequest} from "../models/SROIReport";

export interface AdminServiceType {
    path: string;
    getUsers: ListRequestFunction<OverviewUser>;
    getSurveys: (projectId: string) => RestResponse<Survey[]>;
    createAdminUser: (userId: string) => RestResponse<AdminUser>;
    createProjectSurvey: (projectId: string, survey: Survey) => RestResponse<Survey>;
    updateProjectSurvey: (projectId: string, survey: Survey) => RestResponse<Survey>;
    deleteProjectSurvey: (projectId: string, surveyId: string) => RestResponse<Survey>;
    setSroiURL: (projectId: string, sroiUrlRequest: UpdateSroiRequest) => RestResponse<SROIReport>;
}

export const adminService = (client: RestClient, path: string): AdminServiceType => {
    return {
        path,
        async getUsers() {
            const response = await client.fetchJSON<OverviewUser[]>(RequestMethod.GET, `${path}/users`);
            const value = response.success ? response.value : [];
            return {
                ...response,
                value
            }
        },
        async createAdminUser(userId) {
            return await client.fetchJSON<AdminUser>(RequestMethod.POST, `${path}/${userId}`);
        },
        async getSurveys(pid) {
            const response = await client.fetchJSON<Survey[]>(RequestMethod.GET, `${path}/projects/${pid}/surveys`);
            const value = response.success ? response.value : [];
            return {
                ...response,
                value
            }
        },
        async createProjectSurvey(pid, survey) {
            return await client.fetchJSON<Survey>(RequestMethod.POST, `${path}/projects/${pid}/surveys`, survey as any);
        },
        async updateProjectSurvey(pid, survey) {
            return await client.fetchJSON<Survey>(RequestMethod.PUT, `${path}/projects/${pid}/surveys`, survey as any);
        },
        async deleteProjectSurvey(pid, sid) {
            return await client.fetchJSON(RequestMethod.DELETE, `${path}/projects/${pid}/surveys/${sid}`);
        },
        async setSroiURL(pid, sroiUrlRequest) {
            return await client.fetchJSON<SROIReport>(RequestMethod.PUT, `${path}/projects/${pid}/sroi/`, sroiUrlRequest as any);
        }
    };
};

export default adminService;
