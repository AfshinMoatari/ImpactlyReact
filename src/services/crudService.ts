import { RequestMethod, RestClient } from "./restClient";
import RestResponse, { responseFromError } from "../models/rest/RestResponse";
import Identifiable from "../models/Identifyable";


export interface RequestFunction<Request> {
    (element: Partial<Request>): RestResponse<Request>;
}

export interface ListRequestFunction<T> {
    (): RestResponse<T[]>;
}

export interface IdListRequestFunction<T> {
    (id: string): RestResponse<T[]>;
}

export interface IdRequestFunction<Response> {
    (id: string): RestResponse<Response>;
}

export interface BindOneFunction<Response> {
    (relationId: string, elementId: string): RestResponse<Response>;
}

export interface BulkUploadRequestFunction<Request> {
    (element: Partial<Request>[]): RestResponse<Request>;
}

export interface AnonPatientsRequestFunction<Request> {
    (element: Partial<Request>[]): RestResponse<Request>;
}

export interface ActivatePatientsRequestFunction<Request> {
    (element: Partial<Request>[]): RestResponse<Request>;
}

export interface CrudServiceType<Request extends Partial<Identifiable>> {
    path: string;
    readPage: ListRequestFunction<Required<Request>>;
    readOne: IdRequestFunction<Request>;
    create: RequestFunction<Request>;
    createBulk: BulkUploadRequestFunction<Request>;
    anonPatients: AnonPatientsRequestFunction<Request>;
    activatePatients: ActivatePatientsRequestFunction<Request>;
    update: RequestFunction<Request>;
    delete: RequestFunction<{ id?: string } | string>;
}

export function crudService<Request extends Partial<Identifiable>>(
    client: RestClient,
    path: string,
): CrudServiceType<Request> {
    const elementPath = (id: string) => '' + path + '/' + id;
    return {
        path,
        async readPage() {
            return await client.fetchJSON(RequestMethod.GET, path);
        },
        async readOne(id: string) {
            if (!id) return responseFromError(400);
            return client.fetchJSON(RequestMethod.GET, elementPath(id));
        },
        async create(element) {
            return client.fetchJSON(RequestMethod.POST, path, element);
        },
        async createBulk(bulkUpload) {
            return client.fetchJSON(RequestMethod.POST, path, bulkUpload);
        },
        async anonPatients(anonBatch) {
            return client.fetchJSON(RequestMethod.PUT, path, anonBatch);
        },
        async activatePatients(activateBatch) {
            return client.fetchJSON(RequestMethod.PUT, path, activateBatch);
        },
        async update(element) {
            if (!element.id) return responseFromError(400);
            return client.fetchJSON(RequestMethod.PUT, elementPath(element.id), element);
        },
        async delete(value) {
            const id = typeof value === 'string' ? value : value.id;
            if (!id) return responseFromError(400);
            return await client.fetchJSON(RequestMethod.DELETE, elementPath(id));
        },
    };
}