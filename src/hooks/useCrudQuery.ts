import Identifiable from "../models/Identifyable";
import {useQuery, useQueryClient} from "react-query";
import {CrudServiceType} from "../services/crudService";
import RestResponse, {RestErrorResponse} from "../models/rest/RestResponse";
import {useState} from "react";
import snackbarProvider from "../providers/snackbarProvider";
import {useAppServices} from "../providers/appServiceProvider";
import {AppRestServiceType} from "../services/appServices";

export const useCrudQuery = <T extends Identifiable, >
(
    id: string,
    selector: (services: AppRestServiceType) => CrudServiceType<T>
) => {
    const queryClient = useQueryClient();
    const services = useAppServices();
    const service = selector(services)
    const queryKey = `${service.path}/${id}`;

    const fn = async () => {
        if (id) {
            const response = await service.readOne(id);
            if (!response.success) {
                handleFeedback(response)
                return undefined
            }
            return response.value;
        }
    };

    const [error, setError] = useState<RestErrorResponse | undefined>();
    const query = useQuery<T | undefined>({
        queryKey: queryKey,
        queryFn: fn,
        staleTime: Infinity,
        cacheTime: Infinity,
    });

    const handleFeedback = (response: RestErrorResponse) => {
        setError(response);
        return snackbarProvider.showFeedback(response.feedback);
    }

    const invalidate = async () => queryClient.invalidateQueries(queryKey);

    return {
        query: query,
        queryKey,
        value: query.data ?? undefined,
        error,
        invalidate,
        async updateQuery<Service extends CrudServiceType<T>>(func: (service: Service) => RestResponse<T>) {
            const response = await func(service as Service);
            if (!response.success) {
                return handleFeedback(response)
            }
            const value = response.value;

            const previous = queryClient.getQueryData(queryKey)
            const next = queryClient.setQueryData(queryKey, () => {
                return value;
            })
            return {previous, next}
        },
        create: async (value: T) => {
            await queryClient.cancelQueries(queryKey)
            const response = await service.create(value);
            if (!response.success) {
                return handleFeedback(response)
            }

            value.id = response.value.id;
            const previous = queryClient.getQueryData(queryKey)
            const next = queryClient.setQueryData(queryKey, () => {
                return value;
            })
            return {previous, next}
        },
        update: async (request: Partial<T>) => {
            await queryClient.cancelQueries(queryKey)
            const response = await service.update(request);
            if (!response.success) {
                return handleFeedback(response)
            }

            const value = response.value;
            const previous = queryClient.getQueryData(queryKey)
            const next = queryClient.setQueryData(queryKey, () => {
                return value;
            })
            return {previous, next}
        },
        delete: async (value: { id?: string } | string) => {
            await queryClient.cancelQueries(queryKey)

            const response = await service.delete(value);
            if (!response.success) {
                return handleFeedback(response)
            }

            queryClient.setQueryData(queryKey, () => undefined)
        },
    }
}