import { CrudServiceType, crudService } from "./crudService";
import { Survey } from "../models/Survey";
import { RestClient } from "./restClient";

export interface ProjectSurveyServiceType extends CrudServiceType<Survey> {
}

export const ProjectSurveyService = (client: RestClient, path: string,): ProjectSurveyServiceType => {
    return {
        ...crudService<Survey>(client, path)
    };
}

export default ProjectSurveyService;
