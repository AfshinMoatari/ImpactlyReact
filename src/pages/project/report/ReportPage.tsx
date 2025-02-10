import React, { ChangeEvent, createRef, useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import { useParams } from "react-router-dom";
import history from "../../../history";
import { useProjectCrudQuery } from "../../../hooks/useProjectQuery";
import Report from "../../../models/Report";
import Routes from "../../../constants/Routes";
import useInvalidate from "../../../hooks/useInvalidate";
import { PATHS } from "../../../services/appServices";
import { blobToFile, takeScreenshot } from "../../../lib/canvas";
import { useAppServices } from "../../../providers/appServiceProvider";
import { useAuth } from "../../../providers/authProvider";
import SaveLineIcon from "remixicon-react/SaveLineIcon";
import { PrimaryIconButton } from "../../../components/buttons/BlueButton";
import DeleteButton from "../../../components/buttons/DeleteButton";
import ShareReport from "./ShareReport";
import HomeBasePage from "../home/HomeBasePage";
import ReportGrid from "./ReportGrid";
import AddLineIcon from "remixicon-react/AddLineIcon";
import { Prompt } from "react-router";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import { useTranslation } from "react-i18next";
import LoadingOverlay from "../../../components/feedback/LoadingOverlay";

const ReportPage: React.FC = () => {
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<boolean>(true);
    const [lastLocation, setLastLocation] = useState(null)
    const [confirmedNavigation, setConfirmedNavigation] = useState(true)
    const [isLoading, setIsLoading] = useState(false);
    const { reportId } = useParams<{ reportId: string }>();
    const reportQuery = useProjectCrudQuery(reportId, service => service.projectReports)
    const reportService = useAppServices().projectReports(useAuth().currentProjectId);
    const ref = createRef<HTMLDivElement>();
    const invalidate = useInvalidate();
    let [report, setReport] = useState<Report>({
        name: reportId === "new" ? "Unavngivet" : "",
        moduleConfigs: []
    } as unknown as Report);
    const [changes, setChanges] = useState(0);
    const [picker, setPicker] = useState(false);
    const [mount, setMount] = useState(false);
    const handleClosePicker = () => setPicker(false);
    const [saveTimeout, setSaveTimeout] = useState<ReturnType<typeof setTimeout>>();
    const { t } = useTranslation();
    const project = useAuth().currentProject;
    const handleChangeReport = (r: Report) => {
        setPrompt(true)
        setReport(r);
        report = r;
        setChanges(changes + 1);
        //autosave 
        clearTimeout(saveTimeout);
        setSaveTimeout(setTimeout(handleSaveClick, 2000));
    }

    useEffect(() => {
        if (changes <= 1)
            setChanges(0)
    }, [mount])

    useEffect(() => {
        if (reportQuery.value !== undefined) {
            setReport(reportQuery.value);
            setMount(true)
        }
    }, [reportQuery.value?.id])

    useEffect(() => {
        if (lastLocation && !showDialog && confirmedNavigation) {
            history.push(lastLocation)
        }
    })
    useEffect(() => {
        if (!confirmedNavigation && showDialog) {
            setShowDialog(false)
        }
    })
    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => handleChangeReport({ ...report, name: e.target.value })

    const handleUploadImage = async (reportId: string, file?: File, title?: string, description?: string) => {
        if (file != null && title != null) {
            return await reportService.updateImage(reportId, file, title, description)
        } else if (ref.current) {
            await takeScreenshot(ref.current, async (blob) => {
                if (blob === null) return;
                const file = blobToFile(blob, reportId);
                await reportService.updateImage(reportId, file);
            })
        }
    }

    const handleSaveClick = async () => {
        if (!report) return;
        if (!report.id || report.id === "new") {
            setPrompt(false)
            const res = await reportQuery.create(report);
            if (res && res.next) {
                setReport(res.next);
                history.replace(Routes.projectReport.replace(':reportId', res.next.id));
                for (const moduleConfig of report.moduleConfigs) {
                    if (moduleConfig.type == "pictureUpload") {
                        const response = await handleUploadImage(report.id, moduleConfig.file as File, moduleConfig.title);
                        if (response?.success) {
                            if (response?.success) {
                                if (response.value.images) {
                                    for (const image of response.value.images) {
                                        if (image.description === moduleConfig.id) {
                                            moduleConfig.file = image.url;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            for (const moduleConfig of report.moduleConfigs) {
                if (moduleConfig.type == "pictureUpload") {
                    const response = await handleUploadImage(report.id, moduleConfig.file as File, moduleConfig.title, moduleConfig.id);
                    if (response?.success) {
                        if (response.value.images) {
                            for (const image of response.value.images) {
                                if (image.description === moduleConfig.id) {
                                    moduleConfig.file = image.url;
                                }
                            }
                        }
                    }
                }
            }
        }
        await reportQuery.update(report);
        setPrompt(false)
        await invalidate(PATHS.projectReports)
        await reportQuery.invalidate();
        setChanges(0);
        clearTimeout(saveTimeout)
    }

    const handleShare = (codeId: string) => setReport({ ...report, codeId })

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            if (!report.id) return;
            await reportQuery.delete(report.id);
            setConfirmedNavigation(true)
            await invalidate(PATHS.projectReports)
            setPrompt(false)
            history.push(Routes.projectReports);
        } catch (error) {
            console.log("Failed to delete", error)
        } finally {
            setIsLoading(false)
        }
    }
    const handleBlockedNavigation = (nextLocation: any, action: any) => {
        if (confirmedNavigation && changes <= 0) {
            return true
        }
        showModal(nextLocation)
        return false
    }
    const handleConfirmNavigationClick = () => {
        if (lastLocation) {
            setShowDialog(false);
            setConfirmedNavigation(true);
            setChanges(0)
        }
    }
    const showModal = (location: any) => {
        setConfirmedNavigation(true)
        setShowDialog(true);
        setLastLocation(location);
    }

    const closeModal = () => {
        setConfirmedNavigation(false)
        setShowDialog(false);
    }

    //adding a check to handle old reports created before the adding of the pie charts
    if (report && report.moduleConfigs && report.moduleConfigs.length > 0) {
        for (const moduleConfig of report.moduleConfigs) {
            if (moduleConfig.graphType === null) {
                moduleConfig.graphType = 1;
            }
        }
    }

    return (
        <HomeBasePage
            title={
                <TextField
                    id="name"
                    label={t("ReportPage.title")}
                    value={report.name}
                    onChange={handleNameChange}
                    variant="outlined"
                    style={{ marginRight: 8 }}
                    size="small"
                    fullWidth
                />
            }
            backRoute={Routes.projectReports}
            actions={(
                <div style={{ display: "flex", alignItems: "center" }}>
                    <PrimaryIconButton
                        onClick={() => setPicker(true)}
                        icon={AddLineIcon}
                        size="small"
                        style={{ marginRight: 8, minWidth: 78 }}
                    >
                        {t("ReportPage.add")}
                    </PrimaryIconButton>
                    <PrimaryIconButton
                        onClick={handleSaveClick}
                        disabled={changes === 0}
                        icon={SaveLineIcon}
                        size="small"
                        style={{ marginRight: 8, minWidth: 78 }}
                    >
                        {t("ReportPage.save")}
                    </PrimaryIconButton>
                    {report.id && <ShareReport report={report} onShare={handleShare} />}
                    {report.id && (
                        <DeleteButton
                            onConfirm={handleDelete}
                            message={t("ReportPage.deleteMessage")}
                            title={t("ReportPage.delete")}
                            size={24}
                        />
                    )}
                </div>
            )}>
            {isLoading && <LoadingOverlay />}
            <Prompt
                when={prompt && isLoading}
                message={handleBlockedNavigation}
            />
            <ConfirmDialog title={t("ReportPage.continueWithoutSave")} open={showDialog} onClose={closeModal}
                onConfirm={handleConfirmNavigationClick}><span>{t("ReportPage.continiueConfirm")}</span></ConfirmDialog>
            <ReportGrid
                ref={ref}
                report={report}
                onChange={handleChangeReport}
                openPicker={picker}
                onClosePicker={handleClosePicker}
            />
        </HomeBasePage>
    )
}


export default ReportPage;
