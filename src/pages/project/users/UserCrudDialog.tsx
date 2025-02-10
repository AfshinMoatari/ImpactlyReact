import {Field} from "formik";
import {FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React from "react";
import ProjectUser from "../../../models/ProjectUser";
import CrudDialog from "../../../components/dialogs/CrudCialog";
import * as Yup from "yup";
import {Validators} from "../../../lib/Validators";
import {Roles} from "../../../constants/Permissions";
import {useProjectCrudListQuery} from "../../../hooks/useProjectQuery";
import {useAuth} from "../../../providers/authProvider";
import {useTranslation} from "react-i18next";

interface ProjectUserFormProps {
    user: Partial<ProjectUser> | undefined;
    onSubmit: (values: Partial<ProjectUser>) => void;
    onClose: VoidFunction;
    onDelete: (id: string) => void;
}

const UserSchema = Yup.object().shape({
    firstName: Validators.required(),
    lastName: Validators.required(),
    email: Validators.email().concat(Validators.required()),
    phoneNumber: Validators.phone(),
});

export const UserCrudDialog: React.FC<ProjectUserFormProps> = ({user, onDelete, onClose, onSubmit}) => {
    const projectUsers = useProjectCrudListQuery(service => service.projectUsers);
    const auth = useAuth();
    const currentUserRole = projectUsers?.elements.find((x) => x.id === auth.currentUser?.id)?.roleId
    const {t} = useTranslation();

    return (
        <CrudDialog<Partial<ProjectUser>>
            title={user?.id ? t('Users.editEmployee') : t('Users.registerNewEmployee')}
            element={user}
            onSubmit={onSubmit}
            onCancel={onClose}
            onDelete={user?.id ? onDelete : undefined}
            validationSchema={UserSchema}
            validateOnMount
            enableReinitialize
        >
            {({errors, touched}) => (
                <Grid container>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Field
                                as={TextField}
                                name="firstName"
                                label={t('Users.firstName')}
                                type="text"
                                variant='filled'
                                fullWidth
                                autoFocus
                                error={errors.firstName && touched.firstName}
                                helperText={touched.firstName && errors.firstName}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Field
                                as={TextField}
                                name="lastName"
                                label={t('Users.lastName')}
                                type="text"
                                variant='filled'
                                fullWidth
                                error={errors.lastName && touched.lastName}
                                helperText={touched.lastName && errors.lastName}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                name="email"
                                label="Email"
                                type="email"
                                variant='filled'
                                fullWidth
                                error={errors.email && touched.email}
                                helperText={touched.email && errors.email}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                name="phoneNumber"
                                label={t('Users.phoneNumber')}
                                type="phone"
                                variant='filled'
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            +45
                                        </InputAdornment>
                                    ),
                                }}
                                error={errors.phoneNumber && touched.phoneNumber}
                                helperText={touched.phoneNumber && errors.phoneNumber}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel variant='filled'>{t('Users.roleType')}</InputLabel>
                                <Field
                                    as={Select}
                                    name="roleId"
                                    type="select"
                                    variant='filled'
                                    fullWidth
                                    required
                                >
                                    <MenuItem value={Roles.standardRole}>Standard</MenuItem>
                                    <MenuItem value={Roles.superRole}>Super</MenuItem>
                                    {currentUserRole === Roles.administratorRole && <MenuItem value={Roles.administratorRole}>Administrator</MenuItem>}
                                </Field>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
            )}
        </CrudDialog>
    )
}
export default UserCrudDialog;