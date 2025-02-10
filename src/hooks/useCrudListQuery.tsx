import Identifiable from "../models/Identifyable";
import { useQuery, useQueryClient } from "react-query";
import { createRef, useState } from "react";
import RestResponse, { RestErrorResponse } from "../models/rest/RestResponse";
import { CrudServiceType } from "../services/crudService";
import snackbarProvider from "../providers/snackbarProvider";
import { useAppServices } from "../providers/appServiceProvider";
import { AppRestServiceType } from "../services/appServices";

export const useCrudListQuery =
    <T extends Identifiable>(selector: (services: AppRestServiceType) => CrudServiceType<T>) => {
        const services = useAppServices();
        const service = selector(services);

        const queryClient = useQueryClient();
        const queryKey = service.path;

        const [error, setError] = useState<RestErrorResponse | undefined>();
        const [selected, setSelected] = useState<T | undefined>();
        const submitButtonRef = createRef<HTMLButtonElement>();
        const query = useQuery<T[]>({
            queryKey: queryKey,
            queryFn: async () => {
                const response = await service.readPage();
                if (!response.success) {
                    handleFeedback(response)
                    return []
                }
                return response.value;
            },
            staleTime: Infinity,
            cacheTime: Infinity,
        });

        const handleFeedback = (response: RestErrorResponse) => {
            setError(response);
            return snackbarProvider.showFeedback(response.feedback);
        }

        const create = async (value: Partial<T>) => {
            await queryClient.cancelQueries(queryKey)
            const response = await service.create(value);
            if (!response.success) {
                handleFeedback(response);
                return response;
            }

            const previous = queryClient.getQueryData<T>(queryKey)
            const next: T[] = queryClient.setQueryData(queryKey, (old: unknown) => {
                if (!Array.isArray(old)) return [response.value];
                return [response.value, ...old];
            })
            return { previous, next }
        }

        const invalidate = async () => queryClient.invalidateQueries(queryKey);

        return {
            key: queryKey,
            query: query,
            client: queryClient,
            elements: query.data ?? [],
            error,
            selected,
            setSelected,
            submitButtonRef,
            invalidate,
            create,
            async updateQuery<Service extends CrudServiceType<T>>(func: (service: Service) => RestResponse<T>) {
                const response = await func(service as Service);
                if (!response.success) {
                    return handleFeedback(response)
                }
                const value = response.value;

                const previous = queryClient.getQueryData(queryKey)
                const next = queryClient.setQueryData(queryKey, (old: unknown) => {
                    if (!Array.isArray(old)) return [value];
                    const index = old.findIndex(e => e.id === value.id);
                    const next = [...old];
                    index === -1 ? next.unshift(value) : (next[index] = value);
                    return next;
                })
                return { previous, next }
            },
            update: async (value: T) => {
                if (!value.id) return create(value);

                await queryClient.cancelQueries(queryKey)
                const response = await service.update(value);
                if (!response.success) {
                    handleFeedback(response);
                    return response;
                }

                const previous = queryClient.getQueryData(queryKey)
                queryClient.setQueryData(queryKey, (old: unknown) => {
                    if (!Array.isArray(old)) return [value];
                    const index = old.findIndex(e => e.id === value.id);
                    const next = [...old];
                    index === -1 ? next.unshift(value) : (next[index] = value);
                    return next;
                })
                return { previous }
            },
            delete: async (value: { id?: string } | string) => {
                await queryClient.cancelQueries(queryKey)

                const response = await service.delete(value);
                if (!response.success) {
                    handleFeedback(response);
                    return response;
                }

                queryClient.setQueryData(queryKey, (old: unknown) => {
                    if (!Array.isArray(old)) return [];
                    const id = typeof value === 'string' ? value : value.id;
                    return old.filter(e => e.id !== id);
                })
            },
        }
    }