import Identifiable from "./Identifyable";
import {Frequency} from "./cron/Frequency";
import ProjectPatient from "./ProjectPatient";
import {Survey} from "./Survey";

export type RegistrationType = "count" | "numeric" | "status";

export const RegistrationTypeMap = (t: any) => {
    
    return {
        "count": t("StrategyBatchRegistrations.incident"),
        "numeric": t("StrategyBatchRegistrations.numeric"),
        "status": t("StrategyBatchRegistrations.status"),
    };
};

export interface PRegistration extends Identifiable {
    name: string;
    type: "count" | "numeric";
}

export interface PStatusRegistration extends Identifiable {
    category: string;
    name: string;
    type: "status";
    index: number;
}

export type ProjectRegistration = PRegistration | PStatusRegistration;

export const regName = (pr: ProjectRegistration) => {
    return pr.type === "status" ? `${(pr as PStatusRegistration).category}: ${pr.name}` : pr.name;
}

export const regCategory = (pr: ProjectRegistration) => {
    return pr.type === "status" ? `${(pr as PStatusRegistration).category}` : pr.name;
}

export const distinctEffects = (prs: ProjectRegistration[]) : ProjectRegistration[] => {
    const statusEffects = Object.values(
        prs.filter(x => x.type == "status").reduce((acc, obj) => ({ ...acc, [(obj as PStatusRegistration).category]: obj }), {})
    )

    prs.filter(x => x.type !== "status").forEach(pr => {
        (pr as PStatusRegistration).category = pr.name;
        statusEffects.push(pr);
    });
    return (statusEffects as ProjectRegistration[]);
};

interface Strategy extends Identifiable {
    name: string;
    patients: ProjectPatient[];
    effects: ProjectRegistration[];
    frequencies: Frequency[];
    surveys: Survey[];
}

export default Strategy;
