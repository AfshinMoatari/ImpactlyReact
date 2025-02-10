import {RequestMethod, RestClient} from "./restClient";
import ProjectPatient from "../models/ProjectPatient";
import {crudService, CrudServiceType} from "./crudService";
import RestResponse from "../models/rest/RestResponse";


export interface ProjectAnonPatientsServiceType extends CrudServiceType<ProjectPatient> {
    anonymizePatients: (id: string, anonimity: ProjectPatient[]) => RestResponse<void>;
}

export const projectAnonPatientsService = (client: RestClient, path: string): ProjectAnonPatientsServiceType => {
    return {
        ...crudService<ProjectPatient>(client, path),
        async anonymizePatients(projectId, anonymity) {
            return await client.fetchJSON<void>(RequestMethod.PUT, `${path}/${projectId}/patients/anonymity/`, anonymity);
        },
    };
};

export default projectAnonPatientsService;


