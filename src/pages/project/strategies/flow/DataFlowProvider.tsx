import React, {createContext, useContext, useState} from "react";
import Strategy, {ProjectRegistration} from "../../../../models/Strategy";
import {Frequency} from "../../../../models/cron/Frequency";
import {Survey} from "../../../../models/Survey";
import ProjectPatient from "../../../../models/ProjectPatient";

interface StrategyFlowState {
    surveys: Survey[];
    patients: ProjectPatient[];
    frequencies: Frequency[];
    effects: ProjectRegistration[];
}

interface StrategyFlowTouched {
    stepFrequencies: boolean;
    stepEffects: boolean;
}

interface DSContextProps {
    state: StrategyFlowState;
    touched: StrategyFlowTouched;
    onTouch: (s: "stepFrequencies" | "stepEffects") => void;
    onChange: (s: StrategyFlowState) => void;
}

const DataStrategyContext = createContext<DSContextProps>({
    state: {surveys: [], patients: [], effects: [], frequencies: []},
    onChange: s => s,
    touched: {
        stepFrequencies: false,
        stepEffects: false
    },
    onTouch: t => t
});

export const useStrategyContext = () => useContext(DataStrategyContext)

export const DataFlowProvider: React.FC = ({children}) => {

    const [touched, setTouched] = useState<StrategyFlowTouched>({
        stepFrequencies: false,
        stepEffects: false
    });

    const onTouch = (s: "stepFrequencies" | "stepEffects") => {
        const t = {...touched}
        t[s as keyof StrategyFlowTouched] = true;
        setTouched(t)
    }

    const [state, setState] = useState<StrategyFlowState>({
        surveys: [],
        patients: [],
        effects: [],
        frequencies: [],
    });

    const onChange = (s: StrategyFlowState) => setState(s);

    return (
        <DataStrategyContext.Provider value={{state, onChange, touched, onTouch}}>
            {children}
        </DataStrategyContext.Provider>
    )
}

export default useStrategyContext;