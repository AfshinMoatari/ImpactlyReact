import {useAuth} from "../providers/authProvider";
import {useAppServices} from "../providers/appServiceProvider";
import {UseQueryResult, useQuery, useQueryClient} from "react-query";
import {Survey} from "../models/Survey";
import {AppRestServiceType} from "../services/appServices";
import { RestErrorResponse, RestSuccessResponse } from "../models/rest/RestResponse";
import { useState } from "react";
import snackbarProvider from "../providers/snackbarProvider";

interface ProjectSurveyQuery {
    surveys: Survey[]
}
interface returnType {
    surveys: Survey[],
    loading: boolean, 
    query: UseQueryResult<ProjectSurveyQuery, unknown>,
    data: ProjectSurveyQuery | undefined,
    error: RestErrorResponse | undefined,
    updateProjectSurvey: (survey: Survey) => Promise<void | RestSuccessResponse<Survey>>,
    deleteProjectSurvey: (surveyId: string) => Promise<RestErrorResponse | RestSuccessResponse<string | {
        id?: string | undefined;
    }>>
}
export const useProjectSurveys = (projectId: string, services: AppRestServiceType): returnType => {
    const service = services.projectSurveys(projectId);
    const queryClient = useQueryClient();
    const queryKey = service.path;
    const [error, setError] = useState<RestErrorResponse | undefined>();
    const projectQuery = useQuery<Survey[]>({
        queryKey: `${projectId}-surveys`,
        queryFn: async () => {
            const res = await services.projectSurveys(projectId).readPage();
            if (!res.success) return []
            return res.value;
        },
        staleTime: Infinity,
        cacheTime: Infinity
    });
    const getSurveys = async () => {
        const response = await service.readPage();
        if (!response.success) {
            return handleFeedback(response);
        }
        return response.value;
    };
    const updateProjectSurvey = async (survey: Survey) => {
        const response = survey.id
            ? await service.update(survey)
            : await service.create(survey);
        if (!response.success) {
            return handleFeedback(response);
        }
        snackbarProvider.success(survey.id ? "Opdateret med success" : "Oprettet med success!");

        queryClient.setQueryData(queryKey, (old: unknown) => {
            const surveys = (old as ProjectSurveyQuery)["surveys"];
            if (!Array.isArray(surveys)) return {surveys: [response.value]};
            const next = [...surveys, response.value]
            return {surveys: next};
        })

        return response;
    }

    const deleteProjectSurvey = async (surveyId: string) => {
        const response = await service.delete(surveyId);
        if (!response.success) {
            handleFeedback(response);
            return response;
        }

        snackbarProvider.success("Slettet med succes!");

        const previous = queryClient.getQueryData(queryKey)
        queryClient.setQueryData(queryKey, (old: any) => {
            const surveys = (old as ProjectSurveyQuery)["surveys"];
            if (!Array.isArray(surveys)) return {surveys: [response.value]};
            const next = surveys.filter(s => s.id !== surveyId);
            return {surveys: next};
        })

        return response;
    }
    const query = useQuery<ProjectSurveyQuery>({
        queryKey: queryKey,
        queryFn: async () => {
            return {
                surveys: await getSurveys() ?? [],
            }
        },
        staleTime: Infinity,
        cacheTime: Infinity,
        enabled: true,
    });

    const projectSurveys = (projectQuery.data ?? []).map(s => ({...s, validated: false}))

    return {
       surveys: projectSurveys, 
        loading: projectQuery.isLoading, 
        query: query,
        data: query.data,
        error: error,
        updateProjectSurvey: updateProjectSurvey,
        deleteProjectSurvey: deleteProjectSurvey,
    };
}

export const useTemplateSurveys = (projectId: string, services: AppRestServiceType): [Survey[], boolean] => {
    const templateQuery = useQuery<Survey[]>({
        queryKey: `template-surveys`,
        queryFn: async () => {
            const res = await services.surveys.readPage();
            if (!res.success) return []
            return res.value;
        },
        staleTime: Infinity,
        cacheTime: Infinity
    });


    const templateSurveys = (templateQuery.data ?? []).map(s => ({...s, validated: true}));

    return [templateSurveys, templateQuery.isLoading];
}

const useSurveys = (): [Survey[], boolean] => {
    const projectId = useAuth().currentProjectId;
    const services = useAppServices();

    const [templateSurveys, templateLoading] = useTemplateSurveys(projectId, services);
    const returnType = useProjectSurveys(projectId, services);

    const loading: boolean = templateLoading || returnType.loading;
    const surveys: Survey[] =  [...templateSurveys, ...returnType.surveys];

    return [surveys, loading];
}
function handleFeedback(response: any) {
    console.log(response)
}

export default useSurveys
