import {RequestMethod, RestClient} from "./restClient";
import {crudService, CrudServiceType} from "./crudService";
import ProjectUser from "../models/ProjectUser";
import RestResponse from "../models/rest/RestResponse";

export interface ProjectUserServiceType extends CrudServiceType<ProjectUser> {
    invite: (userId: string) => RestResponse<null>
}

export const projectUserService = (client: RestClient, path: string,): ProjectUserServiceType => {
    return {
        ...crudService<ProjectUser>(client, path),
        async invite(userId) {
            return client.fetchJSON(RequestMethod.POST, `${path}/${userId}/invite`);
        }
    };
}

export default projectUserService;