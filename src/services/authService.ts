import {AuthUser} from "../models/AuthUser";
import SignInResponse from "../models/rest/SignInRespose";
import {RegisterUserRequest} from "../pages/project/auth/RegisterUserForm";
import ProjectAuthResponse from "../models/ProjectAuthResponse";
import RestResponse from "../models/rest/RestResponse";
import {RequestMethod, RestClient} from "./restClient";
import {StorageServiceType} from "./storageService";
import Authorization from "../models/Authorization";

export interface AuthServiceType {
    path: string;
    fetchAuthorization: () => RestResponse<Required<SignInResponse>>;
    signInWithEmail: (email: string, password: string) => RestResponse<SignInResponse>;
    signInWithProject: (projectId: string) => RestResponse<ProjectAuthResponse>;
    signInWithAdmin: (adminId: string) => RestResponse<Authorization>;
    forgotPassword: (email: string) => RestResponse<undefined>;
    register: (request: RegisterUserRequest, token: string) => RestResponse<Required<AuthUser>>;
    resetPassword: (password: string, token: string) => RestResponse<undefined>;
    accessProjectAsAdmin: (projectId: string) => RestResponse<ProjectAuthResponse>;
}

export const authService = (client: RestClient, storage: StorageServiceType, path: string): AuthServiceType => {
    return {
        path,
        fetchAuthorization() {
            return client.fetchJSON(RequestMethod.GET, path);
        },
        async signInWithEmail(email, password) {
            const response = await client.fetchJSON<SignInResponse>(RequestMethod.POST, path, {
                email: email,
                password: password,
            });
            if (response.success) {
                storage.setAuthorization(response.value.authorization)
            }
            return response;
        },
        async signInWithProject(projectId) {
            const response = await client.fetchJSON<ProjectAuthResponse>(RequestMethod.POST, `${path}/projects/${projectId}`);
            if (response.success) {
                storage.setAuthorization({
                    ...storage.getAuthorization(),
                    ...response.value.authorization
                })
            }
            return response;
        },
        async signInWithAdmin(adminId) {
            const response = await client.fetchJSON<Authorization>(RequestMethod.POST, `${path}/admins/${adminId}`);
            if (response.success) {
                storage.setAuthorization({
                    ...storage.getAuthorization(),
                    ...response.value
                })
            }
            return response;
        },
        async accessProjectAsAdmin(projectId) {
            const response = await client.fetchJSON<ProjectAuthResponse>(RequestMethod.POST, `${path}/admins/project/${projectId}`)
            if (response.success) {
                storage.setAuthorization({
                    ...storage.getAuthorization(),
                    ...response.value.authorization
                })
            }
            return response;
        },
        async forgotPassword(email: string) {
            return await client.fetchJSON(RequestMethod.POST, `${path}/forgot-password`, {
                email: email,
            });
        },
        register(request, token) {
            return client.fetchJSON(RequestMethod.POST, `${path}/register`,
                {...request},
                {
                    'Authorization': 'Bearer ' + token,
                });
        },
        async resetPassword(password: string, token: string) {
            return await client.fetchJSON(RequestMethod.POST, `${path}/reset-password`,
                {password: password,},
                {
                    'Authorization': 'Bearer ' + token
                });
        }
    }
};

export default authService;