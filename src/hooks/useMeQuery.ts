import {useAppServices} from "../providers/appServiceProvider";
import {useQuery, useQueryClient} from "react-query";
import {useState} from "react";
import {RestErrorResponse} from "../models/rest/RestResponse";
import snackbarProvider from "../providers/snackbarProvider";
import Project from "../models/Project";

interface MeQuery {
    projects: Project[]
}

export const useMeQuery = () => {
    const services = useAppServices();
    const service = services.me;
    const queryKey = service.path;

    const [error, setError] = useState<RestErrorResponse | undefined>();

    const getProjects = async () => {
        const response = await service.getProjects();
        if (!response.success) {
            return handleFeedback(response);
        }
        return response.value;
    }

    const query = useQuery<MeQuery>({
        queryKey: queryKey,
        queryFn: async () => {
            return {
                projects: await getProjects() ?? []
            }
        },
        staleTime: Infinity,
        cacheTime: Infinity,
    });

    const handleFeedback = (response: RestErrorResponse) => {
        setError(response);
        return snackbarProvider.showFeedback(response.feedback);
    }

    return {
        query: query,
        elements: query.data,
        error
    }
}