import React from "react";
import {LoginForm, LoginFormValues} from "../../../components/forms/LoginForm";
import AuthPageWrapper from "./AuthPageWrapper";
import {useAuth} from "../../../providers/authProvider";

const LoginPage: React.FC = () => {

    const auth = useAuth();
    const handleSubmit = async (values: LoginFormValues) => {
        await auth.signInProject(values.email, values.password);
    };

    return (
        <AuthPageWrapper>
            <LoginForm onSubmit={handleSubmit}/>
        </AuthPageWrapper>
    )
}

export default LoginPage;

