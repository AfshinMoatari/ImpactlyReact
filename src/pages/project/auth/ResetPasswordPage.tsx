import React, {useState} from "react";
import {Box, Button} from "@material-ui/core";
import ResetPasswordForm, {ResetPasswordFormValues} from "./ResetPasswordForm";
import AuthPageWrapper from "./AuthPageWrapper";
import RequestFeedbackDisplay from "../../../components/displays/FeedbackDisplay";
import RequestFeedback from "../../../models/rest/ResponseFeedback";
import qs from "qs";
import Routes from "../../../constants/Routes";
import {useLocation} from "react-router-dom";
import {useAppServices} from "../../../providers/appServiceProvider";
import history from "../../../history";

const ResetPasswordPage: React.FC = () => {
    const [feedback, setFeedback] = useState<RequestFeedback | undefined>(undefined);
    const location = useLocation();
    const params = qs.parse(location.search ?? '', {ignoreQueryPrefix: true});
    const token = "" + params['token'];
    const {auth} = useAppServices();

    const onSubmit = async (values: ResetPasswordFormValues) => {
        const response = await auth.resetPassword(values.password, token);
        if (response.success) response.feedback.message = "Din bruger er nu registreret og du kan logge ind på platformen";
        setFeedback(response.feedback)
    };

    const handleAction = () => history.push(Routes.projectAuth);
    const feedbackAction = <Button onClick={handleAction}>OK</Button>;

    return (
        <AuthPageWrapper>
            <h2>Ny adgangskode</h2>
            <ResetPasswordForm onSubmit={onSubmit}/>
            <Box p={2}>
                <RequestFeedbackDisplay feedback={feedback} action={feedbackAction}/>
            </Box>
        </AuthPageWrapper>
    );
};

export default ResetPasswordPage;