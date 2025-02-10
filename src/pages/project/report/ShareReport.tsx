import {TextField} from "@material-ui/core";
import {PrimaryIconButton} from "../../../components/buttons/BlueButton";
import FileCopyLineIcon from "remixicon-react/FileCopyLineIcon";
import ShareLineIcon from "remixicon-react/ShareLineIcon";
import React, {useState} from "react";
import Report from "../../../models/Report";
import snackbarProvider from "../../../providers/snackbarProvider";
import {useAppServices} from "../../../providers/appServiceProvider";
import {useAuth} from "../../../providers/authProvider";
import {useTranslation} from "react-i18next";

interface ShareReportProps {
    report: Report;
    onShare: (codeId: string) => void;
}

const ShareReport: React.FC<ShareReportProps> = ({ report, onShare }) => {
    const reportService = useAppServices().projectReports(useAuth().currentProjectId);
    const {t} = useTranslation();

    const handleShare = async () => {
        if (!report.id) return snackbarProvider.warning(t("ReportPage.ShareReport.reportNotSaved"));

        const res = await reportService.shareReport(report.id);
        if (!res.success) return snackbarProvider.showFeedback(res.feedback);

        onShare(res.value.id);
        snackbarProvider.success(t("ReportPage.ShareReport.shareReport"));
    }

    const reportLink = report.codeId === undefined ? "" : `${window.location.protocol}//${window.location.host}/r/${report.codeId}`
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(reportLink);
        if (!copied) snackbarProvider.success(t("ReportPage.ShareReport.linkCopied"));
        setCopied(true);
    }

    if (report.codeId) return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <TextField
                value={reportLink}
                onSelect={handleCopy}
                variant="outlined"
                label={t("ReportPage.ShareReport.linkLabel")}
                size="small"
                style={{ marginRight: 8, minWidth: 256 }}
            />
            <PrimaryIconButton
                onClick={handleCopy}
                icon={FileCopyLineIcon}
                disabled={!report?.id}
            />
        </div>
    )

    return (
        <PrimaryIconButton
            onClick={handleShare}
            icon={ShareLineIcon}
            disabled={!report?.id}
        >
            {t("ReportPage.ShareReport.shareButton")}
        </PrimaryIconButton>
    )
}

export default ShareReport;
