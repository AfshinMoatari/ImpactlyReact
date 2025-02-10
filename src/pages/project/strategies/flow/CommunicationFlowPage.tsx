import { Backdrop, Box, CircularProgress, DialogContent } from "@material-ui/core";
import React, { useState } from "react";
import BaseDialog from "../../../../components/dialogs/BaseDialog";
import { Survey } from "../../../../models/Survey";
import StrategySurveyView from "./StrategySurveyView";
import StrategyPatientsView from "./StrategyPatientsView";
import StrategySendoutTypeView from "./StrategySendoutTypeView";
import FrequencyTypeView from "./FrequencyTypeView";
import { BatchSendoutData, EndType, Frequency, defaultFrequency } from "../../../../models/cron/Frequency";
import { SendoutfrequencyToFrequencyExpression, frequencyExpressionToCron } from "../../../../lib/cron";
import ConfirmDialog from "../../../../components/dialogs/ConfirmDialog";
import { Guid } from "../../../../lib/Guid";
import snackbarProvider from "../../../../providers/snackbarProvider";
import { RestErrorResponse, RestSuccessResponse } from "../../../../models/rest/RestResponse";
import { ProjectStrategyServiceType } from "../../../../services/projectStrategyService";
import { useTranslation } from "react-i18next";

interface CommunicationFlowPageProp {
    strategyId: string;
    open: boolean;
    onClose: VoidFunction;
    onChange: (value: Frequency) => void;
    activeStep: number;
    setActiveStep: (index: number) => void;
    strategyService?: ProjectStrategyServiceType;
    onNewValue: (frequencies: Frequency[]) => void;
    edit: boolean;
    setBatchSendoutData: (data: any) => void;
    batchSendoutData: BatchSendoutData;
    copyOfBatchSendoutData: BatchSendoutData;
    frequencies: Frequency[];
}

const CommunicationFlowPage: React.FC<CommunicationFlowPageProp> = ({
    strategyId,
    open,
    onClose,
    onChange,
    activeStep,
    setActiveStep,
    strategyService,
    onNewValue,
    edit,
    setBatchSendoutData,
    batchSendoutData,
    copyOfBatchSendoutData,
    frequencies
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
    const [showCloseConfirmDialog, setShowCloseConfirmDialog] = useState(false);
    const { t } = useTranslation();

    const steps: { title: string, description: string; component: any }[] = [{
        title: t("CommunicationFlowPage.addSurveyTitle"),
        description: t("CommunicationFlowPage.addSurveyDescription"),
        component: <StrategySurveyView copyOfBatchSendoutData={copyOfBatchSendoutData} edit={edit} strategyService={strategyService} strategyId={strategyId} batchSendoutData={batchSendoutData} setBatchSendoutData={setBatchSendoutData} setActiveState={setActiveState} activeStep={activeStep} />
    }, {
        title: t("CommunicationFlowPage.addCitizensTitle"),
        description: t("CommunicationFlowPage.addCitizensDescription"),
        component: <StrategyPatientsView copyOfBatchSendoutData={copyOfBatchSendoutData} edit={edit} strategyService={strategyService} strategyId={strategyId} batchSendoutData={batchSendoutData} setBatchSendoutData={setBatchSendoutData} setActiveState={setActiveState} activeStep={activeStep} />
    }, {
        title: t("CommunicationFlowPage.chooseOrderTitle"),
        description: t("CommunicationFlowPage.chooseOrderDescription"),
        component: <StrategySendoutTypeView edit={edit} batchSendoutData={batchSendoutData} setBatchSendoutData={setBatchSendoutData} setActiveState={setActiveState} activeStep={activeStep} toggleConfirmationDialog={toggleConfirmationDialog} />
    }, {
        title: t("CommunicationFlowPage.setupSendoutTitle"),
        description: t("CommunicationFlowPage.setupSendoutDescription"),
        component: <FrequencyTypeView copyOfBatchSendoutData={copyOfBatchSendoutData} edit={edit} batchSendoutData={batchSendoutData} setBatchSendoutData={setBatchSendoutData} setActiveState={setActiveState} activeStep={activeStep} toggleConfirmationDialog={toggleConfirmationDialog} />
    }];

    const IsValidData = (batchSendoutData: BatchSendoutData): boolean => {
        if (batchSendoutData == null) return false;
        if (batchSendoutData.patientsId == null || batchSendoutData.patientsId.length == 0) return false;
        if (batchSendoutData.surveys == null || batchSendoutData.surveys.length == 0) return false;
        if (batchSendoutData.type == null) return false;
        return true;
    }

    const SendoutImmediate = async () => {
        toggleConfirmationDialog(false);
        const frequency: Frequency = {
            id: Guid.create().toString(),
            parentId: strategyId,
            surveys: batchSendoutData.surveys,
            patientsId: batchSendoutData.patientsId,
            end: {
                endDate: new Date(),
                occurrences: 0,
                type: EndType.IMMEDIATE
            },
            cronExpression: ''
        }
        const res = await strategyService?.postBatchSendout(frequency, 'Immediate');
        if (res !== null && res?.success) { 
            HandleResponse(res as RestSuccessResponse<Frequency>);
            onClose(); // Direct close without confirmation
        }
    };

    const SendoutFrequency = async () => {
        for (let index = 0; index < batchSendoutData.surveys.length; index++) {
            const element = batchSendoutData.surveys[index];
            if (element.parentId === "TEMPLATE")
                element.validated = true;
        }
        toggleConfirmationDialog(false);
        const id = edit ? batchSendoutData.id : Guid.create().toString();
        const frequency: Frequency = {
            id: id,
            parentId: strategyId,
            end: batchSendoutData.frequencyFormValues.end,
            surveys: batchSendoutData.surveys,
            patientsId: batchSendoutData.patientsId,
            cronExpression: frequencyExpressionToCron(batchSendoutData.frequencyFormValues.expression)
        }
        if (edit) {
            const res = await strategyService?.updateFrequencyBatchSendout(frequency);
            if (res !== null && res?.success) { 
                HandleResponse(res as RestSuccessResponse<Frequency>);
                onClose(); // Direct close without confirmation
            }
        } else {
            const res = await strategyService?.postBatchSendout(frequency, 'Frequent');
            if (res !== null && res?.success) { 
                HandleResponse(res as RestSuccessResponse<Frequency>);
                onClose(); // Direct close without confirmation
            }
        }
    };

    const HandleResponse = (res: RestErrorResponse | RestSuccessResponse<Frequency>) => {
        if (res.success) {
            if (edit) {
                onChange(res.value as Frequency);
            } else {
                onNewValue([...frequencies, (res.value as Frequency)]);
            }
            snackbarProvider.success(t("CommunicationFlowPage.successfulSendout", { count: res.value.patientsId.length }))
        } else {
            snackbarProvider.error(t("CommunicationFlowPage.errorCreatingFrequency"))
        }
    }

    const HandleCloseDialog = () => {
        if (batchSendoutData.surveys.length > 0 || batchSendoutData.patientsId.length > 0) {
            setShowCloseConfirmDialog(true);
        } else {
            closeAndReset();
        }
    }

    const closeAndReset = () => {
        onClose();
        setBatchSendoutData({
            surveys: ([] as Survey[]),
            patientsId: [],
            type: "frequency",
            frequencyFormValues: {
                expression: SendoutfrequencyToFrequencyExpression(defaultFrequency),
                end: defaultFrequency.end,
                id: ""
            }
        });
    }

    return (
        <BaseDialog
            style={{
                borderBottom: '2px solid rgba(10, 8, 18, 0.05)',
                marginBottom: 20,
                padding: '16px 24px 0 24px'
            }}
            maxWidth='lg'
            title={steps[activeStep].title}
            description={steps[activeStep].description}
            open={open}
            fullWidth={false}
            onClose={() => HandleCloseDialog()}
        >
            <Backdrop style={{
                zIndex: 10,
                color: 'white'
            }} open={false}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <DialogContent style={{ padding: '0px 24px 32px 24px', overflow: "auto" }}>
                {steps[activeStep].component}
            </DialogContent>
            <ConfirmDialog
                disabled={activationConfirmationDialog}
                title={t("CommunicationFlowPage.confirmSendoutTitle")}
                open={showConfirmationDialog}
                onClose={() => toggleConfirmationDialog(false)}
                onConfirm={() => (activeStep == 2 && IsValidData(batchSendoutData)) ? SendoutImmediate() : (activeStep == 3 && IsValidData(batchSendoutData)) ? SendoutFrequency() : toggleActivation(false)}>
                <Box py={2}>
                    {(activeStep == 2 ? <Box>{t("CommunicationFlowPage.closeDialog")}</Box> :
                        <Box>{t("CommunicationFlowPage.confirmAndSaveSettings")}</Box>)}
                    {(activeStep == 2 ? <Box>{t("CommunicationFlowPage.immediateSendoutDescription")}</Box> : null)}
                </Box>
            </ConfirmDialog>
            <ConfirmDialog
                title={t("CommunicationFlowPage.closeConfirmTitle")}
                open={showCloseConfirmDialog}
                onClose={() => setShowCloseConfirmDialog(false)}
                onConfirm={() => {
                    setShowCloseConfirmDialog(false);
                    closeAndReset();
                }}>
                <Box py={2}>
                    <Box>{t("CommunicationFlowPage.closeConfirmMessage")}</Box>
                </Box>
            </ConfirmDialog>
        </BaseDialog>
    );
}
export default CommunicationFlowPage;
