import Identifiable from "../models/Identifyable";
import {useAppServices} from "../providers/appServiceProvider";
import {useQuery, useQueryClient} from "react-query";
import {useState} from "react";
import {RestErrorResponse} from "../models/rest/RestResponse";
import snackbarProvider from "../providers/snackbarProvider";
import {OverviewUser} from "../models/AuthUser";

interface AdminQuery {
    users: OverviewUser[];
}

export const useAdminQuery = <T extends Identifiable>() => {
    const services = useAppServices();
    const service = services.admin;

    const queryClient = useQueryClient();
    const queryKey = service.path;

    const [error, setError] = useState<RestErrorResponse | undefined>();

    const getUsers = async () => {
        const response = await service.getUsers();
        if (!response.success) {
            return handleFeedback(response);
        }
        return response.value;
    }

    const createAdminUser = async (userId: string) => {
        const response = await service.createAdminUser(userId);
        if (!response.success) {
            return handleFeedback(response);
        }

        const previous = queryClient.getQueryData(queryKey)
        queryClient.setQueryData(queryKey, (old: unknown) => {
            if (!Array.isArray(old)) return [response.value];
            const index = old.findIndex(e => e.id === response.value.id);
            const next = [...old];
            index === -1 ? next.unshift(response.value) : (next[index] = response.value);
            return next;
        })

        return {previous}
    }

    const query = useQuery<AdminQuery>({
        queryKey: queryKey,
        queryFn: async () => {
            return {
                users: await getUsers() ?? [],
                createAdminUser,
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