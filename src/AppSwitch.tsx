import React, { Suspense } from "react";
import { Route, Switch } from "react-router-dom";
import { useAuth } from "./providers/authProvider";
import Routes from "./constants/Routes";
import LoginPage from "./pages/project/auth/LoginPage";
import ResetPasswordPage from "./pages/project/auth/ResetPasswordPage";
import NotFoundPage from "./pages/error/NotFoundPage";
import RegisterUserPage from "./pages/project/auth/RegisterUserPage";
import ConditionalRoute from "./components/routes/ConditionalRoute";
import ForgotPasswordPage from "./pages/project/auth/ForgotPasswordPage";
import ExternalReport from "./pages/ExternalReport";
import AdminSwitch from "./pages/admin/AdminSwitch";
import DashboardSplash from "./pages/DashboardSplash";
import SurveyAnswerPage from "./pages/survey/SurveyAnswerPage";

const HomePage = React.lazy(() => import("./pages/project/home/HomePage"));

const AppSwitch = () => {
    const auth = useAuth();
    const projectCondition = auth.value?.authenticated
        && auth.value.currentProject !== undefined;

    return (
        <Switch>
            {/*AUTH*/}
            <Route exact path={Routes.projectAuth} component={LoginPage} />
            <Route path={Routes.resetPassword} component={ResetPasswordPage} />
            <Route path={Routes.register} component={RegisterUserPage} />
            <Route path={Routes.forgotPassword} component={ForgotPasswordPage} />

            {/* ADMIN */}
            <Route path={Routes.admin} component={AdminSwitch} />

            {/*DASHBOARD*/}
            <ConditionalRoute
                path={Routes.project}
                condition={projectCondition}
                redirect={Routes.projectAuth}
            >
                <Suspense fallback={<DashboardSplash />}>
                    <HomePage />
                </Suspense>
            </ConditionalRoute>

            {/*SURVEY*/}
            <Route path={Routes.survey} component={SurveyAnswerPage} />
            <Route path={Routes.report} component={ExternalReport} />

            {/*ERROR*/}
            <Route path="*" component={NotFoundPage} />
        </Switch>
    )
};


export default AppSwitch;