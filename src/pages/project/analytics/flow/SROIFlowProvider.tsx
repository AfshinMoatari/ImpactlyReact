import React, { createContext, useContext, useState } from "react";
import { Confirmation, FundingSource, General, Intervention, Method, Outcome, Stakeholder, TargetGroup } from "../../../../models/SROIFlow";

export interface SROIFlowState {
    general: General;
    intervention: Intervention;
    targetGroup: TargetGroup;
    stakeholders: Stakeholder[];
    fundingSource: FundingSource;
    outcomes: Outcome[];
    method: Method;
    confirmation: Confirmation;
}

interface SROIFlowTouched {
    stepGeneral: boolean;
    stepIntervention: boolean;
    stepTargetGroup: boolean;
    stepStakeholders: boolean;
    stepFundingSource: boolean;
    stepOutcomes: boolean;
    stepMethod: boolean;
    stepConfirmation: boolean;
}

interface DSContextProps {
    state: SROIFlowState;
    touched: SROIFlowTouched;
    onTouch: (s: "stepGeneral" | "stepIntervention" | "stepTargetGroup" | "stepStakeholders" | "stepFundingSource" | "stepOutcome" | "stepMethod") => void;
    onChange: (s: SROIFlowState) => void;
}

export class DefaultSROIFlowState implements SROIFlowState {
    general: General;
    intervention: Intervention;
    targetGroup: TargetGroup;
    stakeholders: Stakeholder[];
    fundingSource: FundingSource;
    outcomes: Outcome[];
    method: Method;
    confirmation: Confirmation;

    constructor() {
        this.general = {
            isForcast: false,
            reportName: '',
            executiveSummary: '',
            reportLanguage: 'en-US',
            currency: 'DKK',
            logo: ''
        };
        this.intervention = {
            interventionName: '',
            interventionDescription: '',
            purpose: '',
            activities: [],
            participants: 0,
            businessCaseLength: 0
        };
        this.targetGroup = {
            category: '',
            customCategory: '',
            ageGroupMin: 0,
            ageGroupMax: 0,
            targetGroupDescription: '',
            riskFactors: ''
        };
        this.stakeholders = [{
            stakeholderName: '',
            stakeholderAmount: 0,
            changes: []
        }];
        this.fundingSource = {
            totalCosts: 0,
            fundings: [{
                fundingName: '',
                proportion: 0
            }]
        };
        this.outcomes = [];
        this.method = {
            description: ''
        };
        this.confirmation = {
            isSavedTemplate: true,
            templateName: null
        };
    }
}

const DataSROIContext = createContext<DSContextProps>({
    state: new DefaultSROIFlowState(),
    onChange: s => s,
    touched: {
        stepGeneral: false,
        stepIntervention: false,
        stepTargetGroup: false,
        stepStakeholders: false,
        stepFundingSource: false,
        stepOutcomes: false,
        stepMethod: false,
        stepConfirmation: false,
    },
    onTouch: t => t
});

export const useSROIContext = () => useContext(DataSROIContext)

// Add this interface to define the provider props
interface SROIFlowProviderProps {
    children: React.ReactNode;
    initialState: SROIFlowState;
}

// Update the provider component definition
export const SROIFlowProvider: React.FC<SROIFlowProviderProps> = ({ children, initialState }) => {

    const [touched, setTouched] = useState<SROIFlowTouched>({
        stepGeneral: false,
        stepIntervention: false,
        stepTargetGroup: false,
        stepStakeholders: false,
        stepFundingSource: false,
        stepOutcomes: false,
        stepMethod: false,
        stepConfirmation: false
    });

    const onTouch = (s: "stepGeneral" | "stepIntervention" | "stepTargetGroup" | "stepStakeholders" | "stepFundingSource" | "stepOutcome" | "stepMethod" | "stepConfirmation") => {
        const t = { ...touched }
        t[s as keyof SROIFlowTouched] = true;
        setTouched(t)
    }

    const [state, setState] = useState<SROIFlowState>(initialState);

    const onChange = (s: SROIFlowState) => setState(s);

    return (
        <DataSROIContext.Provider value={{ state, onChange, touched, onTouch }}>
            {children}
        </DataSROIContext.Provider>
    )
}

export default useSROIContext;