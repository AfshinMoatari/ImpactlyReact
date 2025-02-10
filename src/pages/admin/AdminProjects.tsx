import React, {useState} from 'react';
import {Box, Container, TextField, MenuItem} from "@material-ui/core";
import HeadItem from "../../components/tables/HeadItem";
import Project from "../../models/Project";
import BasePageToolbar from "../../components/containers/BasePageToolbar";
import BaseTable from "../../components/tables/BaseTable";
import {useCrudListQuery} from "../../hooks/useCrudListQuery";
import {BaseTableCell} from '../../components/tables/BaseTableCell';
import ExternalLinkLineIcon from "remixicon-react/ExternalLinkLineIcon";
import BaseTableHead from '../../components/tables/BaseTableHead';
import ColoredIconButton from "../../components/buttons/ColoredIconButton";
import {nameSearchFilter} from "../../lib/list/searchFilter";
import {useAuth} from "../../providers/authProvider";
import Routes from "../../constants/Routes";
import {CreateButton} from "../../components/buttons/CreateButton";
import * as Yup from "yup";
import {Field} from "formik";
import {Link} from "react-router-dom";
import CrudDialog from "../../components/dialogs/CrudCialog";
import {Validators} from "../../lib/Validators";
import SurveyLineIcon from "remixicon-react/SurveyLineIcon";
import UploadLineIcon from "remixicon-react/UploadLineIcon";
import history from "../../history";

const heads: HeadItem<Project>[] = [
    {id: "name", numeric: false, disablePadding: false, label: "Navn"},
];

const ProjectSchema = Yup.object().shape({
    name: Validators.required(),
    textLanguage: Yup.string().when('id', {
        is: undefined, // only when creating a project
        then: Yup.string().required('Language is required')
    })
});

const AdminProjects = () => {
    const projects = useCrudListQuery(services => services.projects);
    const [project, setProject] = useState<Project>();
    const [search, setSearch] = useState<string>('');
    const filteredProjects: Project[] = projects.elements.filter(nameSearchFilter(search));
    const auth = useAuth();

    const handleCreateProject = () => setProject({name: "", textLanguage: ""} as Project);

    const handleProjectClick = (e: React.MouseEvent<HTMLTableRowElement>, rowId: string) => {
        const p = projects.elements.find(p => p.id === rowId);
        setProject(p);
    };

    const handleSubmit = async (values: Partial<Project>) => {
        await projects.update(values as Project)
        setProject(undefined);
    }

    const handleDeleteProject = async () => {
        if (project?.id) {
            await projects.delete(project.id);
            setProject(undefined);
        }
    }

    const handleView = (p: Project) => (e: React.MouseEvent) => {
        auth.switchProject(p.id, Routes.projectUsers);
        e.preventDefault();
        e.stopPropagation();
    }

    const handleSurveyClick = (p: Project) => (e: React.MouseEvent) => {
        history.push(Routes.adminProjectSurveys.replace(":projectId", p.id));
        e.preventDefault();
        e.stopPropagation();
    }

    const handleInputClick = (p: Project) => (e: React.MouseEvent) => {
        history.push(Routes.adminProjectInput.replace(":projectId", p.id));
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <Container>
            <Box pt={4} pb={4}>

                <Link to={Routes.adminUsers}>
                    Brugere
                </Link>

                <BasePageToolbar
                    search={search}
                    onSearch={setSearch}
                    actionEnd={
                        <CreateButton
                            onClick={handleCreateProject}
                            text="Opret projekt"
                        />
                    }
                />
                <div style={{height: 16}}/>
                <BaseTable<Project>
                    heads={heads}
                    elements={filteredProjects}
                    onClick={handleProjectClick}
                    endActions={<BaseTableHead/>}
                    endCell={row => (
                        <BaseTableCell align="right" padding="normal">
                            <ColoredIconButton
                                flat={true}
                                style={{ marginRight: 8 }}
                                onClick={handleInputClick(row)}
                            >
                                <UploadLineIcon size={18}/>
                            </ColoredIconButton>
                            <ColoredIconButton
                                flat={true}
                                onClick={handleSurveyClick(row)}
                                style={{ marginRight: 8 }}
                            >
                                <SurveyLineIcon size={18}/>
                            </ColoredIconButton>
                            <ColoredIconButton
                                flat={true}
                                onClick={handleView(row)}
                            >
                                <ExternalLinkLineIcon size={18}/>
                            </ColoredIconButton>
                        </BaseTableCell>
                    )}
                />
            </Box>

            <CrudDialog<Partial<Project>>
                onCancel={() => setProject(undefined)}
                title={project?.id ? "Opdater projektnavn" : "Opret projekt"}
                onDelete={project?.id ? handleDeleteProject : undefined}
                element={project}
                onSubmit={handleSubmit}
                validationSchema={ProjectSchema}
                validateOnMount
                enableReinitialize
                safe
            >
                {() => (
                    <>
                        <Field
                            as={TextField}
                            name="name"
                            label="Projektnavn"
                            type="text"
                            variant='filled'
                            fullWidth
                            required
                            autoFocus
                        />
                        {project?.id ? null : (
                            <Field
                                as={TextField}
                                select
                                name="textLanguage"
                                label="Language"
                                variant="filled"
                                fullWidth
                                required
                            >
                                <MenuItem value="English">English</MenuItem>
                                <MenuItem value="Danish">Dansk</MenuItem>
                            </Field>
                        )}
                    </>
                )}
            </CrudDialog>
        </Container>
    )
}

export default AdminProjects;
