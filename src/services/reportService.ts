import { RequestMethod, RestClient } from "./restClient";
import { IdRequestFunction } from "./crudService";
import RestResponse, { responseFromError } from "../models/rest/RestResponse";
import Report, { ReportModuleConfig } from "../models/Report";
import {
  NumericRegistration,
  StatusRegistration,
  IncidentRegistration,
  ChartDatas,
} from "../models/Registration";

export interface BarChartData {
  type: "custom";
  chartDatas: ChartDatas[];
  populationSize: { [key: string]: number };
  sampleSizes: { [key: string]: number };
}

export interface CorrelativeDistributionStats {
  fieldId: string;
  fieldText: string;
  datePeriod: DatePeriod;
  smallN: number;
  bigN: number;
  answerRate: number;
  comments: string | null;
}

export interface DatePeriod {
  start: string;
  end: string;
  isCustomGuideLabelEnabled: boolean;
  label: string | null;
}

export type ReportServiceType = {
  getSurveyStatsData: (
    config: ReportModuleConfig
  ) => RestResponse<BarChartData>;
  getCustomSurveyData: (
    config: ReportModuleConfig
  ) => RestResponse<BarChartData>;
  getCorrelativeDistributionData: (
    config: ReportModuleConfig
  ) => RestResponse<BarChartData>;
  getCorrelativeDistributionStats: (
    config: ReportModuleConfig
  ) => RestResponse<CorrelativeDistributionStats[]>;
  getIncidentData: (
    config: ReportModuleConfig
  ) => RestResponse<IncidentRegistration>;
  getRegistrationData: (
    config: ReportModuleConfig
  ) => RestResponse<NumericRegistration>;
  getStatusData: (
    config: ReportModuleConfig
  ) => RestResponse<StatusRegistration>;
  readReportFromCode: IdRequestFunction<Report>;
};

export const reportService = (
  client: RestClient,
  path: string
): ReportServiceType => {
  return {
    async readReportFromCode(codeId) {
      if (!codeId) return responseFromError(400);
      return await client.fetchJSON(
        RequestMethod.GET,
        `${path}/code/${codeId}`
      );
    },
    async getSurveyStatsData(config) {
      return await client.fetchJSON<BarChartData>(
        RequestMethod.POST,
        `${path}/modules/surveys/validated`,
        config,
        { "Accept-Language": "da-DK" }
      );
    },
    async getCustomSurveyData(config) {
      return await client.fetchJSON<BarChartData>(
        RequestMethod.POST,
        `${path}/modules/surveys/custom`,
        config,
        { "Accept-Language": "da-DK" }
      );
    },
    async getRegistrationData(config: ReportModuleConfig) {
      return await client.fetchJSON<NumericRegistration>(
        RequestMethod.POST,
        `${path}/modules/registrations/numeric`,
        config,
        { "Accept-Language": "da-DK" }
      );
    },
    async getIncidentData(config: ReportModuleConfig) {
      return await client.fetchJSON<IncidentRegistration>(
        RequestMethod.POST,
        `${path}/modules/registrations/incidents`,
        config,
        { "Accept-Language": "da-DK" }
      );
    },
    async getStatusData(config: ReportModuleConfig) {
      return await client.fetchJSON<StatusRegistration>(
        RequestMethod.POST,
        `${path}/modules/registrations/status`,
        config,
        { "Accept-Language": "da-DK" }
      );
    },
    async getCorrelativeDistributionData(config: ReportModuleConfig) {
      return await client.fetchJSON<BarChartData>(
        RequestMethod.POST,
        `${path}/modules/surveys/multiple`,
        config,
        { "Accept-Language": "da-DK" }
      );
    },
    async getCorrelativeDistributionStats(config: ReportModuleConfig) {
      return await client.fetchJSON<CorrelativeDistributionStats[]>(
        RequestMethod.POST,
        `${path}/modules/surveys/multiple/stats`,
        config,
        { "Accept-Language": "da-DK" }
      );
    },
  };
};

export default reportService;
