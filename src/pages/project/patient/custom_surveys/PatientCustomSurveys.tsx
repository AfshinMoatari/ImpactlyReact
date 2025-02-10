import React from "react";
import NiceOutliner from "../../../../components/containers/NiceOutliner";
import { Typography } from "@material-ui/core";
import NiceDivider from "../../../../components/visual/NiceDivider";
import ProjectPatient from "../../../../models/ProjectPatient";
import Strategy from "../../../../models/Strategy";
import { useProjectSurveys } from "../../../../hooks/useSurveys";
import { useAppServices } from "../../../../providers/appServiceProvider";
import CustomSurveyChartContainer from "../custom_surveys/CustomSurveyChartContainer";
import { useTranslation } from "react-i18next";


interface CustomSurveysContainerProps {
    patient: Required<ProjectPatient>;
    strategy: Strategy;
}

const PatientCustomSurveys: React.FC<CustomSurveysContainerProps> = ({ patient, strategy }) => {
    const strategySurveys = strategy.surveys;
    const services = useAppServices();
    const projectSurveyQuery = useProjectSurveys(patient.parentId, services);
    const loading = projectSurveyQuery.query.isLoading;
    const projectTemplates = projectSurveyQuery.data;
    const { t } = useTranslation();

    if (loading) return null;
    const patientCustomSurveys = projectTemplates?.surveys.filter(t => strategySurveys.find(s => s.id === t.id)) ?? [];

    return (
        <div>
            {patientCustomSurveys.length > 0 &&
                <NiceOutliner innerStyle={{ marginBottom: 16 }}>
                    <Typography variant="h3">{t("CitizenPage.customSurveys", { surveys: patientCustomSurveys.length })}</Typography>
                    <NiceDivider />
                    <CustomSurveyChartContainer
                        patient={patient}
                        templates={patientCustomSurveys}
                    />
                </NiceOutliner>
            }
        </div>
    )
}

export default PatientCustomSurveys;