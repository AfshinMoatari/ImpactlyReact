import {RequestMethod, RestClient} from "./restClient";
import RestResponse from "../models/rest/RestResponse";
import UserProject from "../models/UserProject";

export type MeServiceType = {
    path: string;
    getProjects: () => RestResponse<Required<UserProject[]>>;
};

export const meService = (client: RestClient, path: string): MeServiceType => {
    return {
        path,
        getProjects: async () => {
            return client.fetchForm(RequestMethod.GET, `${path}/projects`)
        }
    }
};

export default meService;