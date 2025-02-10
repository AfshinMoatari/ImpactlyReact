import Authorization from "../models/Authorization";
import RestResponse, { responseFromError } from "../models/rest/RestResponse";
import { StorageServiceType } from "./storageService";
import { API_BASE_V1 } from "./appServices";

export enum RequestMethod {
    'GET',
    'POST',
    'PUT',
    'DELETE',
}

export interface RestClient {
    host: string;
    fetch: <T>(method: RequestMethod, path: string, body?: BodyInit, headers?: Record<string, string>) => RestResponse<T>;
    fetchJSON: <T>(method: RequestMethod, path: string, body?: Record<string, unknown> | unknown[] | unknown, headers?: Record<string, string>) => RestResponse<T>;
    fetchForm: <T>(method: RequestMethod, path: string, body?: FormData, headers?: Record<string, string>) => RestResponse<T>;
    refreshAuthorization: (refreshToken: string | undefined) => RestResponse<Required<Authorization>>;
    fetchXls: <T>(method: RequestMethod, path: string, body?: Record<string, unknown> | unknown[], headers?: Record<string, string>) => RestResponse<T>;

}

export function restClient(host: string, storage: StorageServiceType, options?: { cache: RequestCache }): RestClient {
    return {
        host,
        refreshAuthorization: async function (refreshToken) {
            if (!refreshToken?.length) return responseFromError(400)
            const response = await this.fetchJSON<Required<Authorization>>
                (RequestMethod.POST, `${API_BASE_V1}/auth/refresh`, { refreshToken: refreshToken });
            if (response.success) {
                storage.setAuthorization(response.value)
            }
            return response;
        },
        fetchForm: async function (method: RequestMethod, path: string, body?: FormData, headers: { [p: string]: string } = {}) {
            return this.fetch(method, path, body, headers)
        },
        fetchJSON: async function (method: RequestMethod, path: string, body?: { [p: string]: string | unknown } | any, headers: { [p: string]: string } = {}) {
            return this.fetch(method, path, JSON.stringify(body), {
                'Content-Type': 'application/json',
                ...headers,
            })
        },
        fetchXls: async function (method: RequestMethod, path: string, body?: { [p: string]: string | unknown } | any, headers: { [p: string]: string } = {}) {
            return this.fetch(method, path, JSON.stringify(body), {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ...headers,
            })
        },
        fetch: async function <T>(method: RequestMethod, path: string, body?: BodyInit, headers: { [p: string]: string } = {}) {
            const url = this.host + path;
            const methodName = RequestMethod[method];
            const authorization = await storage.getAuthorization();
            const authorizationHeader = authorization?.tokenType + ' ' + authorization?.accessToken;
            const response: Response | undefined = await fetch(url, {
                method: methodName,
                mode: 'cors',
                cache: options?.cache ?? 'no-cache',
                credentials: 'same-origin',
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
                headers: {
                    'Authorization': authorizationHeader,
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    ...headers,
                },
                body,
            }).catch(() => {
                return undefined;
            });

            if (response === undefined) {
                return responseFromError(408);
            }

            if (response.status === 401 && !headers["No-Refresh"]) {
                const refreshResponse = await this.refreshAuthorization(authorization.refreshToken);
                if (refreshResponse.success) {
                    return this.fetch(method, path, body, {
                        ...headers,
                        "No-Refresh": 'true',
                    });
                }
            }

            const contentLength = await response.headers.get("content-length");
            const responseBody = (contentLength !== null && Number(contentLength) === 0) ? null : await response.json();

            if (!response.ok) {
                return responseFromError(response.status, responseBody);
            }

            return {
                success: true,
                status: response.status,
                statusText: response.statusText,
                feedback: { severity: 'success', message: '' },
                value: responseBody as T,
            }
        },
    }
}
