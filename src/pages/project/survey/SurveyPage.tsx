import React, { useEffect, useState } from "react";
import HomeBasePage from "../home/HomeBasePage";
import BasePageToolbar from "../../../components/containers/BasePageToolbar";
import { useProjectSurveys, useTemplateSurveys } from "../../../hooks/useSurveys";
import history from "../../../history";
import Routes from "../../../constants/Routes";
import { Survey } from "../../../models/Survey";
import { RiArrowRightSLine, RiCheckLine } from "react-icons/ri";
import SurveyLineIcon from "remixicon-react/SurveyLineIcon";
import { TextField } from "@material-ui/core";
import {
    Box,
    Card,
    Chip,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Paper,
} from "@mui/material";
import CustomTypography from "../../../components/CustomTypography";
import ActionButton from "../../../components/buttons/ActionButton";
import { Formik, FormikHelpers } from "formik";
import { useAuth } from "../../../providers/authProvider";
import searchFilter from "../../../lib/list/searchFilter";
import SurveyBuilder from "./SurveyBuilder";
import { useAppServices } from "../../../providers/appServiceProvider";
import { useProjectCrudListQuery } from "../../../hooks/useProjectQuery";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import { useTranslation } from "react-i18next";
import snackbarProvider from "../../../providers/snackbarProvider";
import { RestErrorResponse, RestSuccessResponse } from "../../../models/rest/RestResponse";
import DeleteButton from "../../../components/buttons/DeleteButton";
import * as Yup from 'yup';
import { Guid } from "../../../lib/Guid";

const surveyValidationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    longName: Yup.string().required("Long Name is required"),
    description: Yup.string().required("Description is required")
});

const surveySearch = (search: string) => (survey: Survey) => searchFilter({
    name: survey.name,
    longName: survey.longName
}, search);
const surveyFilter = (filter: string, surveys: Survey[]) => {
    return filter === "validated" ? surveys.filter((s) => s.validated) : surveys.filter((s) => !s.validated)
}
export const SurveyPage: React.FC = () => {
    const { t } = useTranslation()
    const filterOption = [
        { value: "", label: t("SurveyBuilder.filterNone") },
        { value: "validated", label: t("SurveyBuilder.filterValidated") },
        { value: "custom", label: t("SurveyBuilder.filterCustomSurvey") },
    ];
    const strategiesQuery = useProjectCrudListQuery(service => service.projectStrategies)
    const surveysInUse: string[] = []
    for (let index = 0; index < strategiesQuery.elements.length; index++) {
        const element = strategiesQuery.elements[index];
        element.surveys.map((survey) => {
            //need to be improved after https://trello.com/c/VCsSZX4I
            if ((survey.parentId !== "TEMPLATE" && !surveysInUse.includes(survey.id))) surveysInUse.push(survey.id)
        })
    }
    const [showSavePopup, setShowSavePopup] = useState(false);
    const [inUse, setInUse] = useState(false);
    const [showInUsePopup, setShowInUsePopup] = useState(false);
    const projectId = useAuth().currentProjectId;
    const services = useAppServices();
    const projectSurveyQuery = useProjectSurveys(projectId, services);
    const [surveyData, setSurveyData] = useState<Survey[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const surveyResponse = await projectSurveyQuery.query;
            if (surveyResponse?.data) {
                setSurveyData(surveyResponse.data.surveys);
            }
        };
        fetchData();
    }, [projectSurveyQuery.query]);

    // Function to update survey data after successful handleSubmit
    const updateSurveyData = async () => {
        const surveyResponse = await projectSurveyQuery.query.refetch(); // Refetch survey data
        if (surveyResponse?.data) {
            setSurveyData(surveyResponse.data.surveys); // Update survey data
        }
    };

    const [templateSurveys, templateLoading] = useTemplateSurveys(projectId, services);
    const surveys = [...templateSurveys, ...surveyData];
    const loading = projectSurveyQuery.loading;
    const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");
    const [edit, setEdit] = useState(false);
    const [surveyId, setSurveyId] = useState(window.location.pathname.split("/").at(-1) ?? "");
    const [safeName, setSafeName] = useState("");
    const [selected, setSelected] = useState<Survey>(surveys?.find(
        (s) => s.id === window.location.pathname.split("/").at(-1)
    ) ?? surveys[0]);
    const [openSave, setOpenSave] = useState<boolean>(false);
    const handleSavedOpen = () => setOpenSave(true);
    const handleClickCloseSave = () => {
        setOpenSave(false);
    }
    const handleConfirmDisable = () => {
        return !selected || safeName.toLowerCase().trim() !== selected.name.toLowerCase().trim();
    };
    const isNew = surveyId === "new";
    useEffect(() => {
        setSelected(
            surveys?.find(
                (s) => s.id === window.location.pathname.split("/").at(-1)
            ) ?? surveys[0]
        );
    }, [loading]);
    useEffect(() => {
        setInUse(surveysInUse.includes(selected?.id))
    }, [selected, showInUsePopup])
    useEffect(() => {
        if (!selected) return;
        return () => setSafeName("")
    }, [selected]);
    useEffect(() => {
        setSurveyId(selected?.id ?? '')
    }, [selected])

    useEffect(() => {
        if (surveys.length > 0) {
            if (filter && search) {
                setFilteredSurveys(surveyFilter(filter, surveys).filter(surveySearch(search)));
            } else if (search) {
                setFilteredSurveys(surveys.filter(surveySearch(search)));
            } else if (filter) {
                setFilteredSurveys(surveyFilter(filter, surveys));
            } else {
                setFilteredSurveys(surveys);
            }
        }
    }, [filter, search, surveys.length]);

    const handleSubmit = async (values: Survey, formikHelpers: FormikHelpers<Survey>) => {
        if (values.validated) return;
        setEdit(false);
        const fields = values.fields.map((field, fi) => ({
            ...field,
            id: field.id.includes("new") ? Guid.create().toString() : field.id,
            index: fi,
            choices: field.choices.map((choice, ci) => ({
                ...choice,
                id: choice.id,
                index: ci,
            }))
        }));

        const survey = { ...values, fields, id: isNew ? "" : surveyId };
        const res = await projectSurveyQuery.updateProjectSurvey(survey);

        if (res?.success) {
            // Replace the survey with the updated one in the surveys array
            const updatedSurveys = [...templateSurveys, ...projectSurveyQuery.surveys].map(existingSurvey => {
                if (existingSurvey.id === res.value.id) {
                    return res.value;
                }
                return existingSurvey;
            });

            // Update filteredSurveys
            const updatedFilteredSurveys = filter && search
                ? surveyFilter(filter, updatedSurveys).filter(surveySearch(search))
                : search
                    ? updatedSurveys.filter(surveySearch(search))
                    : filter
                        ? surveyFilter(filter, updatedSurveys)
                        : updatedSurveys;

            // Update filteredSurveys state
            setFilteredSurveys(updatedFilteredSurveys);

            updateSurveyData();
            setEdit(false);
        }
    };

    const handleDelete = async () => {
        if (!isNew) {
            if (selected.validated) return null;
            const res: RestErrorResponse | RestSuccessResponse<string | {
                id?: string | undefined;
            }> = await projectSurveyQuery.deleteProjectSurvey(surveyId);
            if (res.status > 400) snackbarProvider.error(res.feedback.message ?? "")
            else {
                const route = Routes.projectSurvey.replace(":projectId", projectId);
                projectSurveyQuery.query.refetch();
                setEdit(false)
                setSelected(projectSurveyQuery.surveys[0])
                history.push(route);
                window.location.reload()
            }
        }
    }
    const handleCreateClick = () => {
        const newSurvey: Survey = {
            index: 0,
            parentId: "",
            id: "new",
            name: '',
            longName: '',
            description: '',
            fields: [],
            validated: false,
            max: 0,
            min: 0,
            threshold: [],
            isNegative: false
        }
        surveys.push(newSurvey)
        setSelected(newSurvey)
        setEdit(true)
        const route = Routes.projectSurveyView.replace(":surveyId", "new");
        history.push(route)
    };
    const handleEditClick = () => {
        if (surveysInUse.includes(selected.id)) return setShowInUsePopup(true);
        setEdit(true);
    };
    const handleSurveyClick = (survey: Survey) => {
        if (edit) return setShowSavePopup(true)
        window.scrollTo(0, 0);
        history.push(Routes.projectSurveyView.replace(":surveyId", survey.id));
        setSelected(survey);
    };
    const handlePopupClose = () => {
        setEdit(false)
        setShowSavePopup(false)
    }
    const handleInUsePopupClose = () => {
        setShowInUsePopup(false)
    }

    const handleDiscard = (resetForm: () => void) => {
        resetForm();
        setEdit(false);
        const initialSelected = surveys.find(s => s.id === window.location.pathname.split("/").at(-1)) ?? surveys[0];
        setSelected(initialSelected);
    };

    return (
        <Formik<Survey>
            onSubmit={handleSubmit}
            initialValues={selected}
            validateOnMount={false}
            enableReinitialize={true}
            validationSchema={surveyValidationSchema}
        >
            {(formik) => {
                const { resetForm } = formik;
                return (
                    <>
                        <HomeBasePage
                            actions={
                                <BasePageToolbar
                                    actionEnd={
                                        <Box display={"flex"} gap={2}>
                                            {edit ? (
                                                <>
                                                    <DeleteButton
                                                        title={t("SurveyBuilder.deleteBtn")}
                                                        buttonText={t("SurveyBuilder.deleteBtn")}
                                                        size={24}
                                                        message={[t('SurveyBuilder.deleteDialogMessage'), t('SurveyBuilder.deleteDialogMessage2'), t('CrudDialog.enterConfirmText')]}
                                                        secure={true}
                                                        securityText={t("keywords.delete")}
                                                        onConfirm={handleDelete}
                                                    />
                                                    <ActionButton
                                                        onClick={() => handleDiscard(resetForm)}
                                                        variant="outlined"
                                                        style={{
                                                            borderRadius: 52,
                                                            textTransform: "uppercase",
                                                            fontSize: 15,
                                                        }}
                                                    >
                                                        {t("SurveyBuilder.cantNavigateAwayBtnDiscard")}
                                                    </ActionButton>
                                                    <ActionButton
                                                        onClick={() => { inUse ? handleSavedOpen() : formik.submitForm() }}
                                                        style={{
                                                            borderRadius: 52,
                                                            textTransform: "uppercase",
                                                            fontSize: 15,
                                                        }}
                                                        disabled={selected?.validated}
                                                    >
                                                        {t("SurveyBuilder.cantNavigateAwayBtnSave")}
                                                    </ActionButton>
                                                </>
                                            ) : (
                                                <>
                                                    <ActionButton
                                                        title={t("SurveyBuilder.duplicate")}
                                                        disabled={!selected || selected.validated}
                                                        style={{
                                                            borderRadius: 52,
                                                            textTransform: "uppercase",
                                                            fontSize: 15,
                                                        }}
                                                        onClick={async () => {
                                                            try {
                                                                const newSurveyId = Guid.create().toString();
                                                                const copiedSurvey = {
                                                                    ...selected,
                                                                    id: "",  // Empty string for new survey
                                                                    name: t("SurveyBuilder.copyOf", { surveyName: selected.name }),
                                                                    longName: t("SurveyBuilder.copyOf", { surveyName: selected.longName }),
                                                                    description: t("SurveyBuilder.copyOf", { surveyName: selected.description }),
                                                                    validated: false,
                                                                    fields: selected.fields.map(field => {
                                                                        const newFieldId = Guid.create().toString();
                                                                        return {
                                                                            ...field,
                                                                            id: newFieldId,
                                                                            parentId: newSurveyId,
                                                                            choices: field.choices.map(choice => ({
                                                                                ...choice,
                                                                                id: Guid.create().toString(),
                                                                                parentId: newFieldId
                                                                            }))
                                                                        };
                                                                    })
                                                                };

                                                                const res = await projectSurveyQuery.updateProjectSurvey(copiedSurvey);
                                                                if (res?.success) {
                                                                    await projectSurveyQuery.query.refetch();
                                                                    setSelected(res.value);
                                                                    history.push(Routes.projectSurveyView.replace(":surveyId", res.value.id));
                                                                } else {
                                                                    snackbarProvider.error("Failed to duplicate survey");
                                                                }
                                                            } catch (error) {
                                                                console.error('Error duplicating survey:', error);
                                                                snackbarProvider.error("Error duplicating survey");
                                                            }
                                                        }}
                                                    >
                                                        {t("SurveyBuilder.duplicate")}
                                                    </ActionButton>
                                                    <ActionButton
                                                        onClick={handleEditClick}
                                                        disabled={!selected || selected.validated}
                                                        style={{
                                                            borderRadius: 52,
                                                            textTransform: "uppercase",
                                                            fontSize: 15,
                                                        }}
                                                    >
                                                        {t("SurveyBuilder.editBtn")}
                                                    </ActionButton>
                                                    <ActionButton
                                                        onClick={handleCreateClick}
                                                        style={{
                                                            borderRadius: 52,
                                                            textTransform: "uppercase",
                                                            fontSize: 15,
                                                        }}
                                                    >
                                                        {t("SurveyBuilder.addBtn")}
                                                    </ActionButton>
                                                    {/*               {process.env.NODE_ENV === 'development' && (
                                                        <ActionButton
                                                            title="Delete All Non-Validated"
                                                            style={{
                                                                borderRadius: 52,
                                                                textTransform: "uppercase",
                                                                fontSize: 15,
                                                                backgroundColor: 'red',
                                                                color: 'white'
                                                            }}
                                                            onClick={async () => {
                                                                try {
                                                                    const nonValidatedSurveys = surveys.filter(s => !s.validated);
                                                                    for (const survey of nonValidatedSurveys) {
                                                                        await projectSurveyQuery.deleteProjectSurvey(survey.id);
                                                                    }
                                                                    await projectSurveyQuery.query.refetch();
                                                                    setSelected(surveys.find(s => s.validated) ?? surveys[0]);
                                                                    snackbarProvider.success(`Deleted ${nonValidatedSurveys.length} surveys`);
                                                                } catch (error) {
                                                                    console.error('Error deleting surveys:', error);
                                                                    snackbarProvider.error("Error deleting surveys");
                                                                }
                                                            }}
                                                        >
                                                            Delete All Non-Validated
                                                        </ActionButton>
                                                    )} */}
                                                </>
                                            )}

                                        </Box>
                                    }
                                />
                            }
                        >
                            <div style={{
                                backgroundColor: '#ed2626',
                                color: 'white',
                                textAlign: 'center',
                                width: '98%',
                                padding: "10px",
                                marginBottom: "10px",
                                borderRadius: "4px"
                            }}>
                                BETA - ikke klar til brug endnu!
                            </div>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Card
                                        style={{
                                            borderLeft: "1px solid #D5D4DA",
                                            borderRight: "1px solid #D5D4DA",
                                        }}
                                    >
                                        <Paper>
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                                height={89}
                                                borderBottom={"1px solid #D5D4DA"}
                                            >
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        paddingTop: 16,
                                                        paddingLeft: 16,
                                                        borderBottom: "1px solid #D5D4DA",
                                                        height: "89px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <CustomTypography
                                                        fontFamily={"'Lora', sans-serif"}
                                                        variant="h5"
                                                        size={24}
                                                        fontWeight={400}
                                                    >
                                                        {t("SurveyBuilder.listTitle")}
                                                    </CustomTypography>
                                                    <CustomTypography
                                                        fontFamily={"'Inter', sans-serif"}
                                                        variant="caption"
                                                        style={{ paddingBottom: 16 }}
                                                        size={14}
                                                    >
                                                        {t("SurveyBuilder.listSubHeader")}
                                                    </CustomTypography>
                                                </div>
                                            </Box>

                                            <List style={{ padding: 0 }}>
                                                <ListItem
                                                    style={{
                                                        borderBottom: "1px solid #D5D4DA",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                    }}
                                                >
                                                    <TextField
                                                        label={t("SurveyBuilder.search")}
                                                        size={"small"}
                                                        value={search}
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                            setSearch(event.target.value);
                                                        }}
                                                    />
                                                    <TextField
                                                        select
                                                        size={"small"}
                                                        style={{ minWidth: 206 }}
                                                        label={t("SurveyBuilder.filter")}
                                                        value={filter}
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                            setFilter(event.target.value);
                                                        }}
                                                    >
                                                        {filterOption.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </ListItem>
                                                {filteredSurveys.map((s) => (
                                                    <ListItem
                                                        onClick={() => handleSurveyClick(s)}
                                                        key={s.id}
                                                        style={{
                                                            borderBottom: "1px solid #D5D4DA",
                                                            backgroundColor:
                                                                selected?.id === s.id ? "#F1F0F6" : "#FFFFFF",
                                                            cursor: "pointer",
                                                            height: 64,
                                                        }}
                                                    >
                                                        <SurveyLineIcon
                                                            color="#C1BBD8"
                                                            style={{ marginRight: 16 }}
                                                        />
                                                        <ListItemText primary={s.name} />
                                                        {s.validated ? (
                                                            <Chip label={t("SurveyBuilder.validated")} color="info" />
                                                        ) : (
                                                            <></>
                                                        )}
                                                        <ListItemSecondaryAction>
                                                            <IconButton
                                                                edge="end"
                                                                aria-label="delete"
                                                                onClick={() => handleSurveyClick(s)}
                                                            >
                                                                {selected?.id === s.id ? (
                                                                    <RiCheckLine color="#63539A" />
                                                                ) : (
                                                                    <RiArrowRightSLine />
                                                                )}
                                                            </IconButton>
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Paper>
                                    </Card>
                                </Grid>

                                <Grid item xs>
                                    <Card>
                                        <Paper>
                                            <SurveyBuilder
                                                survey={selected}
                                                onSubmit={handleSubmit}
                                                edit={edit}
                                                isNew={isNew}
                                                formik={formik}
                                                t={t}
                                                isInUse={inUse}>
                                            </SurveyBuilder>
                                        </Paper>
                                    </Card>
                                </Grid>

                            </Grid>
                        </HomeBasePage>
                        <ConfirmDialog
                            open={openSave}
                            onClose={handleClickCloseSave}
                            onConfirm={() => {
                                formik.submitForm();
                                setOpenSave(false);
                            }}
                            disabled={handleConfirmDisable()}
                        >
                            <>
                                <div>
                                    {t('SurveyBuilder.inUseSave')}
                                </div>
                                <>
                                    <div style={{ marginTop: 16, marginBottom: 16 }}>
                                        {t('SurveyBuilder.inUseSave2')}
                                    </div>
                                    <div>
                                        {t('CrudDialog.enterElementName')}
                                    </div>
                                    <TextField
                                        value={safeName}
                                        onChange={e => setSafeName(e.target.value)}
                                    />
                                </>
                            </>
                        </ConfirmDialog>
                        <ConfirmDialog
                            title={t("SurveyBuilder.inUse")}
                            open={showInUsePopup}
                            onClose={handleInUsePopupClose}
                            onConfirm={() => {
                                setEdit(true)
                                setShowInUsePopup(false)
                            }}
                        >
                            <CustomTypography>
                                {t("SurveyBuilder.inUseModalDescription")}
                            </CustomTypography>
                            <CustomTypography>
                                {t("SurveyBuilder.inUseModalDescription2")}
                            </CustomTypography>
                        </ConfirmDialog>
                        <ConfirmDialog
                            title={t("SurveyBuilder.cantNavigateAwaySaveChanges")}
                            open={showSavePopup}
                            onClose={handlePopupClose}
                            onConfirm={() => {
                                setShowSavePopup(false)
                                formik.submitForm()
                            }}
                        >
                            <CustomTypography>
                                {t("SurveyBuilder.cantNavigateAwayDescription")}
                            </CustomTypography>
                            <CustomTypography>
                                {t("SurveyBuilder.cantNavigateAwayDescription2")}
                            </CustomTypography>
                        </ConfirmDialog>
                    </>
                )
            }}
        </Formik>
    );
};

export default SurveyPage;
