import { RequestMethod, RestClient } from "./restClient";
import { crudService, CrudServiceType } from "./crudService";
import Analytics from "../models/Analytics";
import RestResponse from "../models/rest/RestResponse";
import { SroiFlow } from "../models/SROIFlow";

export type projectAnalyticsServiceType = CrudServiceType<Analytics> & {
  getSROIFormValuesByAnalyticId: (
    analyticId: string
  ) => RestResponse<SroiFlow>;
  copyAnalyticReport: (analyticId: string) => RestResponse<SroiFlow>;
  create: (req: any) => RestResponse<SroiFlow>;
  edit: (req: any) => RestResponse<SroiFlow>;
};

export const projectAnalyticsService = (
  client: RestClient,
  path: string
): projectAnalyticsServiceType => {
  return {
    ...crudService<Analytics>(client, path),
    async getSROIFormValuesByAnalyticId(analyticId) {
      return await client.fetchJSON(
        RequestMethod.GET,
        `${path}/${analyticId}/config`
      );
    },
    async copyAnalyticReport(analyticId) {
      return await client.fetchJSON(
        RequestMethod.POST,
        `${path}/${analyticId}`
      );
    },
    async create(req) {
      return await client.fetchJSON(
        RequestMethod.POST,
        `${path}/v2/create`,
        req
      );
    },
    async edit(req) {
      return await client.fetchJSON(
        RequestMethod.PUT,
        `${path}/v2/edit/${req.id}`,
        req
      );
    },
  };
};

export default projectAnalyticsService;
