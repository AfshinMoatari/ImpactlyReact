import {RequestMethod, RestClient} from "./restClient";
import {crudService, CrudServiceType} from "./crudService";
import Report from "../models/Report";
import RestResponse, {responseFromError} from "../models/rest/RestResponse";
import ReportCode from "../models/codes/ReportCode";


export type ProjectReportServiceType = CrudServiceType<Report> & {
    updateImage: (id: string, file: File, title?: string, description?: string) => RestResponse<Report>;
    shareReport: (reportId: string) => RestResponse<ReportCode>;
};

export const projectReportService = (client: RestClient, path: string)
    : ProjectReportServiceType => {
    return {
        ...crudService<Report>(client, path),
        async shareReport(reportId) {
            return await client.fetchJSON<ReportCode>(RequestMethod.POST, `${path}/${reportId}/share`);
        },
        async updateImage(id, file, title, description) {
            if (file === undefined) return responseFromError(400);
            const requestBody = new FormData();
            requestBody.append("file", file);
            if(title != undefined) requestBody.append("title", title);
            if(description != undefined) requestBody.append("description", description);
            return client.fetchForm(RequestMethod.PUT, `${path}/${id}/image`, requestBody);
        }
    };
};
