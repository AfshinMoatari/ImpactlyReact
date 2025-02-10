import React from "react";
import SurveyTable from "./surveys/SurveyTable";
import {Box, Typography} from "@material-ui/core";
import ProjectPatient from "../../../models/ProjectPatient";
import Strategy from "../../../models/Strategy";
import NiceOutliner from "../../../components/containers/NiceOutliner";
import NiceDivider from "../../../components/visual/NiceDivider";
import {useTranslation} from "react-i18next";

interface SendoutsContainerProps {
    patient: Required<ProjectPatient>;
    strategy: Strategy;
}

const SendoutsContainer: React.FC<SendoutsContainerProps> = ({patient, strategy}) => {
    const strategySurveys = strategy.surveys;
    const {t} = useTranslation();

    return (
        <NiceOutliner>
            <Typography variant="h3">{t("CitizenPage.sendStrategy", {survey: strategySurveys.length})}</Typography>
            <NiceDivider/>
            <Box>
                <SurveyTable
                    patient={patient}
                    surveys={strategySurveys}
                />
            </Box>
        </NiceOutliner>
    )
}

export default SendoutsContainer;

