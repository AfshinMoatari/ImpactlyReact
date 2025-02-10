import React from 'react';
import { Redirect, Route, Switch } from "react-router-dom";
import { getNavigationList } from "../../constants/NavigationList";
import Routes from "../../constants/Routes";
import PatientPage from "./patient/PatientPage";
import StrategyFlowPage from "./strategies/flow/StrategyFlowPage";
import MePage from "../MePage";
import ReportPage from "./report/ReportPage";
import SettingsPage from "../SettingsPage";
import { checkPermission } from "../../constants/Permissions";
import { useAuth } from "../../providers/authProvider";
import ConditionalRoute from "../../components/routes/ConditionalRoute";
import StrategyPage from "./strategy/StrategyPage";
import { useTranslation } from "react-i18next";
import AnalyticPage from './analytic/AnalyticPage';
import SROIFlowPage from './analytics/flow/SROIFlowPage';

export const DashboardSwitch = () => {

    const auth = useAuth();
    const { t } = useTranslation();
    const navigationList = getNavigationList(t)

    return (
        <Switch>

            <Route path={Routes.projectReport} component={ReportPage} />
            <Route path={Routes.projectPatient} component={PatientPage} />
            <Route path={Routes.projectStrategyFlow} component={StrategyFlowPage} />
            <Route path={Routes.projectStrategy} component={StrategyPage} />
            <Route path={Routes.projectAnalytic} component={AnalyticPage} />
            <Route path={Routes.projectSROIFlow} component={SROIFlowPage} />
            <Route path={Routes.me} component={MePage} />
            <Route path={Routes.projectSettings} component={SettingsPage} />

            {navigationList.map(e => {
                if (e.permission) return (
                    <ConditionalRoute
                        key={e.path}
                        path={e.path}
                        condition={checkPermission(e.permission, auth)}
                        redirect={Routes.projectPatients}
                        component={e.component}
                    />
                )
                return (
                    <Route key={e.path} path={e.path} component={e.component} />
                )
            })}

            <Redirect to={Routes.projectPatients} />
        </Switch>
    )
}

export default DashboardSwitch;
