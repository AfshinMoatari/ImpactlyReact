import React from "react";
import ProjectPatient from "../../../../models/ProjectPatient";
import Strategy from "../../../../models/Strategy";
import NiceOutliner from "../../../../components/containers/NiceOutliner";
import { Typography } from "@material-ui/core";
import SurveyChartContainer from "./SurveyChartContainer";
import { useTemplateSurveys } from "../../../../hooks/useSurveys";
import { useAppServices } from "../../../../providers/appServiceProvider";
import NiceDivider from "../../../../components/visual/NiceDivider";
import { useTranslation } from "react-i18next";

interface PatientSurveysProps {
    patient: Required<ProjectPatient>;
    strategy: Strategy;
}

const PatientSurveys: React.FC<PatientSurveysProps> = ({ patient, strategy }) => {
    const strategySurveys = strategy.surveys;
    const services = useAppServices();
    const [projectTemplates, loading] = useTemplateSurveys(patient.parentId, services);
    const { t } = useTranslation();

    if (loading) return null;
    const patientTemplates = projectTemplates.filter(t => strategySurveys.find(s => s.id === t.id));

    return (
        <NiceOutliner>
            <Typography variant="h3">{t("CitizenPage.validatedSurveys", { surveys: patientTemplates.length })}</Typography>
            <NiceDivider />
            <SurveyChartContainer
                patient={patient}
                templates={patientTemplates}
            />
        </NiceOutliner>
    )
}

export default PatientSurveys;
