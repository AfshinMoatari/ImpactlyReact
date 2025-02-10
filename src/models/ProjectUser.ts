import searchFilter from "../lib/list/searchFilter";
import SearchListElement from "./SearchListElement";
import {UserIdentification} from "./AuthUser";

export interface ProjectUser extends SearchListElement, UserIdentification {
    id: string;
    firstName?: string;
    lastName?: string;
    name: string;
    phoneNumber?: string;
    active?: boolean;
    email?: string;
    color?: string;
    roleId?: string;
    type?: string;
//    birthDate?: Date;
}

export const emptyProjectUser: ProjectUser = {
    id: '',
    name: '',
}

export const projectUserSearchFilter = (search: string) => ({name, firstName, lastName, email, phoneNumber}: ProjectUser) => searchFilter({
    name: name || (firstName + ' ' + lastName),
    email: email ?? '',
    phoneNumber: phoneNumber ?? '',
}, search);

export default ProjectUser;