import React, { useState } from "react"
import HomeBasePage from "../home/HomeBasePage";
import { useTranslation } from "react-i18next";
import CreateButton from "../../../components/buttons/CreateButton";
import { EmptyConditionElements } from "../../../components/containers/EmptyCondition";
import { EmptyButtonView } from "../../../components/containers/EmptyView"
import MindMapIcon from "remixicon-react/MindMapIcon";
import { Grid } from "@material-ui/core";
import OverviewCard from "../../../components/cards/OverviewCard";
import { toTimeAgo } from "../../../lib/date/toTimeAgo";
import FolderChartLineIcon from 'remixicon-react/FolderChartLineIcon';
import history from "../../../history";
import Routes from "../../../constants/Routes";
import { useProjectCrudListQuery } from "../../../hooks/useProjectQuery";
import Analytics from "../../../models/Analytics";
import LoadingOverlay from "../../../components/feedback/LoadingOverlay";
import { useAppServices } from "../../../providers/appServiceProvider";
import { useAuth } from "../../../providers/authProvider";
import AnalyticsPickerDialog from './AnalyticsPickerDialog';

const AnalyticsPage: React.FC = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const analyticsQuery = useProjectCrudListQuery(service => service.projectAnalytics)
    const projectId = useAuth().currentProjectId;
    const projectAnalytics = useAppServices().projectAnalytics(projectId);
    const qS = useProjectCrudListQuery(services => services.projectAnalytics);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const handleCreateAnalyticsClick = () => {
        setIsPickerOpen(true);
    };
    const handleCardClick = (s: Analytics) => () => history.push(Routes.projectAnalytic.replace(":analyticId", s.id))

    const handleEdit = (analytic: Analytics) => async () => {
        history.push(
            Routes.projectAnalyticsFlow
                .replace(':moduleType', analytic.type)
                .replace(':action', 'edit')
                .replace(':analyticId', analytic.id),
            { analyticsData: analytic, isEdit: true }
        );
    };

    const handleDuplicate = async (s: Analytics) => {
        setIsLoading(true);
        try {
            await projectAnalytics.copyAnalyticReport(s.id);
            await qS.invalidate();
        } catch (error) {
            console.error("Failed to delete:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (analytic: Analytics) => {
        setIsLoading(true);
        try {
            await analyticsQuery.delete(analytic.id);
            await qS.invalidate();
        } catch (error) {
            console.error("Failed to delete:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {isLoading && <LoadingOverlay />}
            <HomeBasePage
                actions={analyticsQuery.elements.length > 0 &&
                    <CreateButton text={t('AnalyticsPage.add')} onClick={handleCreateAnalyticsClick} />}
            >
                <EmptyConditionElements
                    isLoading={analyticsQuery.query.isLoading}
                    data={analyticsQuery.elements}
                    empty={
                        <EmptyButtonView
                            title={t('AnalyticsPage.noAnalyticsCalc')}
                            icon={MindMapIcon}
                            subTitle={t('AnalyticsPage.weHelpYouSetUp')}
                            buttonText={t('AnalyticsPage.createAnalytics')}
                            onClick={handleCreateAnalyticsClick}
                        />
                    }
                >
                    {(analytics) => (
                        <Grid container spacing={2}>
                            {analytics.map(analytic => (
                                <Grid item xs={12} sm={6} lg={4} key={analytic.id}>
                                    <OverviewCard
                                        title={analytic.name}
                                        subtitle={t("AnalyticsPage.edited", { date: toTimeAgo(analytic.updatedAt) })}
                                        onClick={handleCardClick(analytic)}
                                        onEdit={handleEdit(analytic)}
                                        onDelete={() => handleDelete(analytic)}
                                        onDup={() => handleDuplicate(analytic)}
                                        icon={<FolderChartLineIcon />}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </EmptyConditionElements>
            </HomeBasePage>
            <AnalyticsPickerDialog
                open={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                analytics={analyticsQuery.elements || []}
            />
        </>
    )
};

export default AnalyticsPage;