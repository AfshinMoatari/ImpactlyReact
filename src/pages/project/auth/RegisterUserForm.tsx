import {Field, Form, Formik} from "formik";
import TextField from "@material-ui/core/TextField/TextField";
import React from "react";
import {Grid} from "@material-ui/core";
import FormProps from "../../../models/FormProps";
import {Validators} from "../../../lib/Validators";
import FormButton from "../../../components/buttons/FormButton";
import Checkbox from "@material-ui/core/Checkbox";
import * as Yup from "yup";

export interface RegisterUserRequest {
    password: string;
    passwordRepeat: string;
    privacyPolicy: boolean;
}

export type RegisterUserAuthFormProps = FormProps<RegisterUserRequest>;

const RegisterAuthUserSchema = Yup.object().shape({
    password: Validators.password().concat(Validators.required()),
    passwordRepeat: Validators.passwordRepeat().concat(Validators.required()),
    privacyPolicy: Yup.boolean()
        .required("Accept af vores privatlivspolitik er påkrævet")
        .oneOf([true], "Accept af vores privatlivspolitik er påkrævet")
});

export const RegisterUserForm: React.FC<RegisterUserAuthFormProps> = ({onSubmit}) => {

    const initial = {
        password: "",
        passwordRepeat: "",
        privacyPolicy: false
    }

    return (
        <Formik<RegisterUserRequest>
            onSubmit={onSubmit}
            validationSchema={RegisterAuthUserSchema}
            initialValues={initial}
        >
            {({isValid, errors, touched, isSubmitting}) => {
                return (
                    <Form>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Field
                                    as={TextField}
                                    error={errors.password && touched.password}
                                    helperText={touched.password && errors.password}
                                    required
                                    fullWidth
                                    variant='filled'
                                    id="password"
                                    label="Adgangskode"
                                    name="password"
                                    type="password"
                                    autoComplete='password'
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Field
                                    as={TextField}
                                    error={errors.passwordRepeat && touched.passwordRepeat}
                                    helperText={touched.passwordRepeat && errors.passwordRepeat}
                                    required
                                    fullWidth
                                    variant='filled'
                                    id="passwordRepeat"
                                    label="Gentag adgangskode"
                                    name="passwordRepeat"
                                    type="password"
                                    autoComplete='password'
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Field
                                    as={Checkbox}
                                    required
                                    name="privacyPolicy"
                                    id="privacyPolicy"
                                />
                                <span>
                                    {'* Jeg godkender Impactly\'s '}
                                    <a href="https://www.impactly.dk/legal/persondatapolitik" target="_blank" rel="noopener noreferrer">
                                        privatlivspolitik
                                    </a>
                                </span>
                            </Grid>

                            <Grid item xs={12}>
                                <FormButton loading={isSubmitting} disabled={!isValid}>
                                    Bekræft
                                </FormButton>
                            </Grid>
                        </Grid>
                    </Form>
                );
            }}
        </Formik>
    )
}

export default RegisterUserForm;