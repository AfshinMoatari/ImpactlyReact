import UserProject from "./UserProject";
import searchFilter from "../lib/list/searchFilter";

export interface AuthUser extends UserIdentification {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    imageUrl: string,
    roleId: string;
    permissions: string[];
    active: boolean;
}

export interface UserIdentification {
    id: string;
    name: string;
}


export const emptyUser: AuthUser = {
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    name: "",
    phoneNumber: "",
    imageUrl: "",
    roleId: "",
    permissions: [],
    active: false,
}

export interface OverviewUser extends AuthUser {
    name: string;
    projects: UserProject[];
    isAdmin: boolean;
}

export const overviewUserSearchFilter = (search: string) => ({name, email, isAdmin, projects}: OverviewUser) => searchFilter({
    name: name,
    email: email,
    admin: isAdmin ? "admin" : "",
    projects: projects.map(p => p.name).join("")
}, search);

export interface AdminUser {
    id: string;
    name: string;
}

export default AuthUser;
