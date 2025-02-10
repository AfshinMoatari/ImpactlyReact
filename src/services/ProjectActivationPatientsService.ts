import { RequestMethod, RestClient } from "./restClient";
import ProjectPatient from "../models/ProjectPatient";
import { crudService, CrudServiceType } from "./crudService";
import RestResponse from "../models/rest/RestResponse";


export interface ProjectActivationPatientsServiceType extends CrudServiceType<ProjectPatient> {
    activationPatients: (id: string, activation: ProjectPatient[]) => RestResponse<void>;
}

export const ProjectActivationPatientsService = (client: RestClient, path: string): ProjectActivationPatientsServiceType => {
    return {
        ...crudService<ProjectPatient>(client, path),
        async activationPatients(projectId, activation) {
            return await client.fetchJSON<void>(RequestMethod.PUT, `${path}/${projectId}/patients/activation/`, activation);
        },
    };
};

export default ProjectActivationPatientsService;


