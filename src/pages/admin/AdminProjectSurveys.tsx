import React, { useState} from "react";
import {Box, Container} from "@material-ui/core";
import {Link, useParams} from "react-router-dom";
import Routes from "../../constants/Routes";
import BasePageToolbar from "../../components/containers/BasePageToolbar";
import BaseTable from "../../components/tables/BaseTable";
import HeadItem from "../../components/tables/HeadItem";
import {Survey} from "../../models/Survey";
import BaseTableCell from "../../components/tables/BaseTableCell";
import history from "../../history";
import {useAdminProjectQuery} from "../../hooks/useAdminProjectQuery";
import {CreateButton} from "../../components/buttons/CreateButton";
import ColoredIconButton from "../../components/buttons/ColoredIconButton";
import FileCopyLineIcon from "remixicon-react/FileCopyLineIcon";
import CopySurveyDialog from "./dialoges/CopySurveyDialog";
import { useAppServices } from "../../providers/appServiceProvider";
import snackbarProvider from "../../providers/snackbarProvider";
import {useMeQuery} from "../../hooks/useMeQuery";
import { Guid } from "../../lib/Guid";

const heads: HeadItem<Survey>[] = [
    {id: "longName", numeric: false, disablePadding: false, label: "Navn"},
];

const AdminProjectSurveys = () => {
    const [search, setSearch] = useState<string>('');
    const { projectId } = useParams<{ projectId: string }>();
    const [copySurvey, setCopySurvey] = useState<Survey | null>(null);
    const open = copySurvey !== null;
    const services = useAppServices();
    const service = services.admin;
    const me = useMeQuery();
    const projectName = me.elements?.projects.find((x)=> x.id == projectId);

    const adminProjectQuery = useAdminProjectQuery(projectId);
    if (adminProjectQuery.query.isLoading) return <div/>;

    const handleClick = (e: React.MouseEvent, surveyId: string) => {
        const route = Routes.adminProjectSurvey
            .replace(":projectId", projectId)
            .replace(":surveyId", surveyId);
        history.push(route);
    }

    const handleCreateSurvey = () => {
        const route = Routes.adminProjectSurvey.replace(":projectId", projectId).replace(":surveyId", Guid.create + "new");
        history.push(route)
    }

    const handleDuplicateClick = (s: Survey) => (e: React.MouseEvent) => {
        setCopySurvey(s);
        e.preventDefault();
        e.stopPropagation();
    };

    const handleCopySurvey = async (projectCopyId: string) =>{
        if(!copySurvey) return;
        const fields = copySurvey?.fields.map((field, fi) => ({
            ...field,
            id: "",
            choices: field.choices.map((choice, ci) => ({
                ...choice,
                id:  "",
            }))
        }))

        const survey = {...copySurvey, fields, id:  ""  } as Survey;
        const res = await service.createProjectSurvey(projectCopyId, survey);
        setCopySurvey(null); //copy done, close modal
        if (res?.success) {
            const route = Routes.adminProjectSurveys
                .replace(":projectId", projectCopyId);
            history.push(route);
            window.location.reload();
            snackbarProvider.success("Kopieret med success!");
        }
    }

    const handleCloseCopySurvey = () =>{
        setCopySurvey(null);
    }

    return (
        <Container>
            <Box pt={4} pb={4}>
                <Link to={Routes.adminProjects}>
                    Projekter
                </Link>
                <p>{projectName?.name}</p>
                <BasePageToolbar
                    search={search}
                    onSearch={setSearch}
                    actionEnd={
                        <CreateButton
                            onClick={handleCreateSurvey}
                            text="Opret spørgeskema"
                        />
                    }
                />
                <div style={{height: 16}}/>
                <BaseTable<Survey>
                    heads={heads}
                    elements={adminProjectQuery.elements?.surveys ?? []}
                    onClick={handleClick}
                    endCell={row => (
                        <BaseTableCell align="right" padding="normal">
                            <ColoredIconButton
                                flat={true}
                                style={{ marginRight: 8 }}
                                onClick={handleDuplicateClick(row)}
                            >
                                <FileCopyLineIcon size={18}/>
                            </ColoredIconButton>
                        </BaseTableCell>
                    )}
                />
            </Box>

            <CopySurveyDialog
                open={open}
                onConfirm={handleCopySurvey}
                onClose={handleCloseCopySurvey}
            >
            </CopySurveyDialog>   
        </Container>
        )
}

export default AdminProjectSurveys;