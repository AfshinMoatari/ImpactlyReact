import searchFilter from "../lib/list/searchFilter";
import CrudModel from "./CrudModel";

export interface Project extends Partial<CrudModel> {
  id: string;
  name: string;
  subscription?: string;
  textLanguage?: string;
  sroiUrl?: string;
  theme?: { [key: number]: string };
}

export const emptyProject: Project = {
  id: "",
  name: "",
  subscription: "starter",
  sroiUrl: "",
};

export const projectNameSearchFilter =
  (search: string) =>
  ({ name }: Project) =>
    searchFilter({ name: name }, search);

export default Project;
