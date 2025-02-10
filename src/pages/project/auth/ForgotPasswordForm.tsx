import React from "react";
import {Field, Form, Formik} from "formik";
import TextField from "@material-ui/core/TextField/TextField";
import FormButton from "../../../components/buttons/FormButton";
import * as Yup from "yup";
import {Validators} from "../../../lib/Validators";
import {useTranslation} from "react-i18next";


export interface ForgotPasswordFormValues {
    email: string;
}

export interface ForgotPasswordFormProps {
    onSubmit: (values: ForgotPasswordFormValues) => void
}

const ResetPasswordSchema = Yup.object().shape({
    email: Validators.email().concat(Validators.required()),
});

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({onSubmit}) => {
    const {t} = useTranslation()
    const initialValues = {
        email: '',
    };

    return (
        <Formik<ForgotPasswordFormValues>
            onSubmit={onSubmit}
            initialValues={initialValues}
            validationSchema={ResetPasswordSchema}
        >
            {({errors, values, touched, isSubmitting, isValid}) => (
                <Form>
                    <Field
                        as={TextField}
                        error={errors.email && touched.email}
                        helperText={touched.email && errors.email}
                        variant="filled"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                    />
                    <FormButton loading={isSubmitting} disabled={!isValid}>
                        {t("ForgotPassword.resetPassword")}
                    </FormButton>
                </Form>
            )}
        </Formik>
    );
}

export default ForgotPasswordForm;
