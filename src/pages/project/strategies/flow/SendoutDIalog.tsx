import {Backdrop, CircularProgress, DialogContent} from "@material-ui/core";
import React from "react";
import BaseDialog from "../../../../components/dialogs/BaseDialog";
import { Survey } from "../../../../models/Survey";
import { Guid } from "../../../../lib/Guid";
import ProjectPatient from "../../../../models/ProjectPatient";
import StrategyCreationSurveyView from "./StrategyCreationSurveyView";
import StrategyCreationPatientsView from "./StrategyCreationPatientsView";
import StrategyCreationSendoutTypeView from "./StrategyCreationSendoutTypeView";
import StrategyCreationFrequencyTypeView from "./StrategyCreationFrequencyTypeView";
import { SurveyFrequencyFormValues } from "./FrequencyDialog";
import {useTranslation} from "react-i18next";

interface SendoutDialogProp {
    surveys: Survey[];
    patients: ProjectPatient[];
    surveyFrequencyFormValues: SurveyFrequencyFormValues;
    copyOfSurveyFrequencyFormValues: SurveyFrequencyFormValues;
    onClose: VoidFunction;
    onChange: (value: SurveyFrequencyFormValues) => void;
    setActiveStep: (index: number) => void;
    setsurveyFrequencyFormValues: (data: SurveyFrequencyFormValues) => void;
    activeStep: number;
    open: boolean;
    edit: boolean;
}

const SendoutFlowPage: React.FC<SendoutDialogProp> = ({
                                                          surveys,
                                                          patients,
                                                          surveyFrequencyFormValues,
                                                          copyOfSurveyFrequencyFormValues,
                                                          activeStep,
                                                          onClose,
                                                          onChange,
                                                          setActiveStep,
                                                          setsurveyFrequencyFormValues,
                                                          open,
                                                          edit
                                                      }) => {
    const {t} = useTranslation();
    const setActiveState = (value: number) => {
        if (value < 0) {
            HandleCloseDialog();
        } else {
            setActiveStep(value);
        }
    }

    const onSubmit = async () => {
        if (IsValidData(surveyFrequencyFormValues)){
            surveyFrequencyFormValues.id = edit ? surveyFrequencyFormValues.id : Guid.create().toString();
            onChange(surveyFrequencyFormValues);
            onClose();
        }
    };

    const steps: { title: string, description: string; component: any }[] = [{
        title: t("StrategyFlowPage.SendoutDialog.titleSurvey"),
        description: t("StrategyFlowPage.SendoutDialog.descriptionSurvey"),
        component: <StrategyCreationSurveyView surveys={surveys} copyOfSurveyFrequencyFormValues={copyOfSurveyFrequencyFormValues} edit={edit} surveyFrequencyFormValues={surveyFrequencyFormValues} setsurveyFrequencyFormValues={setsurveyFrequencyFormValues} setActiveState={setActiveState} activeStep={activeStep}/>
    }, {
        title: t("StrategyFlowPage.SendoutDialog.titlePatients"),
        description: t("StrategyFlowPage.SendoutDialog.descriptionPatients"),
        component: <StrategyCreationPatientsView patients={patients} copyOfSurveyFrequencyFormValues={copyOfSurveyFrequencyFormValues} edit={edit} surveyFrequencyFormValues={surveyFrequencyFormValues} setsurveyFrequencyFormValues={setsurveyFrequencyFormValues} setActiveState={setActiveState} activeStep={activeStep}/>
    }, {
        title: t("StrategyFlowPage.SendoutDialog.titleSendoutType"),
        description: t("StrategyFlowPage.SendoutDialog.descriptionSendoutType"),
        component: <StrategyCreationSendoutTypeView surveyFrequencyFormValues={surveyFrequencyFormValues} setsurveyFrequencyFormValues={setsurveyFrequencyFormValues} setActiveState={setActiveState} activeStep={activeStep}/>
    }, {
        title: t("StrategyFlowPage.SendoutDialog.titleFrequencyType"),
        description: t("StrategyFlowPage.SendoutDialog.descriptionFrequencyType"),
        component: <StrategyCreationFrequencyTypeView onSubmit={onSubmit} surveyFrequencyFormValues={surveyFrequencyFormValues} copyOfSurveyFrequencyFormValues={copyOfSurveyFrequencyFormValues} edit={edit} setsurveyFrequencyFormValues={setsurveyFrequencyFormValues} setActiveState={setActiveState} activeStep={activeStep}/>
    }];

    const IsValidData = (surveyFrequencyFormValues: SurveyFrequencyFormValues): boolean => {
        if(surveyFrequencyFormValues == null) return false;
        if(surveyFrequencyFormValues.patientsId == null || surveyFrequencyFormValues.patientsId.length == 0 ) return false;
        if(surveyFrequencyFormValues.surveys == null || surveyFrequencyFormValues.surveys.length == 0 ) return false;
        return true;
    };

    const HandleCloseDialog = () => {
        onClose();
    };

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
            fullWidth={true}
            onClose={() => HandleCloseDialog()}
        >
            <Backdrop style={{
                zIndex: 10,
                color: 'white'
            }} open={false}>
                <CircularProgress color="inherit"/>
            </Backdrop>
            <DialogContent style={{padding: '0px 24px 32px 24px', overflow:"auto"}}>
                {steps[activeStep].component}
            </DialogContent>
        </BaseDialog>
    );
}
export default SendoutFlowPage;
