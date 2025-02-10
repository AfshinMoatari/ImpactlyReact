import React from 'react';
import AuthPageWrapper from "./AuthPageWrapper";
import RegisterUserForm, {RegisterUserRequest} from "./RegisterUserForm";
import Routes from "../../../constants/Routes";
import {Typography} from "@material-ui/core";
import qs from "qs";
import {useAppServices} from "../../../providers/appServiceProvider";
import {useLocation} from "react-router-dom";
import history from "../../../history";
import {parseJwt} from "../../../lib/jwt";
import snackbarProvider from "../../../providers/snackbarProvider";
import {useAuth} from "../../../providers/authProvider";
import NotFoundPage from "../../error/NotFoundPage";

export const RegisterUserPage: React.FC = () => {
    const services = useAppServices();
    const location = useLocation();
    const auth = useAuth();
    const params = qs.parse(location.search ?? '', {ignoreQueryPrefix: true});
    const token = params['token']?.toString();

    if (!token) return <NotFoundPage/>;

    const {uname, email} = parseJwt(token) as { uname: string, email: string };

    const handleSubmit = async (values: RegisterUserRequest) => {
        const response = await services.auth.register(values, token);
        if (!response.success) return snackbarProvider.showFeedback(response.feedback);

        snackbarProvider.success("Din bruger er nu registreret! Du logges ind");
        const handleLogin = async () => {
            await auth.signInProject(email, values.password);

            history.push(Routes.project);
        }
        setTimeout(handleLogin, 1200)
    }

    return (
        <AuthPageWrapper>
            <Typography variant="h1">Velkommen {uname}</Typography>
            <Typography variant="subtitle1">Bekræft din bruger ved at angive en adgangskode</Typography>
            <RegisterUserForm onSubmit={handleSubmit}/>
        </AuthPageWrapper>
    )
}

export default RegisterUserPage;







