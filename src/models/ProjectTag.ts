import BDate from "./BDate";

export interface ProjectTag {
    id: string;
    name: string;
    color: string;
    deletedAt: BDate;
}

export interface PatientTag extends ProjectTag {
    projectTagId: string;
}

export default ProjectTag;
