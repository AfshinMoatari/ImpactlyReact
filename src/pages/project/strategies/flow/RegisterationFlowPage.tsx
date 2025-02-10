import {Backdrop, Box, CircularProgress, DialogContent} from "@material-ui/core";
import React, {useState} from "react";
import BaseDialog from "../../../../components/dialogs/BaseDialog";
import ConfirmDialog from "../../../../components/dialogs/ConfirmDialog";
import { ProjectStrategyServiceType } from "../../../../services/projectStrategyService";
import { BatchSendoutRegistration, PatientRegistrationDataGrid } from "../../../../models/Registration";
import { ProjectRegistration } from "../../../../models/Strategy";
import StrategyRegisterationPatientsView from "./StrategyRegisterationPatientsView";
import StrategyRegisterationSendoutUpdateView from "./StrategyRegisterationSendoutUpdateView";
import StrategyRegisterationDateView from "./StrategyRegisterationDateView";
import { RestErrorResponse, RestSuccessResponse } from "../../../../models/rest/RestResponse";
import snackbarProvider from "../../../../providers/snackbarProvider";
import {useTranslation} from "react-i18next";

interface RegisterationFlowPageProp {
    strategyId: string;
    open: boolean;
    onClose: VoidFunction;
    activeStep: number;
    setActiveStep: (index: number) => void;
    strategyService: ProjectStrategyServiceType;
    setBatchRegistrationData: (data: any) => void;
    batchRegistrationData: BatchSendoutRegistration;
    effects: ProjectRegistration[];
    category: string;
}

const RegisterationFlowPage: React.FC<RegisterationFlowPageProp> = ({
                                                                        strategyId,
                                                                        open,
                                                                        onClose,
                                                                        activeStep,
                                                                        setActiveStep,
                                                                        strategyService,
                                                                        setBatchRegistrationData,
                                                                        batchRegistrationData,
                                                                        effects,
                                                                        category
                                                                    }) => {
    const setActiveState = (value: number) => {
        if (value < 0) {
            HandleCloseDialog();
        } else {
            setActiveStep(value);
        }
    }

    const [showConfirmationDialog, toggleConfirmationDialog] = useState(false);
    const [activationConfirmationDialog, toggleActivation] = useState(false);
    const { t } = useTranslation();

    const steps: { title: string, description: string; component: any }[] = [{
        title: t("RegistrationFlowPage.chooseCitizens"),
        description: `${effects[0]?.type === "numeric" ? t("RegistrationFlowPage.numericRegistration") :
                effects[0]?.type === "count" ? 
                t("RegistrationFlowPage.incidentRegistration") :
                t("RegistrationFlowPage.statusRegistration")} "${category}"`,
        component:
            <StrategyRegisterationPatientsView
                effects={effects}
                category={category}
                strategyService={strategyService}
                strategyId={strategyId}
                batchRegistrationData={batchRegistrationData}
                setBatchRegistrationData={setBatchRegistrationData}
                setActiveState={setActiveState}
                activeStep={activeStep}
            />
    }, {
        title: t("RegistrationFlowPage.addDate"),
        description: `${effects[0]?.type === "numeric" ? t("RegistrationFlowPage.numericRegistration") :
                effects[0]?.type === "count" ? t("RegistrationFlowPage.incidentRegistration") :
                t("RegistrationFlowPage.statusRegistration")} "${effects[0]?.name}"`,
        component:
            <StrategyRegisterationDateView
                effects={effects}
                batchRegistrationData={batchRegistrationData}
                setBatchRegistrationData={setBatchRegistrationData}
                setActiveState={setActiveState}
                activeStep={activeStep}
            />
    }, {
        title: t("RegistrationFlowPage.reviewAndConfirm"),
        description: `${effects[0]?.type === "numeric" ? t("RegistrationFlowPage.numericRegistration") :
            effects[0]?.type === "count" ? t("RegistrationFlowPage.incidentRegistration") :
                t("RegistrationFlowPage.statusRegistration")} "${effects[0]?.name}"`,
        component:
            <StrategyRegisterationSendoutUpdateView
                toggleConfirmationDialog={toggleConfirmationDialog}
                effects={effects}
                batchRegistrationData={batchRegistrationData}
                setBatchRegistrationData={setBatchRegistrationData}
                setActiveState={setActiveState}
                activeStep={activeStep}
            />
    }];

    const IsValidData = (batchRegistrationData: BatchSendoutRegistration): boolean => {
        if(batchRegistrationData == null) return false;
        if(batchRegistrationData.patientRegistrationDataGrid.length == 0) return false;
        if(batchRegistrationData.ids.length == 0) return false;
        batchRegistrationData.patientRegistrationDataGrid.forEach(r => {
            if(r.effectId == null || r.date == null || r.patientId == null || r.patientName == null || Number.isNaN(r.value)){
                return false;
            }
        });
        return true;
    }

    const submitBatchRegisteration = async () => {
        const res = await strategyService.postBatchRegisteration(strategyId, batchRegistrationData.patientRegistrationDataGrid);
        HandleResponse(res);
    };

    const HandleResponse = (res: RestErrorResponse | RestSuccessResponse<PatientRegistrationDataGrid[]>) => {
        if (res.success) {
            snackbarProvider.success(t("RegistrationFlowPage.successSnackbar", { count: res.value.length }))
        } else {
            snackbarProvider.error(t("RegistrationFlowPage.errorSnackbar"))
        }
        toggleConfirmationDialog(false);
        HandleCloseDialog();
    }

    const HandleCloseDialog = () => {
        onClose();
        setBatchRegistrationData({
            ids: [] as string[],
            effectId: '',
            registrationDate: new Date(),
            value: 0,
            patientRegistrationDataGrid: [] as PatientRegistrationDataGrid[]
        });
    }

    return (
        <BaseDialog
            style={{
                borderBottom: '2px solid rgba(10, 8, 18, 0.05)',
                marginBottom: 20,
                padding: '16px 24px 0 24px'
            }}
            title={steps[activeStep].title}
            description={steps[activeStep].description}
            open={open}
            fullWidth={false}
            maxWidth='lg'
            onClose={() => HandleCloseDialog()}
        >
            <Backdrop style={{
                zIndex: 10,
                color: 'white'
            }} open={false}>
                <CircularProgress color="inherit"/>
            </Backdrop>
            <DialogContent style={{padding: '0px 24px 32px 24px',overflow:"Hidden"}}>
                {steps[activeStep].component}
            </DialogContent>
            <ConfirmDialog
                disabled = {activationConfirmationDialog}
                title={t("RegistrationFlowPage.confirmationDialogTitle")}
                open={showConfirmationDialog}
                onClose={() => toggleConfirmationDialog(false)}
                onConfirm={() => (activeStep == 2 && IsValidData(batchRegistrationData)) ? submitBatchRegisteration() : toggleActivation(false)}
            >
                <Box py={2}>
                    {t("RegistrationFlowPage.confirmationDialogDescription")}
                </Box>
            </ConfirmDialog>
        </BaseDialog>
    );
}
export default RegisterationFlowPage;
