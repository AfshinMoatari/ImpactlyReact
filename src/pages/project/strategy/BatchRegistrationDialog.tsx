import React from "react";
import { ProjectStrategyServiceType } from "../../../services/projectStrategyService";
import { BatchSendoutRegistration } from "../../../models/Registration";
import { ProjectRegistration } from "../../../models/Strategy";
import RegisterationFlowPage from "../strategies/flow/RegisterationFlowPage";

interface BatchRegistrationDialogProps {
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

const BatchRegistrationDialog: React.FC<BatchRegistrationDialogProps> = ({ 
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
    return (
        <RegisterationFlowPage
            strategyId={strategyId}
            open={open}
            onClose={onClose}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            strategyService={strategyService}
            setBatchRegistrationData={setBatchRegistrationData}
            batchRegistrationData={batchRegistrationData}
            effects={effects}
            category={category}
        />
    )
}

export default BatchRegistrationDialog;