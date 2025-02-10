import {useQueryClient} from "react-query";
import {useAuth} from "../providers/authProvider";

const useInvalidate = () => {
    const queryClient = useQueryClient();
    const projectId = useAuth().currentProjectId;

    return async (queryKey: string | ((projectId: string) => string)) => {
        if (typeof queryKey === "string") await queryClient.invalidateQueries(queryKey);
        else {
            await queryClient.invalidateQueries(queryKey(projectId))
        }
    }
}

export default useInvalidate;