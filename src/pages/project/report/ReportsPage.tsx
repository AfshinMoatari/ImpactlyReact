import React, { useEffect, useState } from "react";
import Routes from "../../../constants/Routes";
import CreateButton from "../../../components/buttons/CreateButton";
import { useHistory } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import { EmptyConditionElements } from "../../../components/containers/EmptyCondition";
import { EmptyButtonView } from "../../../components/containers/EmptyView";
import { useProjectCrudListQuery } from "../../../hooks/useProjectQuery";
import Report from "../../../models/Report";
import OverviewCard from "../../../components/cards/OverviewCard";
import { toTimeAgo } from "../../../lib/date/toTimeAgo";
import HomeBasePage from "../home/HomeBasePage";
import ArticleLineIcon from "remixicon-react/ArticleLineIcon";
import { useTranslation } from "react-i18next";
import FileChartLineIcon from "remixicon-react/FileChartLineIcon";

const ReportsPage = () => {
    const [reports, setReports] = useState<Report[]>()
    const history = useHistory();
    const handleCreate = () => history.push(Routes.projectReport.replace(':reportId', 'new'));
    const reportsQuery = useProjectCrudListQuery(services => services.projectReports);
    const { t } = useTranslation();

    const handleCardClick = (reportId: string) =>
        () => history.push(Routes.projectReport.replace(':reportId', reportId));
    useEffect(() => {
        if (!reportsQuery.query.isLoading) {
            setReports(reportsQuery.elements)
        }
    })
    const onCopy = async (report: Report | undefined) => {
        if (report && reports) {
            const newReport = Object.assign({}, report)
            newReport.id = "";
            newReport.name = t("ReportsPage.reportCopy", { reportName: newReport.name })
            newReport.codeId = undefined
            const res = await reportsQuery.create(newReport)
            if ("next" in res) {
                if (res && res.next) {
                    setReports(res.next)
                }
            }
        }
    };

    return (
        <HomeBasePage
            actions={reportsQuery.elements.length > 0 && <CreateButton text={t("ReportsPage.createReport")} onClick={handleCreate} />}>
            <EmptyConditionElements<Report>
                isLoading={reportsQuery.query.isLoading}
                data={reports}
                empty={(
                    <EmptyButtonView
                        title={t("ReportsPage.noReports")}
                        icon={ArticleLineIcon}
                        subTitle={t("ReportsPage.seeAndShare")}
                        buttonText={t("ReportsPage.createReport")}
                        onClick={handleCreate}
                    />
                )}
            >
                {(reports) =>
                    <Grid container spacing={2}>
                        {reports.map(report => (
                            <Grid key={report.id} item xs={12} md={6} lg={4}>
                                <OverviewCard
                                    reportId={report.id}
                                    title={report.name}
                                    subtitle={t("ReportsPage.edited", { date: toTimeAgo(report.updatedAt) })}
                                    onClick={handleCardClick(report.id)}
                                    onDup={onCopy}
                                    icon={<FileChartLineIcon />}
                                />
                            </Grid>
                        ))}
                    </Grid>
                }
            </EmptyConditionElements>
        </HomeBasePage>
    )
}
    ;


export default ReportsPage;