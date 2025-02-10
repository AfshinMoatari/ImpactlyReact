import {useAuth} from "../providers/authProvider";
import {useAppServices} from "../providers/appServiceProvider";
import {useQuery} from "react-query";
import {AppRestServiceType} from "../services/appServices";
import ProjectPatient from "../models/ProjectPatient";

export const useProjectPatients = (projectId: string, services: AppRestServiceType): [ProjectPatient[], boolean] => {
    const projectQuery = useQuery<ProjectPatient[]>({
        queryKey: `${projectId}-patients`,
        queryFn: async () => {
            const res = await services.projectPatients(projectId).readPage();
            if (!res.success) return []
            return res.value;
        },
        staleTime: Infinity,
        cacheTime: Infinity
    });

    return [(projectQuery.data ?? []), projectQuery.isLoading];
}

const usePatients = (): [ProjectPatient[], boolean] => {
    const projectId = useAuth().currentProjectId;
    const services = useAppServices();

    const [projectPatients, projectLoading] = useProjectPatients(projectId, services);

    const loading: boolean = projectLoading;
    const patients: ProjectPatient[] =  [...projectPatients];

    return [patients, loading];
}

export default usePatients