import React, {useState} from "react";
import ForgotPasswordForm, {ForgotPasswordFormValues} from "./ForgotPasswordForm";
import AuthPageWrapper from "./AuthPageWrapper";
import Box from "@material-ui/core/Box";
import {Button} from "@material-ui/core";
import Routes from "../../../constants/Routes";
import RequestFeedbackDisplay from "../../../components/displays/FeedbackDisplay";
import RequestFeedback from "../../../models/rest/ResponseFeedback";
import {useAppServices} from "../../../providers/appServiceProvider";
import history from "../../../history";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import {useTranslation} from "react-i18next";


const ForgotPasswordPage: React.FC = () => {
    const [feedback, setFeedback] = useState<RequestFeedback | undefined>(undefined);
    const {auth} = useAppServices();
    const {t} = useTranslation()

    const onSubmit = async (values: ForgotPasswordFormValues) => {
        const response = await auth.forgotPassword(values.email);
        if (response.success) response.feedback.message = t("ForgotPassword.weHaveSentYouEmail");
        setFeedback(response.feedback)
    };

    return (
        <AuthPageWrapper>
            <h2>{t("ForgotPassword.resetPassword")}</h2>
            <Box pb={2} display={'flex'} justifyContent={'flex-start'}>
                <span>{t("ForgotPassword.enterYourEmail")}</span>
            </Box>
            <ForgotPasswordForm onSubmit={onSubmit}/>
            <Box mt={1}>
                <RequestFeedbackDisplay feedback={feedback}/>
            </Box>
            <Box width="100%" mt={1} mb={1} display="flex" justifyContent="flex-start" alignItems="center">
                <Button color="primary" onClick={() => {
                    history.push(Routes.projectAuth)
                }}>
                    <ArrowLeftLineIcon/>
                    <span style={{marginLeft: '4px'}}>{t("ForgotPassword.back")}</span>
                </Button>
            </Box>
        </AuthPageWrapper>
    )
}

export default ForgotPasswordPage;