import React, {useEffect, useState} from "react";
import {EmptyButtonView} from "../../../components/containers/EmptyView";
import Routes from "../../../constants/Routes";
import history from "../../../history";
import {useProjectCrudListQuery, useProjectCrudQuery} from "../../../hooks/useProjectQuery";
import {EmptyConditionElement} from "../../../components/containers/EmptyCondition";
import {useParams} from "react-router-dom";
import {Box, Grid} from "@material-ui/core";
import Strategy, {ProjectRegistration} from "../../../models/Strategy";
import HomeBasePage from "../home/HomeBasePage";
import StrategyPatients from "./StrategyPatients";
import StrategySurveys from "./StrategySurveys";
import DeleteButton from "../../../components/buttons/DeleteButton";
import EditStrategyName from "./EditStrategyName";
import {Survey} from "../../../models/Survey";
import {Frequency} from "../../../models/cron/Frequency";
import {Prompt} from "react-router";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import StrategyCommunication from "./StrategyCommunication";
import StrategyBatchRegistrations from "./StrategyBatchRegistrations";
import { useQueryClient } from "react-query";
import {useTranslation} from "react-i18next";
import LoadingOverlay from "../../../components/feedback/LoadingOverlay";

export const StrategyPage = () => {
    const {strategyId} = useParams<{ strategyId: string }>();
    const strategyQuery = useProjectCrudQuery(strategyId, service => service.projectStrategies);
    const patientsQuery = useProjectCrudListQuery(services => services.projectPatients);
    const qS = useProjectCrudListQuery(services => services.projectStrategies);
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateClick = () => history.push(Routes.projectStrategyFlow)

    const handleDeleteClick = async () => {
        setIsLoading(true);
        try {
            await strategyQuery.delete(strategyId);
            setPrompt(false);
            history.push(Routes.projectStrategies);
            await qS.invalidate();
            await patientsQuery.invalidate();
        } catch (error) {
            console.error("Failed to delete:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (lastLocation && !showDialog && confirmedNavigation) {
            history.push(lastLocation)
        }
    })
    const handleConfirmNavigationClick = () => {
        if (lastLocation) {
            setShowDialog(false);
            setConfirmedNavigation(true);
        }
    }
    const showModal = (location: any) => {
        setShowDialog(true);
        setLastLocation(location);
    }

    const closeModal = () => {
        setShowDialog(false);
    }

    const handleBlockedNavigation = (nextLocation: any, action: any) => {
        if (!confirmedNavigation) {
            showModal(nextLocation)
            return false
        }
        return true
    }

    const resetStrategies = async () => {
        await queryClient.invalidateQueries()
    }

    const setStrategyName = async (name: string) => {
        let strategy = (strategyQuery.value as Strategy)
        strategy.name = name;
        await strategyQuery.update(strategy);
        await strategyQuery.invalidate();
        resetStrategies();
        setPrompt(false);
    }

    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<boolean>(false);
    const [lastLocation, setLastLocation] = React.useState(null)
    const [confirmedNavigation, setConfirmedNavigation] = React.useState(false)
    const [newStrategy, setNewValues] = useState(strategyQuery.value as Strategy);

    return (
        <HomeBasePage
            title={
                <EditStrategyName
                    name={strategyQuery.value?.name ?? ""}
                    onChange={(n: string) => setStrategyName(n)}
                />
            }
            backRoute={Routes.projectStrategies}
            loading={strategyQuery.query.isLoading}
            actions={
                <Box>
                    <DeleteButton
                        size={24}
                        title={t('StrategiesPage.deleteStrategyIconLabel')}
                        dialogTitle={t('StrategiesPage.deleteStrategy')}
                        message={t('StrategiesPage.deleteAreYouSure')}
                        onConfirm={handleDeleteClick}
                    />
                </Box>
            }
        >
            {isLoading && <LoadingOverlay />}
            <Prompt
                when={prompt && isLoading}
                message={handleBlockedNavigation}
            />
            <ConfirmDialog title={t('StrategyFlowPage.continueWithoutSave')} open={showDialog} onClose={closeModal}
                           onConfirm={handleConfirmNavigationClick}><span>Er du sikker på, at du vil forlade uden at gemme?</span></ConfirmDialog>

            <EmptyConditionElement<Strategy>
                isLoading={strategyQuery.query.isLoading}
                data={strategyQuery.value}
                empty={
                    <EmptyButtonView
                        title={t('StrategiesPage.noStrategies')}
                        subTitle={t('StrategiesPage.weHelpYouSetUp')}
                        buttonText={t('StrategiesPage.createStrategy')}
                        onClick={handleCreateClick}
                    />
                }
            >
                {(strategy => (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8}>
                                <div>
                                    <StrategyCommunication
                                        frequencies={newStrategy?.frequencies ?? strategy.frequencies}
                                        strategyId={strategy.id}
                                        onChange={(frequencies: Frequency[]) => {
                                            setNewValues({
                                                ...strategy,
                                                frequencies
                                            });
                                            resetStrategies();
                                        }}
                                    />
                                    <StrategyBatchRegistrations
                                        effects={newStrategy?.effects ?? strategy.effects}
                                        strategyId={strategy.id}
                                        onNewValue={(effects: ProjectRegistration[]) => {
                                            setNewValues({
                                                ...newStrategy,
                                                effects
                                            })
                                            resetStrategies();
                                        }}
                                    />
                                </div>
                            </Grid>
                            <Grid container item xs={12} sm={4}>
                                <Grid item xs={12}>
                                    <div>
                                        <StrategySurveys
                                            strategy={strategy}
                                            edit={true}
                                            edited={newStrategy?.surveys ?? strategy.surveys}
                                            onChange={(surveys: Survey[]) => {
                                                setNewValues({
                                                    ...newStrategy,
                                                    surveys
                                                });
                                                resetStrategies();
                                            }}
                                        />
                                        <StrategyPatients strategy={strategy}/>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                )}
            </EmptyConditionElement>
        </HomeBasePage>
    )
}

export default StrategyPage;