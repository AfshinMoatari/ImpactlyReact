import {RequestMethod, RestClient} from "./restClient";
import {crudService, CrudServiceType} from "./crudService";
import {Notification} from '../models/Notifications'
import RestResponse, { responseFromError } from "../models/rest/RestResponse";

export interface ProjectNotificationServiceType extends CrudServiceType<Notification> {
    readonly deleteAll: (notifications: Notification[]) => RestResponse<boolean>;
}

export const ProjectNotificationService = (client: RestClient, path: string,): ProjectNotificationServiceType => {
    return {
        ...crudService<Notification>(client, path),
        async deleteAll(notifications) {
            if (notifications.length === 0) return responseFromError(400);
            return await client.fetchJSON<boolean>(RequestMethod.POST, `${path}/deleteall`, notifications);
        }
    };
}

export default ProjectNotificationService;
