import { Button, Divider, Stepper } from "@material-ui/core";
import Step from "@material-ui/core/Step";
import React, { useEffect, useState } from "react";
import StepLabel from "@material-ui/core/StepLabel";
import Box from "@material-ui/core/Box";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import ArrowRightLineIcon from "remixicon-react/ArrowRightLineIcon";
import CheckLineIcon from "remixicon-react/CheckLineIcon";
import RegistrationView from "./RegistrationView";
import { useHistory } from "react-router-dom";
import Routes from "../../../../constants/Routes";
import useStrategyContext, { DataFlowProvider } from "./DataFlowProvider";
import { useProjectCrudListQuery } from "../../../../hooks/useProjectQuery";
import { isErrorResponse } from "../../../../models/rest/RestResponse";
import HomeBasePage from "../../home/HomeBasePage";
import SurveyView from "./SurveyView";
import NameStrategyDialog from "../NameStrategyDialog";
import { Prompt } from 'react-router'
import ConfirmDialog from "../../../../components/dialogs/ConfirmDialog";
import PatientsView from "./PatientsView";
import FrequencyView from "./FrequencyView";
import { useTranslation } from "react-i18next";


const StrategyStepper = () => {
    const [lastLocation, setLastLocation] = React.useState(null)
    const [confirmedNavigation, setConfirmedNavigation] = React.useState(false)
    const [activeStep, setActiveStep] = React.useState(0);
    const history = useHistory();
    const { state } = useStrategyContext();
    const projectStrategy = useProjectCrudListQuery(service => service.projectStrategies);
    const qS = useProjectCrudListQuery(services => services.projectPatients);
    const qZ = useProjectCrudListQuery(services => services.projectStrategies);
    const [open, setOpen] = useState(false);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<boolean>(true);
    const { t } = useTranslation();

    const steps: { name: string; component: React.ReactElement }[] = [
        {
            name: t('StrategyFlowPage.surveys'),
            component: <SurveyView />
        }, {
            name: t('StrategyFlowPage.participants'),
            component: <PatientsView />
        }, {
            name: t('StrategyFlowPage.sendouts'),
            component: <FrequencyView />
        }
    ];

    const handleClose = () => setOpen(false);

    const handleSubmit = async ({ name }: { name: string }) => {
        const res = await projectStrategy.create({
            name: name,
            effects: state.effects,
            frequencies: state.frequencies,
            surveys: state.surveys,
            patients: state.patients
        })
        if (isErrorResponse(res)) return;

        const strategy = res.next[0];

        await projectStrategy.invalidate();
        await qS.invalidate();
        await qZ.invalidate();

        setPrompt(false);
        history.push(Routes.projectStrategy.replace(":strategyId", strategy.id));
        handleClose();
    }

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            setOpen(true);
        } else {
            setActiveStep((prevActiveStep) => Math.min(prevActiveStep + 1, steps.length - 1));
        }
    };
    const handleBack = () => {
        if (activeStep === 0) handleStop();
        else setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
    };
    const handleStop = () => {
        history.push(Routes.projectStrategies)
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

    const isAtFinish = activeStep === steps.length - 1
    return (
        <HomeBasePage title={t('StrategyFlowPage.createStrategy')}>
            <Prompt
                when={prompt}
                message={handleBlockedNavigation}
            />
            <ConfirmDialog title={t('StrategyFlowPage.continueWithoutSave')} open={showDialog} onClose={closeModal} onConfirm={handleConfirmNavigationClick}><span>{t('StrategyFlowPage.promptContinue')}</span></ConfirmDialog>
            <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
                <Stepper
                    activeStep={activeStep}
                    alternativeLabel={false}
                    style={{ boxShadow: 'unset', padding: '16px 4px 16px 4px' }}
                >
                    {steps.map((step) => {
                        return (
                            <Step key={step.name}>
                                <StepLabel>{step.name}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>

                <div style={{ flex: 1 }}>
                    {steps[activeStep].component}
                </div>

                <Divider />
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    padding: 16,
                }}>
                    <Button
                        color="inherit"
                        onClick={handleBack}
                        style={{ fontWeight: 600, color: '#5f6368' }}
                        startIcon={activeStep === 0 ? <div /> : <ArrowLeftLineIcon />}
                    >
                        {activeStep === 0 ? t('StrategyFlowPage.cancel') : t('StrategyFlowPage.back')}
                    </Button>

                    <Box style={{ flex: '1 1 auto' }} />

                    <Button
                        color='primary'
                        onClick={handleNext}
                        disabled={activeStep === 1 && Boolean(state.patients.length === 0)}
                        style={{ fontWeight: 600 }}
                        endIcon={isAtFinish ? <CheckLineIcon /> : <ArrowRightLineIcon />}
                    >
                        {isAtFinish ? t('StrategyFlowPage.ready') : t('StrategyFlowPage.next')}
                    </Button>

                </div>

                <NameStrategyDialog onSubmit={handleSubmit} open={open} onClose={handleClose} />
            </div>
        </HomeBasePage>
    );
}

const StrategyFlowPage = () => (
    <DataFlowProvider>
        <StrategyStepper />
    </DataFlowProvider>
)


export default StrategyFlowPage;
