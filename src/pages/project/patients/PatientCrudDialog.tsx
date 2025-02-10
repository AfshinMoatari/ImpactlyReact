import {Field} from "formik";
import {InputAdornment, MenuItem, TextField, Typography} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import ProjectPatient from "../../../models/ProjectPatient";
import React from "react";
import ProjectUser from "../../../models/ProjectUser";
import PostalSelector from "../../../components/inputs/PostalSelector";
import MunicipalitySelector from "../../../components/inputs/MunicipalitySelector";
import RegionSelector from "../../../components/inputs/RegionSelector";
import {KeyboardDatePicker} from "@material-ui/pickers";
import * as Yup from "yup";
import {Validators} from "../../../lib/Validators";
import CrudDialog from "../../../components/dialogs/CrudCialog";
import NiceDivider from "../../../components/visual/NiceDivider";
import {Checkbox} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useLanguage} from "../../../LanguageContext";
import DateFnsUtils from '@date-io/date-fns';
import {da, enUS} from "date-fns/locale";

const PatientScheme = Yup.object().shape({
    firstName: Validators.required(),
    lastName: Validators.required(),
    email: Validators.email(),
    phoneNumber: Validators.phone()
});

interface PatientCrudDialogProps {
    onSubmit: (values: Partial<ProjectUser>) => void;
    patient: Partial<ProjectPatient> | undefined;
    onClose: VoidFunction;
    onDelete?: (id: string) => void;
}

export const PatientCrudDialog: React.FC<PatientCrudDialogProps> = ({patient, onClose, onDelete, onSubmit}) => {
    const {t} = useTranslation();

    if (patient) {
        patient.phoneNumber = patient.phoneNumber?.replace("+45", "");
        patient.email = patient?.email ?? ""
    }
    return (
        <CrudDialog<Partial<ProjectPatient>>
            onSubmit={onSubmit}
            title={patient?.id ? t('PatientCrudDialog.titleEdit') : t('PatientCrudDialog.titleNew')}
            element={patient}
            validationSchema={PatientScheme}
            validateOnMount
            onCancel={onClose}
            onDelete={onDelete}
            safe={true} // TODO: Look one more time at this
        >
            {({values, errors, touched, setFieldValue}) => (
                <Grid container spacing={2}>
                    <NiceDivider style={{backgroundColor:"lightgray", height: 1, marginLeft: -8, marginRight: -8, marginTop: 12, marginBottom: 6, width: "103%"}}></NiceDivider>
                    <Grid item xs={6}>
                        <Field
                            as={TextField}
                            name="firstName"
                            label={t('PatientCrudDialog.firstName')}
                            type="text"
                            variant='outlined'
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
                            label={t('PatientCrudDialog.lastName')}
                            type="text"
                            variant='outlined'
                            fullWidth
                            error={errors.lastName && touched.lastName}
                            helperText={touched.lastName && errors.lastName}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Field
                            as={TextField}
                            name="email"
                            label={t('PatientCrudDialog.email')}
                            type="email"
                            variant='outlined'
                            fullWidth
                            error={errors.email && touched.email}
                            helperText={touched.email && errors.email}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Field
                            as={TextField}
                            name="phoneNumber"
                            label={t('PatientCrudDialog.phoneNumber')}
                            type="phone"
                            variant='outlined'
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
                        <Typography variant="body2">{t('PatientCrudDialog.defaultSMS')}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Field
                            as={TextField}
                            select
                            autoComplete='off'
                            name="sex"
                            variant="outlined"
                            label={t('PatientCrudDialog.sex')}
                            fullWidth
                        >
                            <MenuItem value="Han">{t('PatientCrudDialog.male')}</MenuItem>
                            <MenuItem value="Hun">{t('PatientCrudDialog.female')}</MenuItem>
                            <MenuItem value="Andet">{t('PatientCrudDialog.other')}</MenuItem>
                        </Field>
                    </Grid>
                    <Grid item xs={6}>
                        <Field
                            as={KeyboardDatePicker}
                            disableFuture
                            allowKeyboardControl
                            views={['year', 'month', 'date']}
                            inputVariant="outlined"
                            format="dd/MM/yyyy"
                            margin="normal"
                            openTo='year'
                            id="birthDate"
                            variant='inline'
                            name="birthDate"
                            label={t('PatientCrudDialog.birthDate')}
                            invalidLabel=""
                            invalidDateMessage=""
                            emptyLabel=""
                            value={values.birthDate ?? null}
                            onChange={(d: Date | null) => setFieldValue("birthDate", d)}
                            KeyboardButtonProps={{'aria-label': 'change date'}}
                            error={errors.birthDate && touched.birthDate}
                            helperText={touched.birthDate && errors.birthDate}
                            style={{margin: 0}}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <Field
                            as={PostalSelector}
                            value={values.postalNumber}
                            name="postalNumber"
                            onChange={(v: string) => setFieldValue("postalNumber", v)}
                            error={errors.postalNumber && touched.postalNumber}
                            helperText={touched.postalNumber && errors.postalNumber}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Field
                            as={MunicipalitySelector}
                            name="municipality"
                            onChange={(v: string) => setFieldValue("municipality", v)}
                            value={values.municipality}
                            postal={values.postalNumber}
                            error={errors.municipality && touched.municipality}
                            helperText={touched.municipality && errors.municipality}
                        />
                    </Grid>
                    <Grid item xs={5}>
                        <Field
                            as={RegionSelector}
                            autoComplete={false}
                            name="region"
                            onChange={(v: string) => setFieldValue("region", v)}
                            value={values.region}
                            municipality={values.municipality}
                            error={errors.region && touched.region}
                            helperText={touched.region && errors.region}
                        />
                    </Grid>
                    <Grid item xs={12} style={{display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                        <Typography variant="body1">{t('PatientCrudDialog.active')}</Typography>
                        <Checkbox
                            checked={values.isActive}
                            onChange={(e, b) => setFieldValue("isActive", b)}
                            color="info"
                        />
                    </Grid>
                    <NiceDivider style={{backgroundColor:"lightgray", height: 1, marginLeft: -8, marginRight: -8, marginTop: 2, marginBottom: 2, width: "103%"}}></NiceDivider>
                </Grid>
            )}
        </CrudDialog>
    )
}

export default PatientCrudDialog;
