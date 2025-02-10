import {useAppServices} from "../providers/appServiceProvider";
import {useQuery, useQueryClient} from "react-query";
import React, {useState} from "react";
import {RestErrorResponse} from "../models/rest/RestResponse";
import snackbarProvider from "../providers/snackbarProvider";
import {Survey} from "../models/Survey";

interface AdminProjectQuery {
    surveys: Survey[]
}

export const useAdminProjectQuery = (projectId: string) => {
    const services = useAppServices();
    const service = services.admin;

    const queryClient = useQueryClient();
    const queryKey = service.path;

    const [error, setError] = useState<RestErrorResponse | undefined>();

    const getSurveys = async () => {
        const response = await service.getSurveys(projectId);
        if (!response.success) {
            return handleFeedback(response);
        }
        return response.value;
    };

    const upsertProjectSurvey = async (survey: Survey) => {
        const response = survey.id
            ? await service.updateProjectSurvey(projectId, survey)
            : await service.createProjectSurvey(projectId, survey);
        if (!response.success) {
            return handleFeedback(response);
        }
        snackbarProvider.success(survey.id ? "Opdateret med success" : "Oprettet med success!");

        queryClient.setQueryData(queryKey, (old: unknown) => {
            const surveys = (old as AdminProjectQuery)["surveys"];
            if (!Array.isArray(surveys)) return {surveys: [response.value]};
            const next = [...surveys, response.value]
            return {surveys: next};
        })

        return response;
    }

    const deleteProjectSurvey = async (surveyId: string) => {
        const response = await service.deleteProjectSurvey(projectId, surveyId);
        if (!response.success) {
            return handleFeedback(response);
        }

        snackbarProvider.success("Slettet med succes!");

        const previous = queryClient.getQueryData(queryKey)
        queryClient.setQueryData(queryKey, (old: any) => {
            const surveys = (old as AdminProjectQuery)["surveys"];
            if (!Array.isArray(surveys)) return {surveys: [response.value]};
            const next = surveys.filter(s => s.id !== surveyId);
            return {surveys: next};
        })

        return {previous}
    }

    const query = useQuery<AdminProjectQuery>({
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

    const handleFeedback = (response: RestErrorResponse) => {
        setError(response);
        return snackbarProvider.showFeedback(response.feedback);
    }

    React.useEffect(() => {
        query.refetch();
    }, []);

    return {
        query: query,
        elements: query.data,
        error,
        upsertProjectSurvey,
        deleteProjectSurvey,
    }
}