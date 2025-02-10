import { useState } from "react";
import { useTemplateSurveys } from "../../../hooks/useSurveys";

const useTemplateSurveysData = (projectId, services) => {
    const [templateSurveysData, setTemplateSurveysData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [data, loading] = await useTemplateSurveys(projectId, services);
            setTemplateSurveysData(data);
            setIsLoading(loading);
        } catch (error) {
            console.error("Error fetching template surveys:", error);
            setIsLoading(false);
        }
    };

    fetchData();

    return [templateSurveysData, isLoading];
};

export default useTemplateSurveysData;
