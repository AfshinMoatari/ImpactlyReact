import React, { useEffect, useState } from "react";
import { Step, StepLabel, Stepper, withStyles, makeStyles, useMediaQuery, Theme } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import Routes from "../../../../constants/Routes";
import { isErrorResponse } from "../../../../models/rest/RestResponse";
import { useTranslation } from "react-i18next";
import { DefaultSROIFlowState, SROIFlowProvider, SROIFlowState } from "./SROIFlowProvider";
import { useAppServices } from "../../../../providers/appServiceProvider";
import { useAuth } from "../../../../providers/authProvider";
import { SroiFlow } from "../../../../models/SROIFlow";
import snackbarProvider from "../../../../providers/snackbarProvider";
import ConfirmDialog from "../../../../components/dialogs/ConfirmDialog";
import GeneralView from "./GeneralView";
import InterventionView from "./InterventionView";
import TargetGroupView from "./TargetGroupView";
import CheckboxCircleLineIcon from "remixicon-react/CheckboxCircleLineIcon";
import CheckboxCircleFillIcon from "remixicon-react/CheckboxCircleFillIcon";
import CheckLineIcon from "remixicon-react/CheckLineIcon";
import StakeholdersView from "./StakeholdersView";
import OutcomesView from "./OutcomesView";
import ConfirmationView from "./ConfirmationView";
import FundingSourceView from "./FundingSourceView";
import MethodView from "./MethodView";
import BasePage from "../../../../components/containers/BasePage";
import { useProjectCrudListQuery } from "../../../../hooks/useProjectQuery";
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import { Grid } from "@material-ui/core";
import Analytics from "../../../../models/Analytics";

const useStyles = makeStyles((theme: Theme) => ({
    flowPage: {
        width: '100%',
        height: '100vh',
        display: 'flex',
        padding: theme.spacing(2),
        [theme.breakpoints.up('md')]: {
            padding: theme.spacing(0),
        },
        overflow: 'hidden',
    },
    gridContainer: {
        flexGrow: 1,
        height: '100%',
        display: 'flex',
    },
    stepperContainer: {
        display: 'none',
        [`@media (min-width: 960px)`]: {
            width: 350,
            display: 'flex',
            background: '#1C1632',
            height: '100%',
            flexDirection: 'column',
        },
    },
    contentContainer: {
        flex: 1,
        padding: theme.spacing(2),
    },
    customStepper: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 0,
    },
    step: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        minHeight: 0,
    },
    svgContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#A295D0',
        width: '26.29px',
        minHeight: 0,
    },
}));

const CustomStepper = withStyles({
    vertical: {
        "& .MuiStepConnector-root": {
            display: "none",
        },
    },
})(Stepper);

interface LocationState {
    analyticsData?: Analytics;
    isEdit: boolean;
    isTemplate: boolean;
}

const SROIStepper = ({ locationState }: { locationState: LocationState | null }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [confirmedNavigation, setConfirmedNavigation] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const history = useHistory();
    const projectId = useAuth().currentProjectId;
    const projectAnalytics = useAppServices().projectAnalytics(projectId);
    const [showDialog, setShowDialog] = useState(false);
    const qS = useProjectCrudListQuery(services => services.projectAnalytics);
    const { t } = useTranslation();
    const [lastLocation] = useState<string | null>(null);
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

    const classes = useStyles();

    useEffect(() => {
        if (activeStep > 0) {
            setSteps((prevSteps) => {
                const updatedSteps = [...prevSteps];
                updatedSteps[activeStep - 1].isValidated = true;
                return updatedSteps;
            });
        }
    }, [activeStep]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStop = () => {
        history.push(Routes.projectAnalytics);
    };

    const closeModal = () => {
        setShowDialog(false);
    };

    useEffect(() => {
        if (lastLocation && !showDialog && confirmedNavigation) {
            history.push(lastLocation);
        }
    }, [lastLocation, showDialog, confirmedNavigation, history]);

    const handleConfirmNavigationClick = () => {
        if (lastLocation) {
            setShowDialog(false);
            setConfirmedNavigation(true);
        }
    };

    const [steps, setSteps] = useState([
        {
            name: t('AnalyticsPage.sroi.sroiFlow.nav.general'),
            component: <GeneralView handleBack={handleBack} handleNext={handleNext} handleClose={handleStop} />,
            isValidated: false
        },
        {
            name: t('AnalyticsPage.sroi.sroiFlow.nav.intervention'),
            component: <InterventionView handleBack={handleBack} handleNext={handleNext} handleClose={handleStop} />,
            isValidated: false
        },
        {
            name: t('AnalyticsPage.sroi.sroiFlow.nav.targetGroup'),
            component: <TargetGroupView handleBack={handleBack} handleNext={handleNext} handleClose={handleStop} />,
            isValidated: false
        },
        {
            name: t('AnalyticsPage.sroi.sroiFlow.nav.stakeholders'),
            component: <StakeholdersView handleBack={handleBack} handleNext={handleNext} handleClose={handleStop} />,
            isValidated: false
        },
        {
            name: t('AnalyticsPage.sroi.sroiFlow.nav.fundingSource'),
            component: <FundingSourceView handleBack={handleBack} handleNext={handleNext} handleClose={handleStop} />,
            isValidated: false
        },
        {
            name: t('AnalyticsPage.sroi.sroiFlow.nav.outcomes'),
            component: <OutcomesView handleBack={handleBack} handleNext={handleNext} handleClose={handleStop} />,
            isValidated: false
        },
        {
            name: t('AnalyticsPage.sroi.sroiFlow.nav.method'),
            component: <MethodView handleBack={handleBack} handleNext={handleNext} handleClose={handleStop} />,
            isValidated: false
        },
        {
            name: '',
            component: <ConfirmationView handleBack={handleBack} handleSubmit={handleSubmit} handleClose={handleStop} />,
            isValidated: false
        }
    ]);

    async function handleSubmit(state: SROIFlowState) {
        setIsLoading(true);
        const sroiFlow: SroiFlow = {
            id: locationState?.analyticsData?.id || '',
            parentId: projectId,
            general: state.general,
            intervention: state.intervention,
            targetGroup: state.targetGroup,
            stakeholders: state.stakeholders,
            fundingSource: state.fundingSource,
            outcomes: state.outcomes,
            method: state.method,
            confirmation: state.confirmation
        };

        const res = locationState?.isEdit
            ? await projectAnalytics.edit(sroiFlow)
            : await projectAnalytics.create(sroiFlow);

        setIsLoading(false);
        if (!isErrorResponse(res)) {
            snackbarProvider.success(
                locationState?.isEdit
                    ? t('AnalyticsPage.SROIFlowPage.successEdit')
                    : t('AnalyticsPage.SROIFlowPage.successCreation')
            );
            await qS.invalidate();
            history.push(Routes.projectAnalytic.replace(":analyticId", res.value.id));
        } else {
            snackbarProvider.error(res.feedback.message);
        }
    }

    const handleStepClick = (stepIndex: number) => {
        if (steps[stepIndex].isValidated || stepIndex === activeStep) {
            setActiveStep(stepIndex);
        }
    };

    return (
        <BasePage className={classes.flowPage}>
            {isLoading && <LoadingOverlay />}
            <ConfirmDialog
                title={t('AnalyticsPage.sroi.sroiFlow.continueWithoutSave')}
                open={showDialog}
                onClose={closeModal}
                onConfirm={handleConfirmNavigationClick}
            >
                <span>{t('AnalyticsPage.sroi.sroiFlow.promptContinue')}</span>
            </ConfirmDialog>

            <Grid container spacing={2} className={classes.gridContainer}>
                <Grid item xs={12} md={9} className={classes.contentContainer}>
                    {steps[activeStep].component}
                </Grid>

                <Grid item xs={12} md={3} className={classes.stepperContainer}>
                    <CustomStepper
                        activeStep={activeStep}
                        orientation={isSmallScreen ? "horizontal" : "vertical"}
                        className={classes.customStepper}
                        style={{ boxShadow: 'unset', margin: '10px', padding: '16px 4px', background: 'none', textAlign: 'center', alignItems: 'center' }}
                    >
                        {steps.map((step, index) => (
                            <Step
                                key={step.name}
                                className={classes.step}
                                onClick={() => handleStepClick(index)}
                                style={{
                                    cursor: (step.isValidated || index === activeStep) ? 'pointer' : 'default'
                                }}
                            >
                                <StepLabel StepIconComponent={() => null} style={{ display: 'block' }}>
                                    <div
                                        style={{
                                            width: 'fit-content',
                                            margin: '0 auto',
                                            background: (index === activeStep && index !== steps.length - 1) ? '#A295D0' : 'none',
                                            padding: '10px 10px',
                                            textAlign: 'center',
                                            borderRadius: '100px',
                                            opacity: (!step.isValidated && index !== activeStep) ? 0.5 : 1,
                                        }}
                                    >
                                        <span style={{
                                            color: (index === activeStep && index !== steps.length - 1) ? '#1C1632' : '#A295D0',
                                        }}>
                                            {index !== steps.length - 1 ? (
                                                <div style={{ display: "flex", alignItems: 'center' }}>
                                                    <span style={{
                                                        fontSize: '20px',
                                                        lineHeight: '30px',
                                                        marginLeft: (index !== activeStep && step.isValidated) ? 32 : 0,
                                                    }}>
                                                        {step.name}
                                                    </span>
                                                    {(index !== activeStep && step.isValidated) &&
                                                        <CheckLineIcon size={34} style={{ marginLeft: 4 }} />
                                                    }
                                                </div>
                                            ) : (
                                                <div style={{ width: '60px', pointerEvents: 'none' }}>
                                                    {index === activeStep ?
                                                        <CheckboxCircleFillIcon size={'small'} />
                                                        :
                                                        <CheckboxCircleLineIcon size={'small'} />
                                                    }
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                </StepLabel>
                                {index !== steps.length - 1 && (
                                    <div className={classes.svgContainer}>
                                        {index === activeStep ? (
                                            <svg viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14 2C14 0.895431 13.1046 4.82823e-08 12 0C10.8954 -4.82823e-08 10 0.89543 10 2L14 2ZM12 28.2857L23.547 8.28571L0.452994 8.28571L12 28.2857ZM10 8.57143C10 9.676 10.8954 10.5714 12 10.5714C13.1046 10.5714 14 9.676 14 8.57143L10 8.57143ZM14 21.7143C14 20.6097 13.1046 19.7143 12 19.7143C10.8954 19.7143 10 20.6097 10 21.7143L14 21.7143ZM10 2L10 8.57143L14 8.57143L14 2L10 2Z" fill="#A295D0" />
                                            </svg>
                                        ) : (
                                            <svg width="24" height="31" viewBox="0 0 4 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2 2.57141L2 28.8571" stroke="#A295D0" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </Step>
                        ))}
                    </CustomStepper>
                </Grid>
            </Grid>
        </BasePage>
    );
};

const SROIFlowPage: React.FC = () => {
    const location = useLocation<LocationState>();
    const { analyticsData, isEdit, isTemplate } = location.state || {};

    const initialState: SROIFlowState = (isEdit || isTemplate) && analyticsData ? {
        general: {
            reportName: analyticsData.name,
            reportLanguage: analyticsData.reportConfig.general.reportLanguage,
            isForcast: analyticsData.reportConfig.general.isForcast || false,
            executiveSummary: analyticsData.reportConfig.general.executiveSummary || '',
            currency: analyticsData.reportConfig.general.currency || '',
            logo: analyticsData.reportConfig.general.logo || ''
        },
        stakeholders: analyticsData.reportConfig.stakeholders || [],
        intervention: analyticsData.reportConfig.intervention || {},
        outcomes: analyticsData.reportConfig.outcomes || [],
        fundingSource: analyticsData.reportConfig.fundingSource || {},
        method: analyticsData.reportConfig.method || '',
        targetGroup: analyticsData.reportConfig.targetGroup || {},
        confirmation: analyticsData.reportConfig.confirmation || {}
    } : new DefaultSROIFlowState();

    return (
        <SROIFlowProvider initialState={initialState}>
            <SROIStepper locationState={location.state} />
        </SROIFlowProvider>
    );
};

export default SROIFlowPage;