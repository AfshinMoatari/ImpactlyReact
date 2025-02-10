import {crudService, CrudServiceType} from "./crudService";
import {RequestMethod, RestClient} from "./restClient";
import ProjectTag from "../models/ProjectTag";
import RestResponse from "../models/rest/RestResponse";

export type ProjectTagServiceType = CrudServiceType<ProjectTag> & {
    archiveTag: (tagId: string) => RestResponse<ProjectTag>
};

export const projectTagService = (client: RestClient, path: string): ProjectTagServiceType => {
    return {
        ...crudService<ProjectTag>(client, path),
        async readPage() {
            const res = await client.fetchJSON<ProjectTag[]>(RequestMethod.GET, path);
            if (!res.success) return res;
            const filtered = res.value.filter(tag => tag.deletedAt === null);
            return {...res, value: filtered}
        },
        async archiveTag(tagId) {
            return await client.fetchJSON(RequestMethod.DELETE, `${path}/${tagId}`)
        }
    };
};

export default projectTagService;


