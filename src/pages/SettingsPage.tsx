import React, { useEffect, useState } from "react";
import { useProjectCrudListQuery } from "../hooks/useProjectQuery";
import TagChip from "../components/TagChip";
import ProjectTag from "../models/ProjectTag";
import { ProjectTagServiceType } from "../services/projectTagService";
import { useAuth } from "../providers/authProvider";
import { Card, CardContent, Chip, Grid, InputAdornment, Paper, TextField, Typography, } from "@material-ui/core";
import { useFormik } from "formik";
import renderPhoneNumber from "../lib/string/renderPhoneNumber";
import PhoneFillIcon from "remixicon-react/PhoneFillIcon";
import theme from "../constants/theme";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HomeBasePage from "./project/home/HomeBasePage";
import ConfirmDialog from "../components/dialogs/ConfirmDialog";
import snackbarProvider from "../providers/snackbarProvider";
import ExportDialog from "../components/dialogs/ExportDialog";
import ActionButton from "../components/buttons/ActionButton";
import { RequestMethod, restClient } from "../services/restClient";
import { HOST, PATHS } from "../services/appServices";
import BasePageToolbar from "../components/containers/BasePageToolbar";
import * as Yup from "yup";
import { Divider, List } from "@mui/material";
import { RestErrorResponse, RestSuccessResponse } from "../models/rest/RestResponse";
import { NEW_CHART_COLORS } from "../constants/ChartColors";
import { RiCheckboxBlankCircleFill } from "react-icons/ri";
import storageService from "../services/storageService";
import { useLanguage } from "../LanguageContext"
import { useTranslation } from 'react-i18next';
import FeedbackIcon from "@mui/icons-material/Feedback";
import { Box } from "@mui/material";

interface CustomText {
    WelcomeMessage: string;
    SurveyMessage: string;
}

const SettingsPage = () => {
    const storage = storageService(HOST);
    const client = restClient(HOST, storage);
    const qS = useProjectCrudListQuery(services => services.projectReports);
    const [open, setOpen] = useState<boolean>(false);
    const [shouldRefetch, setShouldRefetch] = useState(false);
    const [initialValues, setInitialValues] = useState({
        WelcomeMessage: "",
        SurveyMessage: "",
    });
    const { t } = useTranslation();
    const { language } = useLanguage();

    const project = useAuth().currentProject;
    useEffect(() => {
        if (project?.theme && Object.keys(project.theme).length > 0) {
            setThemeColor(project.theme);
        } else {
            setThemeColor(NEW_CHART_COLORS);
        }
    }, [project]);


    const refetchCurrentProject = useAuth().refetchCurrentProject;
    const projectId = project?.id;
    const [themeColor, setThemeColor] = useState<{ [key: number]: string }>(() => {
        if (project?.theme && Object.keys(project.theme).length > 0) {
            return project.theme;
        } else {
            return NEW_CHART_COLORS;
        }
    });
    const tagQuery = useProjectCrudListQuery((services) => services.projectTags);
    const usersQuery = useProjectCrudListQuery(
        (services) => services.projectUsers
    );
    const patientsQuery = useProjectCrudListQuery(
        (services) => services.projectPatients
    );
    const [selectedTag, setSelectedTag] = useState<ProjectTag>();
    const dateTimeOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    const fetchData = async () => {
        try {
            const response = await client.fetchJSON<RestSuccessResponse<any> | RestErrorResponse>(RequestMethod.GET, `/api/web/v1/projects/${projectId}/communication`);

            if ("value" in response && Array.isArray(response.value)) {
                const welcomeMessage =
                    response.value.find((item) => item.messageType === "Welcome")
                        ?.messageContent || "";
                const surveyMessage =
                    response.value.find((item) => item.messageType === "Survey")
                        ?.messageContent || "";

                setInitialValues({
                    WelcomeMessage: welcomeMessage,
                    SurveyMessage: surveyMessage,
                });
            } else {
                console.error("Error fetching email/SMS:", response.status);
            }
        } catch (error) {
            console.error("Error fetching email/SMS:", error);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchData();
            setShouldRefetch(false);
        }
    }, [projectId, shouldRefetch]);

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            WelcomeMessage: Yup.string().required("Welcome message is required"),
            SurveyMessage: Yup.string().required("Survey message is required"),
        }),
        onSubmit: async (values: CustomText) => {
            const payload = {
                WelcomeMessage: values.WelcomeMessage,
                SurveyMessage: values.SurveyMessage,
            };
            if (formik.isValid) {
                await client.fetchJSON<void>(
                    RequestMethod.POST,
                    `/api/web/v1/projects/${projectId}/communication`,
                    payload
                );
                snackbarProvider.success(t('CommunicationToCitizens.snackbarSavedText'));
                setShouldRefetch(true);
            }
        },
    });

    const handleExportClose = () => {
        setOpen(false);
    };

    const handleSetSelectedTagClick = (tag?: ProjectTag) => async () =>
        setSelectedTag(tag);

    const handleCopy = () => {
        navigator.clipboard.writeText("daniel@impactly.dk");
        snackbarProvider.success(t('Support.copied'));
    };

    const handleDeleteTag = async () => {
        if (!selectedTag) return;
        await tagQuery.updateQuery<ProjectTagServiceType>((service) =>
            service.archiveTag(selectedTag.id)
        );
        await tagQuery.invalidate();
        snackbarProvider.success(t('Tags.selectedTagDeleted', { selectedTag: selectedTag.name }));
        setSelectedTag(undefined);
    };
    const handleSaveTheme = async () => {
        if (project === undefined) return;
        project.theme = themeColor;
        const response = await client.fetchJSON(
            RequestMethod.POST,
            `${PATHS.projects}/${projectId}/theme`,
            project
        );
        if (response.success) {
            snackbarProvider.success(t('CustomizeTheme.themeSaved'));
            refetchCurrentProject(projectId ?? "");
            await qS.invalidate();
        } else {
            if (response.status >= 500)
                snackbarProvider.error(t('CustomizeTheme.duplicateValue'));
            console.error(response.feedback.message, response.feedback.stacktrace);
        }
    };
    const MAX_CHARACTER_LIMIT = 240;

    const phoneNumber = "20729960";
    const phonePrefix = "+45";

    const handleCopyPhone = () => {
        navigator.clipboard.writeText(phoneNumber);
        snackbarProvider.success(t('Support.copied'));
    };

    return (
        <HomeBasePage
            title={t('HomeBasePage.title')}
            actions={
                <BasePageToolbar
                    actionEnd={
                        <ActionButton
                            size="small"
                            onClick={() => setOpen(true)}
                            style={{
                                width: 159,
                                borderRadius: 52,
                                padding: "6px 16px",
                                textTransform: "uppercase",
                                fontSize: 14,
                            }}
                        >
                            {t('HomeBasePage.exportData')}
                        </ActionButton>
                    }
                />
            }
        >
            <Grid container spacing={2}>
                <Grid item xs={5}>
                    <Paper elevation={0} style={{ borderRadius: 4 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h3" component="h2">
                                    {project?.name}
                                </Typography>
                                {project?.subscription === "starter" ? (
                                    <div>
                                        <Typography variant="h2" color="secondary">
                                            {t('starterPlan.plan')}
                                        </Typography>
                                        <Typography variant="subtitle2">
                                            {t('solutionType', { count: usersQuery.elements.length })}
                                        </Typography>
                                        <Typography variant="subtitle2">
                                            {t('starterPlan.upgrade')}
                                        </Typography>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "flex-end",
                                                marginTop: 24,
                                            }}
                                        >
                                            <PhoneFillIcon
                                                color={theme.palette.secondary.main}
                                                size={17}
                                            />
                                            <Typography
                                                variant="subtitle2"
                                                style={{ marginLeft: 16, marginRight: 8 }}
                                            >
                                                {renderPhoneNumber("24903184")}
                                            </Typography>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Typography variant="subtitle2">
                                            {t('SubscriptionPlans.premiumPlan.solutionTypePremium', { count: usersQuery.elements.length })}
                                            {new Date(project?.createdAt ?? "").toLocaleDateString(language, dateTimeOptions)}
                                            .
                                        </Typography>
                                    </div>
                                )}
                                <div style={{ marginTop: 15 }}>
                                    <Chip
                                        label={t('SubscriptionPlans.employeesChip', { count: usersQuery.elements.length })}
                                        style={{ marginRight: 20 }}
                                    />
                                    <Chip label={t('SubscriptionPlans.citizensChip', { count: patientsQuery.elements.length })} />
                                </div>
                            </CardContent>
                        </Card>
                    </Paper>
                    <Paper
                        elevation={0}
                        style={{ borderRadius: 4, marginBottom: 20, marginTop: 20 }}
                    >
                        <Typography variant="h3" style={{ margin: "20px 20px 0 20px" }}>
                            {t('Tags.title')}
                        </Typography>
                        {tagQuery.elements.length === 0 ? (
                            <Typography
                                variant="subtitle2"
                                style={{ margin: "0 20px 20px 20px" }}
                            >
                                {t('Tags.noTags')}
                            </Typography>
                        ) : (
                            <List
                                sx={{
                                    width: "100%",
                                }}
                            >
                                <li>
                                    <Typography
                                        variant="subtitle2"
                                        style={{ margin: "0 20px 1px 20px" }}
                                    >
                                        {t('Tags.removeTags')}
                                    </Typography>
                                </li>
                                <Divider component="li" />
                                <li
                                    style={{
                                        display: "flex",
                                        width: "calc(100% - 40px)",
                                        margin: "16px 20px 0 20px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {tagQuery.elements.map((tag) => (
                                        <TagChip
                                            style={{
                                                borderRadius: 16,
                                                maxWidth: "100%",
                                                marginBottom: 5,
                                            }}
                                            tag={tag}
                                            onDelete={handleSetSelectedTagClick(tag)}
                                        />
                                    ))}
                                </li>
                            </List>
                        )}
                    </Paper>
                    <Paper elevation={0} style={{ borderRadius: 4 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h3">{t('Support.title')}</Typography>
                                <Typography variant="subtitle2" style={{ marginBottom: 15 }}>
                                    {t('Support.availability')}
                                </Typography>
                                <TextField
                                    style={{ width: "100%", marginBottom: 15 }}
                                    variant={"outlined"}
                                    id="input-with-icon-textfield"
                                    disabled
                                    label="Email"
                                    value="daniel@impactly.dk"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment onClick={handleCopy} position="end">
                                                <ContentCopyIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    style={{ width: "100%" }}
                                    variant={"outlined"}
                                    disabled
                                    label="Phone"
                                    value={`${phonePrefix} ${phoneNumber}`}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment
                                                position="end"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <ContentCopyIcon onClick={handleCopyPhone} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {project?.subscription === "premium" && (
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <PhoneFillIcon
                                            color={theme.palette.secondary.main}
                                            size={17}
                                        />
                                        <Typography
                                            variant="subtitle2"
                                            style={{ marginLeft: 16, marginRight: 8 }}
                                        >
                                            {renderPhoneNumber("20729960")}
                                        </Typography>
                                    </div>
                                )}
                                <Box
                                    sx={{
                                        marginTop: 2,
                                        padding: 2,
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: 1,
                                        border: '1px solid #e0e0e0'
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: 1
                                        }}
                                    >
                                        <FeedbackIcon
                                            style={{
                                                color: '#ff4444',
                                                marginRight: 8,
                                                fontSize: 20
                                            }}
                                        />
                                        {t('Support.feedbackTitle')}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                    >
                                        {t('Support.feedbackDescription')}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Paper>
                    {useAuth().permissions.find((x) => x == "Permissions.Settings.Write") ? (
                        <Paper
                            elevation={0}
                            style={{ borderRadius: 4, marginBottom: 20, marginTop: 20 }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="h3" style={{ margin: "20px 20px 0 20px" }}>
                                    {t('CustomizeTheme.title')}
                                </Typography>
                                <ActionButton
                                    size="small"
                                    style={{
                                        margin: "14px 20px 0 20px",
                                        height: 32,
                                        borderRadius: 52,
                                        textTransform: "uppercase",
                                        fontSize: 14,
                                    }}
                                    onClick={() => handleSaveTheme()}
                                >
                                    {t('CustomizeTheme.saveButton')}
                                </ActionButton>
                            </div>
                            <Typography
                                variant="subtitle2"
                                style={{ margin: "0 20px 20px 20px" }}
                            >
                                {t('CustomizeTheme.subtitle')}
                            </Typography>
                            <List
                                sx={{
                                    width: "100%",
                                }}
                            >
                                <li
                                    style={{
                                        display: "flex",
                                        width: "calc(100% - 40px)",
                                        margin: "16px 20px 0 20px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {Object.entries(themeColor).map(([index, color]) => (
                                        <TextField
                                            key={index}
                                            style={{ marginBottom: 20 }}
                                            fullWidth
                                            variant="outlined"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <RiCheckboxBlankCircleFill
                                                            size={25}
                                                            color={color}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            InputLabelProps={{ shrink: true }}
                                            label={t('CustomizeTheme.colorLabel', {
                                                sequence: t(`Sequences.Ordinal.${index}`)
                                            })}
                                            value={color}
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                const updatedTheme = { ...themeColor, [parseInt(index)]: event.target.value };
                                                setThemeColor(updatedTheme);
                                            }}
                                        />
                                    ))}
                                </li>
                            </List>
                        </Paper>
                    ) : (
                        <></>
                    )}
                </Grid>
                <Grid item xs={7}>
                    <Paper elevation={0} style={{ borderRadius: 4 }}>
                        <form onSubmit={formik.handleSubmit}>
                            <List
                                sx={{
                                    width: "100%",
                                }}
                            >
                                <li style={{ margin: 20 }}>
                                    <Typography variant="h3">
                                        {t('CommunicationToCitizens.title')}
                                    </Typography>
                                    <Typography variant="subtitle2" style={{ marginBottom: 15 }}>
                                        {t('CommunicationToCitizens.subtitle')}
                                    </Typography>
                                </li>
                                <Divider component="li" />
                                <li style={{ margin: "20px 0", padding: "8px 20px" }}>
                                    <Typography
                                        variant="h4"
                                        style={{ fontWeight: "bold", marginBottom: 0 }}
                                    >
                                        {t('WelcomeEmailSMS.title')}
                                    </Typography>
                                    <Typography
                                        variant="subtitle2"
                                        style={{ marginBottom: 25, marginTop: 0 }}
                                    >
                                        {t('WelcomeEmailSMS.charactersRemaining')}
                                        {MAX_CHARACTER_LIMIT - formik.values.WelcomeMessage?.length}
                                    </Typography>
                                    <Typography variant="subtitle2" style={{ margin: "10px 0" }}>
                                        {t('WelcomeEmailSMS.opening')}
                                    </Typography>
                                    <TextField
                                        name="WelcomeMessage"
                                        id="welcomeText"
                                        fullWidth
                                        variant={"outlined"}
                                        label={t('WelcomeEmailSMS.label')}
                                        multiline
                                        value={formik.values.WelcomeMessage}
                                        onChange={formik.handleChange}
                                        inputProps={{ maxLength: MAX_CHARACTER_LIMIT }}
                                        style={{ backgroundColor: "white" }}
                                    />
                                    <Typography variant="subtitle2" style={{ margin: "10px 0" }}>
                                        {t('WelcomeEmailSMS.closing')}
                                    </Typography>
                                </li>
                                <Divider component="li" />
                                <li style={{ margin: "16px 0", padding: "8px 20px" }}>
                                    <Typography
                                        variant="h4"
                                        style={{ fontWeight: "bold", marginBottom: 0 }}
                                    >
                                        {t('SurveyEmailSMS.title')}
                                    </Typography>
                                    <Typography
                                        variant="subtitle2"
                                        style={{ marginBottom: 25, marginTop: 0 }}
                                    >
                                        {t('WelcomeEmailSMS.charactersRemaining')}
                                        {MAX_CHARACTER_LIMIT - formik.values.SurveyMessage?.length}
                                    </Typography>
                                    <Typography variant="subtitle2" style={{ margin: "10px 0" }}>
                                        {t('WelcomeEmailSMS.opening')}
                                    </Typography>
                                    <TextField
                                        name="SurveyMessage"
                                        fullWidth
                                        variant={"outlined"}
                                        label={t('SurveyEmailSMS.label')}
                                        multiline
                                        value={formik.values.SurveyMessage}
                                        onChange={formik.handleChange}
                                        inputProps={{ maxLength: MAX_CHARACTER_LIMIT }}
                                        style={{ backgroundColor: "white" }}
                                    />
                                    <Typography variant="subtitle2" style={{ margin: "10px 0" }}>
                                        {t('SurveyEmailSMS.link')}
                                        <br />
                                        {t('WelcomeEmailSMS.closing')}
                                    </Typography>
                                </li>
                                <Divider component="li" />
                                <li
                                    style={{
                                        margin: "16px 20px",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <ActionButton
                                        variant="outlined"
                                        onClick={formik.handleReset}
                                        style={{
                                            marginRight: 15,
                                            borderRadius: 52,
                                            height: 32,
                                            textTransform: "uppercase",
                                            fontSize: 14,
                                        }}
                                    >
                                        {t('ActionButtons.reset')}
                                    </ActionButton>
                                    <ActionButton
                                        size="small"
                                        type="submit"
                                        disabled={!formik.isValid}
                                        style={{
                                            height: 32,
                                            borderRadius: 52,
                                            padding: "6px 16px",
                                            textTransform: "uppercase",
                                            fontSize: 14,
                                        }}
                                    >
                                        {t('ActionButtons.save')}
                                    </ActionButton>
                                </li>
                            </List>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
            <ConfirmDialog
                title={t('ConfirmDialog.title')}
                open={Boolean(selectedTag)}
                onClose={handleSetSelectedTagClick(undefined)}
                onConfirm={handleDeleteTag}
            >
                {t('ConfirmDialog.message')}
            </ConfirmDialog>
            <ExportDialog
                open={open}
                onClose={handleExportClose}
                tags={tagQuery.elements}
            />
        </HomeBasePage>
    );
};

export default SettingsPage;
