import searchFilter from "../lib/list/searchFilter";
import SearchListElement from "./SearchListElement";
import { UserIdentification } from "./AuthUser";
import { PatientTag } from "./ProjectTag";
import BDate from "./BDate";
import { RegistrationStatus } from "./Registration";

export interface ProjectPatient extends SearchListElement, UserIdentification {
    id: string;
    parentId?: string;
    name: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    isActive?: boolean;
    anonymity?: boolean;

    // statistics
    group?: string;
    sex?: string;
    birthDate?: string;
    postalNumber?: number;
    municipality?: string;
    region?: string;

    // strategy
    strategyName?: string;
    strategyId?: string;
    lastAnswered?: BDate;
    submissionDate?: BDate;

    // tags
    tags: PatientTag[]
}


export const emptyPatient: ProjectPatient = {
    id: '',
    name: "",
    firstName: '',
    lastName: '',
    municipality: '',
    tags: []
}

export const patientSearchFilter = (search: string) => ({ name, firstName, lastName, municipality, email, phoneNumber, tags }: ProjectPatient) => searchFilter({
    name: name || (firstName + ' ' + lastName),
    email: email ?? '',
    phoneNumber: phoneNumber ?? '',
    municipality: municipality ?? '',
    tags: tags?.map(t => t.name).join(""),
}, search);

export const patientNameSearchFilter = (search: string) => ({ name, firstName, lastName }: ProjectPatient) => searchFilter({
    name: name || (firstName + ' ' + lastName),
}, search);

export const registeredPatientNameSearchFilter = (search: string) => ({ name }: RegistrationStatus) => searchFilter({
    name: name
}, search);

export default ProjectPatient;