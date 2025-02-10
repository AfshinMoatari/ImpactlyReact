import {RequestMethod, RestClient} from "./restClient";
import ProjectPatient from "../models/ProjectPatient";
import {crudService, CrudServiceType} from "./crudService";
import RestResponse from "../models/rest/RestResponse";


export interface ProjectBulkUploadServiceType extends CrudServiceType<ProjectPatient> {
    createBulkUpload: (projectId: string, bulkUpload: ProjectPatient[]) => RestResponse<void>;
}

export const projectBulkUploadService = (client: RestClient, path: string): ProjectBulkUploadServiceType => {
    return {
        ...crudService<ProjectPatient>(client, path),
        async createBulkUpload(projectId, bulkUpload) {
            return await client.fetchJSON<void>(RequestMethod.POST, `${path}/${projectId}/upload/citizens/`, bulkUpload);
        },
    };
};

export default projectBulkUploadService;


