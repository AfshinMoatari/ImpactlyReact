import { restClient } from "./restClient";
import authService, { AuthServiceType } from "./authService";
import projectService, { ProjectServiceType } from "./projectService";
import meService, { MeServiceType } from "./meService";
import storageService, { StorageServiceType } from "./storageService";
import surveyService, { SurveyServiceType } from "./surveyService";
import projectStrategyService, {
  ProjectStrategyServiceType,
} from "./projectStrategyService";
import projectPatientService, {
  ProjectPatientServiceType,
} from "./projectPatientService";
import dawaService, { DawaServiceType } from "./dawaService";
import adminService, { AdminServiceType } from "./adminService";
import {
  projectReportService,
  ProjectReportServiceType,
} from "./projectReportService";
import projectUserService, {
  ProjectUserServiceType,
} from "./projectUserService";
import reportService, { ReportServiceType } from "./reportService";
import projectTagService, { ProjectTagServiceType } from "./projectTagService";
import projectSurveyService, {
  ProjectSurveyServiceType,
} from "./projectSurveyService";
import projectNotificationService, {
  ProjectNotificationServiceType,
} from "./ProjectNotificationServiceType";
import projectBulkUploadService, {
  ProjectBulkUploadServiceType,
} from "./projectBulkUploadService";
import projectAnonPatientsService, {
  ProjectAnonPatientsServiceType,
} from "./projectAnonPatientsService";
import projectAnalyticsService, {
  projectAnalyticsServiceType,
} from "./projectAnalyticsService";
import ProjectActivationPatientsService, { ProjectActivationPatientsServiceType } from "./ProjectActivationPatientsService";

export const API_ENV: string | undefined =
  process.env.REACT_APP_API_ENV || "development";

export const isDevelopmentMode =
  API_ENV === "development" || API_ENV === "staging";
export const isTestingMode = API_ENV === "testing";
export const isLocalhostMode = API_ENV === "localhost";
export const isNotProd = isDevelopmentMode || isTestingMode || isLocalhostMode;

const PROD_HOST = "https://api.impactly.dk";
const STAGING_HOST = "https://staging.api.impactly.dk";
const TESTING_HOST = "https://testing.api.impactly.dk";
const LOCAL_HOST = "http://localhost:5000";

export const HOST = isLocalhostMode
  ? LOCAL_HOST
  : isTestingMode
    ? TESTING_HOST
    : isDevelopmentMode
      ? STAGING_HOST
      : PROD_HOST;

export interface AppRestServiceType {
  readonly storage: StorageServiceType;
  readonly auth: AuthServiceType;
  readonly me: MeServiceType;
  readonly projects: ProjectServiceType;
  readonly surveys: SurveyServiceType;
  readonly reports: ReportServiceType;
  readonly admin: AdminServiceType;

  readonly projectUsers: (projectId: string) => ProjectUserServiceType;
  readonly projectNotifications: (
    projectId: string
  ) => ProjectNotificationServiceType;
  readonly projectStrategies: (projectId: string) => ProjectStrategyServiceType;
  readonly projectPatients: (projectId: string) => ProjectPatientServiceType;
  readonly projectBulkUploadCitizens: (
    projectId: string
  ) => ProjectBulkUploadServiceType;
  readonly projectReports: (projectId: string) => ProjectReportServiceType;
  readonly projectTags: (projectId: string) => ProjectTagServiceType;
  readonly projectSurveys: (projectId: string) => ProjectSurveyServiceType;
  readonly projectAnonPatients: (
    projectId: string
  ) => ProjectAnonPatientsServiceType;
  readonly projectActivationPatients: (projectId: string) => ProjectActivationPatientsServiceType;
  readonly projectAnalytics: (projectId: string) => projectAnalyticsServiceType;

  readonly dawa: DawaServiceType;
}

export const API_BASE_V1 = "/api/web/v1";
export const API_BASE_V1_projects = "/api/web/v1/projects";

export const PATHS = {
  auth: `${API_BASE_V1}/auth`,
  me: `${API_BASE_V1}/me`,
  surveys: `${API_BASE_V1}/surveys`,
  admin: `${API_BASE_V1}/admins`,
  reports: `${API_BASE_V1}/reports`,

  projects: `${API_BASE_V1_projects}`,
  projectUsers: (pid: string) => `${API_BASE_V1_projects}/${pid}/users`,
  projectStrategies: (pid: string) =>
    `${API_BASE_V1_projects}/${pid}/strategies`,
  projectStrategy: (pid: string, sid: string) =>
    `${API_BASE_V1_projects}/${pid}/strategies/${sid}`,
  projectPatients: (pid: string) => `${API_BASE_V1_projects}/${pid}/patients`,
  projectBulkUploadCitizens: (pid: string) =>
    `${API_BASE_V1}/me/projects/${pid}/upload/citizens/`,
  projectReports: (pid: string) => `${API_BASE_V1_projects}/${pid}/reports`,
  projectTags: (pid: string) => `${API_BASE_V1_projects}/${pid}/tags`,
  projectSurveys: (pid: string) => `${API_BASE_V1_projects}/${pid}/surveys`,
  projectNotifications: (pid: string) =>
    `${API_BASE_V1_projects}/${pid}/notifications`,
  projectAnonPatients: (pid: string) =>
    `${API_BASE_V1_projects}/${pid}/patients/anonymity`,
  projectActivationsQuery: (pid: string) =>
    `${API_BASE_V1_projects}/${pid}/patients/activation`,
  projectAnalytics: (pid: string) => `${API_BASE_V1_projects}/${pid}/analytics`,
};
export const client = restClient(HOST, storageService(HOST));
export const appServices = (): AppRestServiceType => {
  const storage = storageService(HOST);
  const client = restClient(HOST, storage);
  return {
    storage,
    auth: authService(client, storage, PATHS.auth),
    me: meService(client, PATHS.me),
    surveys: surveyService(client, PATHS.surveys),
    admin: adminService(client, PATHS.admin),
    reports: reportService(client, PATHS.reports),

    projects: projectService(client, PATHS.projects),
    projectUsers: (projectId) =>
      projectUserService(client, PATHS.projectUsers(projectId)),
    projectStrategies: (projectId) =>
      projectStrategyService(client, PATHS.projectStrategies(projectId)),
    projectPatients: (projectId) =>
      projectPatientService(client, PATHS.projectPatients(projectId)),
    projectBulkUploadCitizens: (projectId) =>
      projectBulkUploadService(
        client,
        PATHS.projectBulkUploadCitizens(projectId)
      ),
    projectReports: (projectId) =>
      projectReportService(client, PATHS.projectReports(projectId)),
    projectTags: (projectId) =>
      projectTagService(client, PATHS.projectTags(projectId)),
    projectSurveys: (projectId) =>
      projectSurveyService(client, PATHS.projectSurveys(projectId)),
    projectNotifications: (projectId) =>
      projectNotificationService(client, PATHS.projectNotifications(projectId)),
    projectAnonPatients: (projectId) =>
      projectAnonPatientsService(client, PATHS.projectAnonPatients(projectId)),
    projectActivationPatients: (projectId) =>
      ProjectActivationPatientsService(client, PATHS.projectActivationsQuery(projectId)),
    projectAnalytics: (projectId) =>
      projectAnalyticsService(client, PATHS.projectAnalytics(projectId)),
    dawa: dawaService(),
  };
};
