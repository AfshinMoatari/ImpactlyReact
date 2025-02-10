import {RequestMethod, restClient} from "../../../services/restClient";
import {
    API_BASE_V1_projects,
    HOST,
    isDevelopmentMode,
    isLocalhostMode,
} from "../../../services/appServices";
import storageService from "../../../services/storageService";
import React, {useEffect, useState} from "react";
import ActionButton from "../../../components/buttons/ActionButton";
import HomeBasePage from "../home/HomeBasePage";
import {Box, Button, Tooltip, Typography} from "@material-ui/core";
import history from "../../../history";
import Routes from "../../../constants/Routes";
import {useProjectCrudListQuery} from "../../../hooks/useProjectQuery";
import BasePageToolbar from "../../../components/containers/BasePageToolbar";
import {Survey} from "../../../models/Survey";
import {useAuth} from "../../../providers/authProvider";
import TableCell from "@material-ui/core/TableCell";
import BaseTableCell from "../../../components/tables/BaseTableCell";
import BaseTable from "../../../components/tables/BaseTable";
import HeadItem from "../../../components/tables/HeadItem";
import SurveyCode from "../../../models/codes/SurveyCode";
import Chip from "@material-ui/core/Chip";
import CloseFillIcon from "remixicon-react/CloseFillIcon";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import {NotificationSearchFilter, Notification} from "../../../models/Notifications";
import {EmptyConditionElements} from "../../../components/containers/EmptyCondition";
import EmptyButtonView from "../../../components/containers/EmptyView";
import ColoredIconButton from "../../../components/buttons/ColoredIconButton";
import snackbarProvider from "../../../providers/snackbarProvider";
import {useTranslation} from "react-i18next";
import {TFunction} from "i18next";
import { useAppServices } from "../../../providers/appServiceProvider";

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

interface buttonClicked {
    clickable: boolean,
    patientId: string,
    strategyId: string,
    surveyCode: string,
    notificationId: string,
}

const renderSurveyChip = (notificationModuleConfig: Notification) => {
    return (
        <Box display="flex" maxWidth="160px" flexWrap="wrap">
            {notificationModuleConfig?.surveys?.map((survey) =>
                <Chip key={survey.id} label={survey.name} size="small"/>)
            }
        </Box>
    )
}
export const getNotificationModuleConfigHead = (t: TFunction): HeadItem<Notification>[] => [
    { id: "patientName", numeric: false, disablePadding: false, label: t("Notifications.patientName") },
    { id: "surveyName", numeric: false, disablePadding: false, label: t("Notifications.surveyName"), render: renderSurveyChip },
    {
        id: "sendOutDate",
        numeric: false,
        disablePadding: false,
        label: t("Notifications.sendOutDate"),
        render: (e) => new Date(e.sendOutDate as Date).toLocaleDateString(navigator.language, { hour: '2-digit', minute: '2-digit' })
    },
];
export const Notifications = () => {
        const [reminder, setReminder] = useState<buttonClicked[]>([])
        const [clickable, setClickable] = useState<buttonClicked[]>([])
        const [open, setOpen] = useState<boolean>(false);
        const [openDeleteAll, setOpenDeleteAll] = useState<boolean>(false);
        const [search, setSearch] = useState<string>('');
        const [curModuleConfig, setCurModuleConfig] = useState<Notification | null>()
        const [loading, setLoading] = useState<boolean>()
        const projectId = useAuth().currentProjectId;
        const strategiesQuery = useProjectCrudListQuery(services => services.projectStrategies);
        const strategy = strategiesQuery.elements;
        const patientsQuery = useProjectCrudListQuery(services => services.projectPatients);
        const patients = patientsQuery.elements;
        const notificationsQuery = useProjectCrudListQuery(services => services.projectNotifications);
        let notifications = notificationsQuery.elements;
        const storage = storageService(HOST);
        const client = restClient(HOST, storage);
        const {t} = useTranslation();
        const NotificationModuleConfigHead = getNotificationModuleConfigHead(t);
        const notificationService = useAppServices().projectNotifications(projectId);

        useEffect(() => {
            if (notifications == null) return;
            setLoading(true)
            for (const notification of notifications) {
                if (notification.sendOutDate === undefined) continue;
                if (clickable.find((x) => x.notificationId == notification.id) != null) {
                    const click: buttonClicked = clickable.find((x) => x.patientId === notification.patientId && x.strategyId === notification.strategyId && x.surveyCode === notification.surveyCode) as buttonClicked;
                    click.surveyCode = notification.surveyCode ?? '';
                    click.strategyId = notification.strategyId ?? '';
                    click.patientId = notification.patientId ?? '';
                } else {
                    const date = new Date(notification.sendOutDate)
                    const clickableDate = addDays(date, 2)
                    clickable.push({
                        clickable: new Date() > clickableDate,
                        surveyCode: notification.surveyCode,
                        strategyId: notification.strategyId,
                        patientId: notification.patientId,
                        notificationId: notification.id,
                    } as buttonClicked)
                }
                notification.patientName = patients.find((x) => x.id === notification.patientId)?.name;
            }
            setLoading(false)
        }, [notifications])
        useEffect(() => {
            notificationsQuery.query.refetch().then((res) => {
                setLoading(true)
                if (notifications == null) return;
                for (const notification of notifications) {
                    notification.patientName = patients.find((x) => x.id === notification.patientId)?.name
                }
                notifications = notifications.filter((x) => x.patientName == undefined)
            }).finally(() => {
                setLoading(false)
            })
        }, [patients])
        useEffect(() => {
            notificationsQuery.query.refetch().then(() => {
                patientsQuery.query.refetch();
            });
        }, [reminder])
        const handleDeleteNotification = async () => {
            const res = await notificationsQuery.delete(curModuleConfig?.id ?? '');
            handleClose()
            await notificationsQuery.query.refetch();
            await patientsQuery.query.refetch();
        }
        const handleClose = () => {
            setOpen(false);
            setCurModuleConfig(null)
        }
        const handleCloseDeleteAll = () => {
            setOpenDeleteAll(false);
            setCurModuleConfig(null)
        }
        const handlePatientClick = (rowId: string) => {
            history.push(Routes.projectPatient.replace(":projectPatientId", rowId ?? ''));
        };
        const handleOpenDialog = (moduleConfig: Notification) => () => {
            setOpen(true);
            setCurModuleConfig(moduleConfig)
        }
        const handleDeleteALLNotification = async () => {
            setLoading(true)
            const notificationCounts = notifications?.length
            if(notificationCounts > 0){
                const res = await notificationService.deleteAll(notifications);
                await notificationsQuery.query.refetch();
                await patientsQuery.query.refetch();
                if (res) {
                    snackbarProvider.success(t("Notifications.deleteAllSuccessful", {
                        notificationCounts: notifications?.length
                    }))
                } 
                else {
                    snackbarProvider.error(t("Notifications.deleteAllFailed"))
                }
            }
            else {
                snackbarProvider.warning(t("Notifications.deleteAllNeutral"))
            }
            handleCloseDeleteAll()
            setLoading(false)
        };
        const RemindAll = async () => {
            const reminders: buttonClicked[] = []
            for (const buttonClicked of clickable) {
                if (buttonClicked.clickable) {
                    const codeRes = await client.fetchJSON(RequestMethod.POST, `${API_BASE_V1_projects}/${projectId}/patients/${buttonClicked.patientId}/code/${buttonClicked.strategyId}/send/${buttonClicked.surveyCode}/${buttonClicked.notificationId}`);
                    if (codeRes.success) {
                        const code = codeRes.value as SurveyCode;
                        buttonClicked.clickable = false;
                        reminders.push({
                            patientId: buttonClicked?.patientId,
                            strategyId: buttonClicked?.strategyId,
                            surveyCode: buttonClicked?.surveyCode
                        } as buttonClicked)
                    }
                }
            }
            if (reminders.length > 0) {
                setReminder(r => [...r, ...reminders])
                snackbarProvider.success(t("Notifications.remind"))
            } else {
                snackbarProvider.info(t("Notifications.snackbarInfoNoReminders"))
            }
        };
        const RemindPatient = async (patientId: string, strategyId: string, surveyCode: string, notificationId: string) => {
            const codeRes = await client.fetchJSON(RequestMethod.POST, `${API_BASE_V1_projects}/${projectId}/patients/${patientId}/code/${strategyId}/send/${surveyCode}/${notificationId}`);
            if (isDevelopmentMode || isLocalhostMode) console.log(codeRes);
            if (codeRes.success) {
                const code = codeRes.value as SurveyCode;
                const buttonClicked = clickable.find((x) => x.patientId === patientId && strategyId === x.strategyId && code.id === x.surveyCode);
                if (buttonClicked != null) buttonClicked.clickable = false;
                setReminder(r => [...r, {
                    patientId: patientId,
                    strategyId: strategyId,
                    surveyCode: surveyCode
                } as buttonClicked])
                snackbarProvider.success(t("Notifications.reminderSent"))
            }
        }
        const endCellAction = (nmc: Notification) => {
            return (
                <BaseTableCell align="right" padding="normal"
                               style={{display: "flex", flexDirection: "row", justifyContent: "end"}}
                >
                    {reminder?.find((x) => x.patientId === nmc.patientId && x.strategyId == nmc.strategyId && x.surveyCode == nmc.surveyCode) ?
                        <Typography variant="body2"
                                    style={{color: "#0A081261", alignSelf: "center"}}>
                            {t("Notifications.reminderSent")}
                        </Typography>
                        : !(clickable.find((x) => x.patientId === nmc.patientId && x.strategyId === nmc.strategyId && x.surveyCode === nmc.surveyCode)?.clickable) ?
                            <Button
                                disabled
                                variant="outlined"
                                style={{
                                width: 89,
                                height: 36,
                                borderRadius: 52,
                            }}>
                                {t("Notifications.remind")}
                            </Button> :
                            <Tooltip style={{marginLeft: "10px"}} title={t("Notifications.resend")}>
                            <span>
                                    <Button
                                        disabled={!(clickable.find((x) => x.patientId === nmc.patientId && x.strategyId === nmc.strategyId && x.surveyCode === nmc.surveyCode)?.clickable)}
                                        onClick={() => {
                                            const surveys: Survey[] = [];
                                            const survey = (strategy.find((strategy) => strategy.id === (nmc.strategyId ?? ''))?.surveys.find((survey) => survey.id === nmc.surveyCode));
                                            if (survey != null) surveys.push(survey)
                                            RemindPatient(nmc.patientId ?? '', nmc.strategyId ?? '', nmc.surveyCode ?? '', nmc.id)
                                        }}
                                        style={{
                                            border: "1px solid rgba(237, 76, 47, 0.5)",
                                            borderRadius: 52,
                                            width: 89,
                                            height: 36
                                        }}
                                        variant="outlined"
                                    >
                                        <p style={{
                                            width: 57,
                                            height: 24,
                                            fontFamily: 'Inter',
                                            fontStyle: "normal",
                                            fontWeight: 500,
                                            fontSize: 14,
                                            letterSpacing: 0.4,
                                            textTransform: "uppercase",
                                            color: "#ED4C2F"
                                        }}>
                                            {t("Notifications.remind")}
                                        </p>
                                    </Button>
                            </span>
                            </Tooltip>
                    }
                    <span onClick={handleOpenDialog(nmc)}>
                        <ColoredIconButton
                            flat={true}
                            inverse={true}
                            style={{width: 45, height: 45}}
                        >
                            <CloseFillIcon size={17}/>
                        </ColoredIconButton>
                    </span>
                </BaseTableCell>
            )
        }
        return (
            <HomeBasePage actions={(
                <BasePageToolbar
                    search={notificationsQuery.elements.length > 0 ? search : undefined}
                    onSearch={notificationsQuery.elements.length > 0 ? setSearch : undefined}
                    actionEnd={[ 
                    <ActionButton
                    size="small"
                    onClick={() => RemindAll()}
                    style={{
                            width: 159,
                            height: 36,
                            borderRadius: 52,
                            padding: "6px 16px",
                            marginRight: "5px",
                            textTransform: "uppercase",
                            fontSize: 14
                        }}
                    >{t("Notifications.remindAll")}
                    </ActionButton>,
                    <ActionButton
                        size="small"
                        onClick={() => setOpenDeleteAll(true)}
                        style={{
                            width: 159,
                            height: 36,
                            borderRadius: 52,
                            padding: "6px 16px",
                            marginLeft: "5px",
                            textTransform: "uppercase",
                            fontSize: 14
                        }}
                    >{t("Notifications.deleteAll")}
                    </ActionButton>
                    ]}
                />
            )}>
                <EmptyConditionElements<Notification>
                    isLoading={notificationsQuery.query.isLoading}
                    data={notifications.filter(NotificationSearchFilter(search))}
                    empty={(
                        <EmptyButtonView
                            title={t("Notifications.noActivities")}
                        />
                    )}
                >
                    {(notifications) => {
                        return (<BaseTable<Notification>
                            heads={NotificationModuleConfigHead}
                            elements={notifications}
                            endActions={<TableCell style={{background: 'none'}}/>}
                            endCell={endCellAction}
                        />)
                    }
                    }

                </EmptyConditionElements>
                <ConfirmDialog
                    title={t("Notifications.deleteActivityTitle")}
                    open={Boolean(open)}
                    onClose={handleClose}
                    onConfirm={() => handleDeleteNotification()}
                >
                    {t("Notifications.deleteActivityDescription", {
                        sendOutDate: new Date(curModuleConfig?.sendOutDate ?? Date.now()).toLocaleDateString(),
                        patientName: curModuleConfig?.patientName
                    })}
                </ConfirmDialog>

                <ConfirmDialog
                    title={t("Notifications.deleteAllActivityTitle")}
                    open={Boolean(openDeleteAll)}
                    onClose={handleCloseDeleteAll}
                    onConfirm={() => handleDeleteALLNotification()}
                >
                    {t("Notifications.deleteAllActivityDescription", {
                        notificationCounts: notifications?.length
                    })}
                </ConfirmDialog>
            </HomeBasePage>
        )
    }
;

export default Notifications;