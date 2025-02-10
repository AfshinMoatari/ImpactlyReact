import {Survey} from "../Survey";
import Identifiable from "../Identifyable";

export interface SurveyProperty extends Identifiable {
    parentId: string;
    name: string;
    index: number;
}

interface SurveyCode extends Identifiable {
    id: string;
    projectId: string;
    patientId: string;
    strategyId: string;
    surveys: Survey[];
    properties: SurveyProperty[];
}

export default SurveyCode;