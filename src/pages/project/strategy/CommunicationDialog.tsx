import React, {useEffect, useState} from "react";
import CommunicationFlowPage from "../strategies/flow/CommunicationFlowPage";
import { ProjectStrategyServiceType } from "../../../services/projectStrategyService";
import { BatchSendoutData, Frequency } from "../../../models/cron/Frequency";

interface CommunicationDialogProps {
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

const CommunicationDialog: React.FC<CommunicationDialogProps> = ({ 
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

    return (
        <CommunicationFlowPage
        strategyId={strategyId}
        open={open}
        onClose={onClose}
        onChange={onChange}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        strategyService={strategyService}
        onNewValue={onNewValue}
        edit={edit}
        setBatchSendoutData={setBatchSendoutData}
        batchSendoutData={batchSendoutData}
        copyOfBatchSendoutData={copyOfBatchSendoutData}
        frequencies={frequencies}
        />
    )
}

export default CommunicationDialog;