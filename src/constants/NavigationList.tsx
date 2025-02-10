import Routes from './Routes';
import React from "react";
import { RemixiconReactIconComponentType } from "remixicon-react";
import PatientListPage from "../pages/project/patients/PatientListPage";
import StrategiesPage from "../pages/project/strategies/StrategiesPage";
import UserListPage from "../pages/project/users/UserListPage";
import User2LineIcon from "remixicon-react/User2LineIcon";
import ReportsPage from "../pages/project/report/ReportsPage";
import Permissions from "./Permissions";
import { RouteComponentProps } from "react-router";
import GroupLineIcon from "remixicon-react/GroupLineIcon";
import Notifications from "../pages/project/notifications/Notifications";
import SurveyLineIcon from 'remixicon-react/SurveyLineIcon';
import BarChartBoxLineIcon from 'remixicon-react/BarChartBoxLineIcon';
import FolderChartLineIcon from 'remixicon-react/FolderChartLineIcon';
import Notification2FillIcon from 'remixicon-react/Notification2FillIcon';
import OrganizationChart from "remixicon-react/OrganizationChartIcon"
import { SurveyPage } from '../pages/project/survey/SurveyPage';
import AnalyticsPage from '../pages/project/analytics/AnalyticsPage';

export interface ActionNavItem {
    name: string;
    path: string;
    component?: React.ReactNode;
}

export interface NavItem {
    name: any;
    showRedDot?: boolean;
    checkRedDot?: boolean;
    external?: boolean;
    scroll?: boolean;
    icon: RemixiconReactIconComponentType;
    path: string;
    feature?: string;
    permission?: string;
    startActions?: [ActionNavItem, ...ActionNavItem[]];
    endActions?: [ActionNavItem, ...ActionNavItem[]];
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any> | undefined;
}

export const getNavigationList = (t: any) => {
    return [
        {
            name: t('navigationMain.Reporting'),
            icon: BarChartBoxLineIcon,
            scroll: true,
            path: Routes.projectReports,
            component: ReportsPage
        },
        {
            name: t('navigationMain.Strategies'),
            icon: OrganizationChart,
            scroll: true,
            path: Routes.projectStrategies,
            component: StrategiesPage,
            permission: Permissions.settingsRead,
        },
        {
            name: t('navigationMain.Surveys'),
            icon: SurveyLineIcon,
            path: Routes.projectSurvey,
            component: SurveyPage,
            permission: Permissions.admin
        },
        {
            name: t('navigationMain.Citizens'),
            icon: GroupLineIcon,
            scroll: true,
            path: Routes.projectPatients,
            component: PatientListPage
        },
        {
            name: t('navigationMain.Users'),
            icon: User2LineIcon,
            path: Routes.projectUsers,
            component: UserListPage,
        },
        {
            name: t('navigationMain.Analytics'),
            icon: FolderChartLineIcon,
            path: Routes.projectAnalytics,
            component: AnalyticsPage
        },
        {
            name: t('navigationMain.Activity'),
            icon: Notification2FillIcon,
            path: Routes.notifications,
            component: Notifications
        },
    ];
}

