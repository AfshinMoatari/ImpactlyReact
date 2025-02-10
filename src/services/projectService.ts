import Project from "../models/Project";
import {crudService, CrudServiceType} from "./crudService";
import {RestClient} from "./restClient";

export type ProjectServiceType = CrudServiceType<Project>;

export const projectService = (client: RestClient, path: string): ProjectServiceType => {
    return {
        ...crudService<Project>(client, path)
    };
};

export default projectService;


