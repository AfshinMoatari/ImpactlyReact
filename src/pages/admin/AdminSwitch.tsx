import {Redirect, Route, Switch} from "react-router-dom";
import React from "react";
import ConditionalRoute from "../../components/routes/ConditionalRoute";
import Routes from "../../constants/Routes";
import AdminProjects from "./AdminProjects";
import AdminUsers from "./AdminUsers";
import {useAuth} from "../../providers/authProvider";
import AdminAuth from "./AdminAuth";
import {parseJwt} from "../../lib/jwt";
import AdminProjectSurveys from "./AdminProjectSurveys";
import AdminProjectSurvey from "./AdminProjectSurvey";
import AdminProjectInput from "./AdminProjectInput";


export const AdminSwitch = () => {

    const auth = useAuth();
    const adminCondition = Boolean(auth.value?.authenticated
        && parseJwt(auth.value?.authorization?.accessToken)?.aid);

    return (
        <Switch>

            <Route path={Routes.adminAuth} component={AdminAuth}/>

            <ConditionalRoute
                path={Routes.adminProjectInput}
                condition={adminCondition}
                component={AdminProjectInput}
                redirect={Routes.adminAuth}
            />

            <ConditionalRoute
                path={Routes.adminProjectSurvey}
                condition={adminCondition}
                component={AdminProjectSurvey}
                redirect={Routes.adminAuth}
            />
            <ConditionalRoute
                path={Routes.adminProjectSurveys}
                condition={adminCondition}
                component={AdminProjectSurveys}
                redirect={Routes.adminAuth}
            />

            <ConditionalRoute
                path={Routes.adminProjects}
                condition={adminCondition}
                component={AdminProjects}
                redirect={Routes.adminAuth}
            />

            <ConditionalRoute
                path={Routes.adminUsers}
                condition={adminCondition}
                component={AdminUsers}
                redirect={Routes.adminAuth}
            />


            <Redirect to={Routes.adminAuth}/>
        </Switch>
    )
}

export default AdminSwitch;