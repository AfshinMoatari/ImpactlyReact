import React, { createContext, useContext, useEffect, useState } from "react";
import { useAppServices } from "./appServiceProvider";
import { useQueryClient } from "react-query";
import Authorization from "../models/Authorization";
import { AuthUser } from "../models/AuthUser";
import Routes from "../constants/Routes";
import history from "../history";
import Project from "../models/Project";
import snackbarProvider from "./snackbarProvider";
import { RestErrorResponse } from "../models/rest/RestResponse";
import { parseJwt, parseJwtPermissions } from "../lib/jwt";
import DashboardSplash from "../pages/DashboardSplash";

export interface Auth {
    authorization?: Authorization;
    currentUser?: AuthUser;
    currentProject?: Project;
    authenticated: boolean;
    permissions: string[];
}

interface AuthValueType {
    value?: Auth;
    currentUser?: AuthUser;
    permissions: string[];
    currentProject?: Project;
    currentProjectId: string;
    signInAdmin: (email: string, password: string) => void;
    signInProject: (email: string, password: string) => void;
    switchProject: (projectId: string, route?: string) => void;
    refetchCurrentProject: (projectId: string) => void;
    signOut: () => void;
}

export const AuthContext = createContext<AuthValueType | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
    const queryClient = useQueryClient();
    const services = useAppServices();

    const [auth, setAuth] = useState<Auth | undefined>(services.storage.loadAuthState())
    const [splash, setSplash] = useState<boolean>(false)

    const handleFeedback = (response: RestErrorResponse) => {
        return snackbarProvider.showFeedback(response.feedback);
    }

    useEffect(() => {
        if (auth) services.storage.saveAuthState(auth);
    }, [auth, services.storage]);

    const splashRoute = async (func: () => Promise<void>) => {
        setSplash(true);
        await func();
        setSplash(false);
    }

    const getPermissions = (jwt: string) => {
        const parsedJwt = parseJwt(jwt);
        if (!parsedJwt) return [];

        return parseJwtPermissions(parsedJwt);
    }

    const signInAdmin = async (email: string, password: string) => {
        const response = await services.auth.signInWithEmail(email, password);

        if (!response.success) return handleFeedback(response);

        const { user, authorization } = response.value;

        await signInWithAdmin(user, authorization);
        history.push(Routes.adminProjects);
    }

    const signInProject = async (email: string, password: string) => {
        const response = await services.auth.signInWithEmail(email, password);

        if (!response.success) return handleFeedback(response);
        const { user, authorization } = response.value;

        await handleProjectSignIn(user, authorization);
        history.push(Routes.project);
    }

    const handleProjectSignIn = async (user: AuthUser, authorization: Authorization) => {
        const response = await services.me.getProjects();
        if (!response.success) return handleFeedback(response);
        if (response.value.length === 0) return snackbarProvider.warning("Din bruger er ikke forbundet til noget projek");

        const projectId = response.value[0].id;
        await signInWithProject(user, authorization, projectId);
    }

    const signInWithAdmin = async (currentUser: AuthUser, authorization: Authorization) => {

        const response = await services.auth.signInWithAdmin(currentUser.id);
        if (!response.success) return handleFeedback(response);

        authorization.accessToken = response.value.accessToken;

        setAuth({
            authorization,
            currentUser,
            authenticated: true,
            permissions: getPermissions(response.value.accessToken)
        });
    }

    const signInWithProject = async (currentUser: AuthUser, authorization: Authorization, projectId: string) => {
        const response = await services.auth.signInWithProject(projectId);
        if (!response.success) return handleFeedback(response);

        authorization.accessToken = response.value.authorization.accessToken;

        setAuth({
            authorization,
            currentUser,
            currentProject: response.value.project,
            authenticated: true,
            permissions: getPermissions(response.value.authorization.accessToken)
        });
    }

    const refetchCurrentProject = async (projectId: string) => {
        const response = await services.auth.signInWithProject(projectId)
        if (!response.success) return handleFeedback(response);
        auth!.currentProject = response.value.project;
        services.storage.saveAuthState(auth!);
    }

    const switchProject = async (projectId: string, route?: string) => {

        if (projectId === auth?.currentProject?.id) return;

        await splashRoute(async () => {
            const response = await services.auth.fetchAuthorization();
            if (!response.success) return handleFeedback(response);
            const { user, authorization } = response.value;

            await signInWithProject(user, authorization, projectId);
            history.push(route ?? Routes.project);
            queryClient.clear();
        });
    }

    const signOut = () => {
        services.storage.clearStorage();
        queryClient.clear();
        setAuth(undefined);
        history.push(Routes.projectAuth);
    }

    if (splash) return (<DashboardSplash />);

    return (
        <AuthContext.Provider
            value={
                {
                    value: auth,
                    permissions: auth?.permissions ?? [],
                    currentUser: auth?.currentUser,
                    currentProject: auth?.currentProject,
                    currentProjectId: auth?.currentProject?.id ?? "",
                    signInAdmin,
                    signInProject,
                    switchProject,
                    signOut,
                    refetchCurrentProject,
                }
            }
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthValueType => {
    const authQuery = useContext(AuthContext);
    if (!authQuery) throw new Error('useAuth must be used within AuthContext');
    return authQuery;
};