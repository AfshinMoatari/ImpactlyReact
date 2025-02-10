import React, {useState} from 'react';
import {Field, Form, Formik} from 'formik';
import NiceDivider from '../visual/NiceDivider'
import TextField from '@material-ui/core/TextField/TextField';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import history from "../../history";

import VisibilityIcon from 'remixicon-react/Eye2LineIcon';
import VisibilityOffIcon from 'remixicon-react/EyeCloseLineIcon';
import Button from '@material-ui/core/Button';
import makeStyles from "@material-ui/core/styles/makeStyles";
import FormButton from "../buttons/FormButton";
import Routes from "../../constants/Routes";
import {Checkbox, FormControlLabel} from "@material-ui/core";
import FormProps from "../../models/FormProps";
import {useAppServices} from "../../providers/appServiceProvider";
import {useTranslation} from "react-i18next";

const useStyles = makeStyles((theme) => ({
    showPasswordIcon: {
        position: 'absolute',
        right: '0px',
        top: '0',
        margin: '20px 4px 4px 4px',
        color: theme.palette.common.black,
    }
}));

export type LoginFormProps = FormProps<LoginFormValues>;

export interface LoginFormValues {
    email: string;
    password: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({onSubmit}) => {
    const classes = useStyles();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const {storage} = useAppServices();
    const [remember, setRemember] = useState<boolean>(Boolean(storage.loadRemember()))
    const {t} = useTranslation();

    const handleSetRemember = (remember: boolean) => {
        storage.saveRemember(remember);
        setRemember(remember)
    }

    const initialValues = {
        email: '',
        password: '',
    };

    return (
        <Formik<LoginFormValues> onSubmit={onSubmit} initialValues={initialValues}>
            {({
                  errors,
                  values,
                  touched,
                  isSubmitting
              }) => (
                <Form>
                    <h2>{t("LoginPage.login")}</h2>
                    <Field
                        style={{overflow: "hidden", borderRadius: 10}}
                        as={TextField}
                        error={errors.email && touched.email && values.email.length !== 0}
                        helperText={values.email.length !== 0 && errors.email}
                        variant="filled"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        name="email"
                        label={t("LoginPage.email")}
                        type="email"
                        autoComplete="email"
                        autoFocus
                    />
                    <Box position="relative" marginBottom={1}>
                        <Field
                            style={{overflow: "hidden", borderRadius: 10}}
                            as={TextField}
                            error={errors.password && touched.password && values.password.length !== 0}
                            placeholder={values.password.length === 0 ? '' : errors.password}
                            variant="filled"
                            margin="normal"
                            fullWidth
                            required
                            id="password"
                            name="password"
                            label={t("LoginPage.password")}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                        />
                        <Tooltip title={showPassword ? t("LoginPage.hidePassword") : t("LoginPage.showPassword")}>
                            <IconButton
                                size="medium"
                                className={classes.showPasswordIcon}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <VisibilityIcon/> : <VisibilityOffIcon color="#aaaaaa"/>}
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box display='flex'
                         justifyContent='space-between'
                         alignItems='center'
                         marginBottom={1}
                    >
                        <FormControlLabel
                            label={t("LoginPage.rememberMe")}
                            control={<Checkbox
                                color="primary"
                                checked={remember}
                                onClick={() => handleSetRemember(!remember)}
                            />}
                        />
                    </Box>
                    <FormButton loading={isSubmitting}>
                        {t("LoginPage.login")}
                    </FormButton>
                    <NiceDivider style={{backgroundColor: '#eceef0', marginTop: "15px"}}/>
                    <Box marginTop={1}>
                        <Button color="primary"
                                onClick={() => {
                                    history.push(Routes.forgotPassword)
                                }}>
                            {t("LoginPage.forgotPassword")}
                        </Button>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};
