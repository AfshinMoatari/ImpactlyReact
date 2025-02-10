import Identifiable from "../models/Identifyable";
import { useAuth } from "../providers/authProvider";
import { CrudServiceType } from "../services/crudService";
import { useCrudListQuery } from "./useCrudListQuery";
import { useCrudQuery } from "./useCrudQuery";
import ProjectUser from "../models/ProjectUser";
import { ProjectPatientServiceType } from "../services/projectPatientService";
import { ProjectStrategyServiceType } from "../services/projectStrategyService";
import { ProjectReportServiceType } from "../services/projectReportService";
import { ProjectTagServiceType } from "../services/projectTagService";
import { Notification } from "../models/Notifications";
import { useBulkUploadAction } from "./useBulkUploadAction";
import { ProjectBulkUploadServiceType } from "../services/projectBulkUploadService";
import { ProjectAnonPatientsServiceType } from "../services/projectAnonPatientsService";
import { Survey } from "../models/Survey";
import projectAnalyticsService, {
  projectAnalyticsServiceType,
} from "../services/projectAnalyticsService";
import { ProjectActivationPatientsServiceType } from "../services/ProjectActivationPatientsService";

export interface ProjectQueryServices {
  readonly projectUsers: CrudServiceType<ProjectUser>;
  readonly projectNotifications: CrudServiceType<Notification>;
  readonly projectSurvey: CrudServiceType<Survey>;
  readonly projectPatients: ProjectPatientServiceType;
  readonly projectStrategies: ProjectStrategyServiceType;
  readonly projectReports: ProjectReportServiceType;
  readonly projectTags: ProjectTagServiceType;
  readonly projectAnalytics: projectAnalyticsServiceType;
}

export interface ProjectBulkQueryServices {
  readonly projectBulkUploadCitizens: ProjectBulkUploadServiceType;
  readonly projectAnonPatients: ProjectAnonPatientsServiceType;
  readonly projectActivationPatients: ProjectActivationPatientsServiceType;
}

export const useProjectCrudListQuery = <T extends Identifiable>(
  selector: (services: ProjectQueryServices) => CrudServiceType<T>
) => {
  const projectId = useAuth().currentProjectId;
  return useCrudListQuery(
    ({
      projectUsers,
      projectSurveys,
      projectStrategies,
      projectPatients,
      projectReports,
      projectTags,
      projectNotifications,
      projectAnalytics,
    }) =>
      selector({
        projectUsers: projectUsers(projectId),
        projectStrategies: projectStrategies(projectId),
        projectSurvey: projectSurveys(projectId),
        projectPatients: projectPatients(projectId),
        projectReports: projectReports(projectId),
        projectTags: projectTags(projectId),
        projectNotifications: projectNotifications(projectId),
        projectAnalytics: projectAnalytics(projectId),
      })
  );
};

export const useProjectCrudQuery = <T extends Identifiable>(
  id: string,
  selector: (service: ProjectQueryServices) => CrudServiceType<T>
) => {
  const projectId = useAuth().currentProjectId;
  return useCrudQuery(
    id,
    ({
      projectUsers,
      projectStrategies,
      projectPatients,
      projectReports,
      projectTags,
      projectNotifications,
      projectSurveys,
      projectAnalytics,
    }) =>
      selector({
        projectUsers: projectUsers(projectId),
        projectPatients: projectPatients(projectId),
        projectStrategies: projectStrategies(projectId),
        projectReports: projectReports(projectId),
        projectSurvey: projectSurveys(projectId),
        projectTags: projectTags(projectId),
        projectNotifications: projectNotifications(projectId),
        projectAnalytics: projectAnalytics(projectId),
      })
  );
};

export const useProjectBulkActionQuery = <T extends Identifiable>(
  selector: (services: ProjectBulkQueryServices) => CrudServiceType<T>
) => {
  const projectId = useAuth().currentProjectId;
  return useBulkUploadAction(
    ({ projectBulkUploadCitizens, projectAnonPatients, projectActivationPatients }) =>
      selector({
        projectBulkUploadCitizens: projectBulkUploadCitizens(projectId),
        projectAnonPatients: projectAnonPatients(projectId),
        projectActivationPatients: projectActivationPatients(projectId),
      })
  );
};
