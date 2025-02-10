import Authorization, {emptyAuthorization} from "../models/Authorization";
import {Auth} from "../providers/authProvider";

export interface StorageServiceType {
    saveRemember: (remember: boolean) => void;
    loadRemember: () => boolean;

    saveState: (key: string, state: unknown) => void;
    loadState: <S>(key: string) => S;

    getAuthorization: () => Authorization;
    setAuthorization: (authorization: Authorization) => void;
    getAccessToken: () => string | undefined;
    setAccessToken: (accessToken: string) => void;
    getRefreshToken: () => string | undefined;
    saveAuthState: (state: Auth) => void;
    loadAuthState: () => Auth;

    clearStorage: () => void;
}

export function storageService(host: string): StorageServiceType {
    const AUTH_STATE_KEY = 'AUTH_STATE';
    const REST_AUTH_REMEMBER_KEY = 'REST_AUTH_REMEMBER_KEY';
    const AUTHORIZATION_KEY = 'AUTHORIZATION_KEY';
    const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN_KEY';

    const authorizationKey = [host, AUTHORIZATION_KEY].join('.');
    const accessTokenKey = [host, ACCESS_TOKEN_KEY].join('.');

    return {
        saveRemember(remember) {
            remember ? localStorage.setItem(REST_AUTH_REMEMBER_KEY, `${remember}`) : localStorage.removeItem(REST_AUTH_REMEMBER_KEY);
        },
        loadRemember() {
            return localStorage.getItem(REST_AUTH_REMEMBER_KEY) !== null
        },
        saveState(key, state) {
            const serializedState = JSON.stringify(state);
            const remember = this.loadRemember();
            sessionStorage.setItem(key, serializedState)
            if (remember) {
                localStorage.setItem(key, serializedState);
            }
        },
        loadState(key) {
            const serializedState = sessionStorage.getItem(key) ?? localStorage.getItem(key);
            return serializedState === null ? undefined : JSON.parse(serializedState);
        },
        getAuthorization() {
            const serializedState = localStorage.getItem(authorizationKey) ?? sessionStorage.getItem(authorizationKey);
            return serializedState === null ? emptyAuthorization : JSON.parse(serializedState);
        },
        setAuthorization(authorization: Authorization) {
            const serializedState = JSON.stringify(authorization);
            const storage = this.loadRemember() ? localStorage : sessionStorage;
            storage.setItem(authorizationKey, serializedState)
            storage.setItem(accessTokenKey, authorization?.accessToken)
        },
        getAccessToken() {
            return localStorage.getItem(accessTokenKey) ?? sessionStorage.getItem(accessTokenKey) ?? undefined;
        },
        setAccessToken(accessToken: string) {
            const storage = this.loadRemember() ? localStorage : sessionStorage;
            storage.setItem(accessTokenKey, accessToken)
        },
        getRefreshToken() {
            const authState = localStorage.getItem(AUTH_STATE_KEY) ?? sessionStorage.getItem(AUTH_STATE_KEY) ?? undefined
            if (authState !== undefined) {
                return JSON.parse(authState).authorization.refreshToken;
            }
        },
        saveAuthState(state) {
            this.saveState(AUTH_STATE_KEY, state);
        },
        loadAuthState() {
            return this.loadState<Auth>(AUTH_STATE_KEY);
        },
        clearStorage() {
            const remember = this.loadRemember();
            sessionStorage.clear();
            localStorage.clear();
            this.saveRemember(remember);
        },
    }
}

export default storageService;
