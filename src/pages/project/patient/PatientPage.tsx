import React from "react";
import Routes from "../../../constants/Routes";
import EmptyButtonView from "../../../components/containers/EmptyView";
import { useHistory, useParams } from "react-router-dom";
import PatientRegistrations from "./registrations/PatientRegistrations";
import { useProjectCrudListQuery, useProjectCrudQuery } from "../../../hooks/useProjectQuery";
import PatientSurveys from "./surveys/PatientSurveys";
import NoStrategyPatientView from "./NoStrategyPatientView";
import { EmptyConditionElement } from "../../../components/containers/EmptyCondition";
import Strategy from "../../../models/Strategy";
import ProjectPatient from "../../../models/ProjectPatient";
import PatientTags from "./PatientTags";
import Grid from "@material-ui/core/Grid";
import HomeBasePage from "../home/HomeBasePage";
import { Box } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import PatientCustomSurveys from "./custom_surveys/PatientCustomSurveys";
import SendoutsContainer from "./SendoutsContainer";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    button: {
        borderStyle: "solid",
        borderRadius: 8,
        color: theme.palette.primary.light,
        fontSize: 16,
        padding: 6
    }
}))

export const PatientPage = () => {
    const history = useHistory();
    const classes = useStyles();

    const { projectPatientId } = useParams<{ projectPatientId: string }>();
    const patientQuery = useProjectCrudQuery(projectPatientId, service => service.projectPatients);
    const strategiesQuery = useProjectCrudListQuery(services => services.projectStrategies);
    const currentStrategy = strategiesQuery.elements.find(s => s.id === patientQuery.value?.strategyId);

    const hasSurveys = Boolean(currentStrategy?.surveys.length);
    const hasEffects = Boolean(currentStrategy?.effects.length);
    const { t } = useTranslation();

    return (
        <HomeBasePage
            title={patientQuery.value?.name}
            backRoute={undefined}
            loading={patientQuery.query.isLoading}
        >
            <EmptyConditionElement<ProjectPatient>
                isLoading={patientQuery.query.isLoading}
                data={patientQuery.value}
                empty={
                    <EmptyButtonView
                        title={t("CitizenPage.pageNotFound")}
                        subTitle={t("CitizenPage.cantFindCitizen")}
                        buttonText={t("CitizenPage.backButton")}
                        onClick={() => history.push(Routes.projectPatients)}
                    />
                }
            >
                {(projectPatient) =>
                    <EmptyConditionElement<Strategy>
                        isLoading={strategiesQuery.query.isLoading}
                        data={currentStrategy}
                        empty={
                            <NoStrategyPatientView
                                patient={patientQuery.value as ProjectPatient}
                                onChange={patientQuery.invalidate}
                            />
                        }
                    >
                        {(strategy) =>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <PatientTags patient={projectPatient} />
                                </Grid>
                                <Grid item xs={6} style={{
                                    display: "flex",
                                    justifyContent: "end"
                                }}>
                                    <Box className={classes.button}>
                                        {patientQuery.value?.strategyName}
                                    </Box>
                                </Grid>
                                {hasSurveys && (
                                    <Grid item xs={12} lg={hasEffects && 6}>
                                        <PatientSurveys
                                            patient={projectPatient}
                                            strategy={strategy}
                                        />
                                    </Grid>
                                )}
                                <Grid item xs={12} lg={6}>
                                    <SendoutsContainer
                                        patient={projectPatient}
                                        strategy={strategy}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <PatientCustomSurveys
                                        patient={projectPatient}
                                        strategy={strategy}
                                    />
                                </Grid>
                                {hasEffects && (
                                    <Grid item xs={12} lg={hasSurveys && 6}>
                                        <PatientRegistrations
                                            patient={projectPatient}
                                            strategy={strategy}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        }
                    </EmptyConditionElement>
                }
            </EmptyConditionElement>
        </HomeBasePage>
    );
}


export default PatientPage;

