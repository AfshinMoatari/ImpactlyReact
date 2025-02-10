import Identifiable from "../models/Identifyable";
import {useQueryClient} from "react-query";
import {createRef, useState} from "react";
import {RestErrorResponse} from "../models/rest/RestResponse";
import {CrudServiceType} from "../services/crudService";
import snackbarProvider from "../providers/snackbarProvider";
import {useAppServices} from "../providers/appServiceProvider";
import {AppRestServiceType} from "../services/appServices";

export const useBulkUploadQuery =
    <T extends Identifiable>(selector: (services: AppRestServiceType) => CrudServiceType<T>) => {
        const services = useAppServices();
        const service = selector(services);

        const queryClient = useQueryClient();
        const queryKey = service.path;

        const [error, setError] = useState<RestErrorResponse | undefined>();
        const [selected, setSelected] = useState<T | undefined>();
        const submitButtonRef = createRef<HTMLButtonElement>();

        const handleFeedback = (response: RestErrorResponse) => {
            setError(response);
            return snackbarProvider.showFeedback(response.feedback);
        }

        const createBulk = async (value: Partial<T>[]) => {
            await queryClient.cancelQueries(queryKey)
            const response = await service.createBulk(value);
            if (!response.success) {
                handleFeedback(response);
                return response;
            }
            await queryClient.invalidateQueries(queryKey);
        }

        const invalidate = async () => queryClient.invalidateQueries(queryKey);

        return {
            key: queryKey,
            client: queryClient,
            error,
            selected,
            setSelected,
            submitButtonRef,
            invalidate,
            createBulk
        }
    }