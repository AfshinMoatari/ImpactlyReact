import React from "react";
import {Field, Form, Formik} from "formik";
import TextField from "@material-ui/core/TextField/TextField";
import FormButton from "../../../components/buttons/FormButton";
import {Validators} from "../../../lib/Validators";
import * as Yup from "yup";

const ResetPasswordSchema = Yup.object().shape({
    password: Validators.password(),
    passwordRepeat: Validators.passwordRepeat()
});

export interface ResetPasswordFormValues {
    password: string;
    passwordRepeat: string;
}

const ResetPasswordForm: React.FC<{ onSubmit: (element: ResetPasswordFormValues) => void; }> = ({onSubmit}) => {
    return (
        <Formik<ResetPasswordFormValues>
            onSubmit={onSubmit}
            validationSchema={ResetPasswordSchema}
            initialValues={{password: "", passwordRepeat: ""}}
        >
            {({errors, values, touched, isSubmitting}) => (
                <Form>
                    <Field
                        as={TextField}
                        error={errors.password && touched.password && values.password.length !== 0}
                        helperText={values.password.length !== 0 && errors.password}
                        variant="filled"
                        margin="normal"
                        fullWidth
                        required
                        id="password"
                        name="password"
                        label="Adgangskode"
                        type={'password'}
                        autoComplete="current-password"
                    />

                    <Field
                        as={TextField}
                        error={errors.passwordRepeat && touched.passwordRepeat && values.passwordRepeat.length !== 0}
                        helperText={values.passwordRepeat.length !== 0 && errors.passwordRepeat}
                        variant="filled"
                        margin="normal"
                        fullWidth
                        required
                        id="passwordRepeat"
                        name="passwordRepeat"
                        label="Gentag adgangskode"
                        type={'password'}
                        autoComplete="current-password-repeat"
                    />
                    <FormButton loading={isSubmitting}>
                        Opdater adgangskode
                    </FormButton>
                </Form>
            )}
        </Formik>
    );
}

export default ResetPasswordForm;
