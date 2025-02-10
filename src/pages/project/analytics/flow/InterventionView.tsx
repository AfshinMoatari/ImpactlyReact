import React, { useRef, useState } from "react";
import { EmptyCondition } from "../../../../components/containers/EmptyCondition";
import { useTranslation } from "react-i18next";
import { Box, Button, FormHelperText, Grid, IconButton, InputAdornment, TextField, Typography, makeStyles, Link, Theme } from "@material-ui/core";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import useSROIContext from "./SROIFlowProvider";
import * as Yup from 'yup';
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import NiceOutliner from "../../../../components/containers/NiceOutliner";
import ActionButton from "../../../../components/buttons/ActionButton";
import NiceDivider from "../../../../components/visual/NiceDivider";
import { Intervention } from "../../../../models/SROIFlow";
import { List } from "@mui/material";
import BaseDialog from "../../../../components/dialogs/BaseDialog";
import FormChip from "../../../../components/FormChip";
import BlueButton from "../../../../components/buttons/BlueButton";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const InterventionView: React.FC<
    {
        handleBack: () => void;
        handleNext: () => void;
        handleClose: () => void
    }
> = ({ handleBack, handleNext, handleClose }) => {
    const { state, onChange } = useSROIContext();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const formikRef = useRef<FormikProps<Intervention>>(null);
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

    const validationSchema = Yup.object().shape({
        interventionName: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.interventionName.required'))
            .max(30, t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.interventionName.max')),
        participants: Yup.number()
            .required(t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.participants.required'))
            .integer(t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.participants.integer'))
            .positive(t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.participants.positive'))
            .min(1, t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.participants.min'))
            .transform((value, originalValue) =>
                /^\d*$/.test(originalValue) ? parseInt(originalValue) : NaN
            ),
        businessCaseLength: Yup.number()
            .required(t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.businessCaseLength.required'))
            .integer(t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.businessCaseLength.integer'))
            .min(1, t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.businessCaseLength.min'))
            .max(100, t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.businessCaseLength.max')),
        interventionDescription: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.interventionDescription.required'))
            .max(600, t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.interventionDescription.max')),
        purpose: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.purpose.required'))
            .max(100, t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.purpose.max')),
        activities: Yup.array()
            .required(t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.activities.required'))
            .min(1, t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.activities.min'))
            .max(10, t('AnalyticsPage.sroi.sroiFlow.intervention.form.validation.activities.max'))
            .of(Yup.string().required())
    });

    const handleSave = async (values: Intervention, { resetForm }: FormikHelpers<Intervention>) => {
        setIsLoading(true);
        setTimeout(() => {
            handleNext();
            onChange({
                ...state,
                intervention: values,
            });
            setIsLoading(false);
        }, 400);
    };

    const useStyles = makeStyles((theme: Theme) => ({
        root: {
            width: "100%",
            borderRadius: 0,
            '& > div:first-child': {
                background: "none",
                padding: theme.spacing(2, 0),
                border: '0',
                borderRadius: 0,
                '& > span#label:first-child': {
                    fontWeight: 'bold'
                }
            }
        },
        formContainer: {
            width: '100%',
            maxWidth: 800,
            margin: 'auto',
            [theme.breakpoints.down('sm')]: {
                maxWidth: '100%',
            },
        },
        contentWrapper: {
            position: 'relative',
            padding: theme.spacing(2),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            overflowY: 'auto',
            height: '100%',
            boxSizing: 'border-box',
        },
        dialog: {
            '& .MuiDialog-paper': {
                borderBottom: '2px solid rgba(10, 8, 18, 0.05)',
                marginBottom: 20,
                padding: '16px 24px 24px 24px',
                width: '100%',
                maxWidth: 600,
                [theme.breakpoints.down('sm')]: {
                    padding: '16px',
                    height: '100%',
                    maxWidth: '100%',
                    margin: 0,
                }
            }
        },
        dialogContent: {
            padding: theme.spacing(2),
            [theme.breakpoints.down('sm')]: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            },
        },
        dialogActions: {
            marginTop: theme.spacing(3),
            [theme.breakpoints.down('sm')]: {
                marginTop: 'auto',
                paddingBottom: theme.spacing(2)
            },
        },
        inputAdornment: {
            [theme.breakpoints.down('md')]: {
                display: 'none',
            },
        },
    }));
    const classes = useStyles();

    const handleAddActivity = (formValue: Intervention, value: string, setFieldValue: FormikHelpers<Intervention>["setFieldValue"]) => {
        handleCloseDialog();
        setFieldValue("activities", [...formValue.activities, value]);
    };

    const [openDialog, setOpenDialog] = useState(false);
    const [newItem, setNewItem] = useState('');

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewItem('');
    };
    const handleAddActivityClick = () => {
        setOpenDialog(true);
    };

    return (
        <EmptyCondition>
            <div style={{ display: 'flex', flexDirection: 'row', padding: 16, flexWrap: 'wrap' }}>
                <Button
                    color="primary"
                    onClick={handleBack}
                    style={{ fontWeight: 600 }}
                    startIcon={<ArrowLeftLineIcon />}
                >
                    {t('AnalyticsPage.sroi.sroiFlow.backButton')}
                </Button>

                <Box style={{ flex: '1 1 auto' }} />

                <IconButton size='small' onClick={handleClose}>
                    {<CloseLineIcon color="primary" />}
                </IconButton>
            </div>

            <div className={classes.contentWrapper}>
                {isLoading && <LoadingOverlay />}
                <Formik
                    initialValues={state.intervention}
                    onSubmit={(values, formikHelpers) => handleSave(values, formikHelpers)}
                    validationSchema={validationSchema}
                    innerRef={formikRef}
                >
                    {formik => (
                        <Form className={classes.formContainer}>
                            <NiceOutliner className={classes.root}>
                                <Typography variant='h1'>
                                    {t('AnalyticsPage.sroi.sroiFlow.intervention.title')}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {t('AnalyticsPage.sroi.sroiFlow.intervention.description')}
                                </Typography>
                            </NiceOutliner>
                            <Grid container spacing={3}>
                                <Grid item container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            name="interventionName"
                                            id="interventionName"
                                            fullWidth
                                            variant="outlined"
                                            label={t('AnalyticsPage.sroi.sroiFlow.intervention.form.interventionNameTitle')}
                                            value={formik.values.interventionName}
                                            onChange={formik.handleChange}
                                            size="small"
                                            inputProps={{
                                                maxLength: 30
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end" className={classes.inputAdornment}>
                                                        {t("Common.Adornment.maxCharLimit", { char: 30 })}
                                                    </InputAdornment>
                                                ),
                                            }}
                                            error={formik.touched.interventionName && Boolean(formik.errors.interventionName)}
                                            helperText={formik.touched.interventionName && formik.errors.interventionName}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            multiline
                                            minRows={3}
                                            name="interventionDescription"
                                            id="interventionDescription"
                                            fullWidth
                                            variant="outlined"
                                            label={t('AnalyticsPage.sroi.sroiFlow.intervention.form.interventionDescriptionTitle')}
                                            value={formik.values.interventionDescription}
                                            onChange={formik.handleChange}
                                            inputProps={{
                                                maxLength: 600
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end" className={classes.inputAdornment}>
                                                        {t("Common.Adornment.maxCharLimit", { char: 600 })}
                                                    </InputAdornment>
                                                ),
                                            }}
                                            error={formik.touched.interventionDescription && Boolean(formik.errors.interventionDescription)}
                                            helperText={formik.touched.interventionDescription && formik.errors.interventionDescription}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            multiline
                                            minRows={2}
                                            name="purpose"
                                            id="purpose"
                                            fullWidth
                                            variant="outlined"
                                            label={t('AnalyticsPage.sroi.sroiFlow.intervention.form.purposeTitle')}
                                            value={formik.values.purpose}
                                            onChange={formik.handleChange}
                                            inputProps={{
                                                maxLength: 100
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end" className={classes.inputAdornment}>
                                                        {t("Common.Adornment.maxCharLimit", { char: 100 })}
                                                    </InputAdornment>
                                                ),
                                            }}
                                            error={formik.touched.purpose && Boolean(formik.errors.purpose)}
                                            helperText={formik.touched.purpose && formik.errors.purpose}
                                        />
                                    </Grid>

                                    <Grid item container xs={12}>
                                        <Grid item xs={6} style={{ paddingRight: 8 }}>
                                            <TextField
                                                required
                                                name="participants"
                                                id="participants"
                                                fullWidth
                                                variant="outlined"
                                                label={t('AnalyticsPage.sroi.sroiFlow.intervention.form.participantsTitle')}
                                                value={formik.values.participants}
                                                onChange={(e) => {
                                                    const sanitizedValue = e.target.value.replace(/[^\d]/g, '');
                                                    formik.handleChange({
                                                        target: {
                                                            name: e.target.name,
                                                            value: sanitizedValue,
                                                        },
                                                    });
                                                }}
                                                size="small"
                                                type="text"
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">{t('Common.Measurement.person')}</InputAdornment>,
                                                }}
                                                error={formik.touched.participants && Boolean(formik.errors.participants)}
                                                helperText={formik.touched.participants && formik.errors.participants}
                                            />
                                        </Grid>
                                        <Grid item xs={6} style={{ paddingLeft: 8 }}>
                                            <TextField
                                                required
                                                id="businessCaseLength"
                                                name="businessCaseLength"
                                                fullWidth
                                                variant="outlined"
                                                label={t('AnalyticsPage.sroi.sroiFlow.intervention.form.businessCaseLengthTitle')}
                                                value={formik.values.businessCaseLength}
                                                onChange={(e) => {
                                                    let sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
                                                    if (sanitizedValue !== '') {
                                                        const numericValue = parseInt(sanitizedValue, 10);
                                                        if (numericValue > 100) {
                                                            sanitizedValue = '100';
                                                        } else if (numericValue < 1) {
                                                            sanitizedValue = '1';
                                                        } else if (sanitizedValue.length > 2) {
                                                            sanitizedValue = sanitizedValue.slice(0, -1);
                                                        }
                                                    }

                                                    formik.handleChange({
                                                        target: {
                                                            name: e.target.name,
                                                            value: sanitizedValue,
                                                        },
                                                    });
                                                }}
                                                size="small"
                                                type="text"
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">{t('Common.DateTime.years')}</InputAdornment>,
                                                }}
                                                error={formik.touched.businessCaseLength && Boolean(formik.errors.businessCaseLength)}
                                                helperText={formik.touched.businessCaseLength && formik.errors.businessCaseLength}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} style={{ display: 'flex', margin: '10px 0' }}>
                                        <List
                                            sx={{
                                                width: "100%",
                                            }}
                                        >
                                            <li>
                                                {formik.values.activities?.map((activity, index) => (
                                                    <FormChip
                                                        key={index}
                                                        style={{
                                                            borderRadius: 16,
                                                            maxWidth: "100%",
                                                            marginBottom: 8,
                                                            marginLeft: 2
                                                        }}
                                                        itemName={activity}
                                                        onDelete={() => {
                                                            const updatedActivities = formik.values.activities.filter((_, i) => i !== index);
                                                            formik.setFieldValue("activities", updatedActivities);
                                                        }}
                                                    />
                                                ))}

                                                <BlueButton
                                                    style={{
                                                        padding: "4px 12px",
                                                        fontSize: 12,
                                                        marginBottom: 8,
                                                        marginLeft: 2
                                                    }}
                                                    color="primary"
                                                    onClick={handleAddActivityClick}
                                                >
                                                    {t('AnalyticsPage.sroi.sroiFlow.intervention.form.addActivity')}
                                                </BlueButton>

                                                <FormHelperText error={formik.touched.activities && Boolean(formik.errors.activities)}>
                                                    {formik.touched.activities && formik.errors.activities && (
                                                        <span className="error-container" style={{ display: 'block', marginLeft: 16 }}>
                                                            {formik.errors.activities}
                                                        </span>
                                                    )}
                                                </FormHelperText>
                                            </li>
                                        </List>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <ActionButton
                                        size="small"
                                        style={{
                                            borderRadius: 52,
                                            padding: "6px 16px",
                                            textTransform: "uppercase",
                                            fontSize: 14,
                                        }}
                                        disabled={formik.isSubmitting}
                                        onClick={() => {
                                            if (formikRef.current) {
                                                formikRef.current.submitForm();
                                            }
                                        }}
                                    >
                                        {t('ActionButtons.continue')}
                                    </ActionButton>
                                </Grid>
                            </Grid>


                            <BaseDialog
                                open={openDialog}
                                onClose={handleCloseDialog}
                                title={t('AnalyticsPage.sroi.sroiFlow.intervention.form.activityDialog.dialogTitle')}
                                description={""}
                                className={classes.dialog}
                                fullScreen={isSmallScreen}
                            >
                                <div className={classes.dialogContent}>
                                    <TextField
                                        label={t('AnalyticsPage.sroi.sroiFlow.intervention.form.activityDialog.activityTitle')}
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        variant="outlined"
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        inputProps={{
                                            maxLength: 100
                                        }}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">
                                                {t("Common.Adornment.maxCharLimit", { char: 100 })}
                                            </InputAdornment>,
                                        }}
                                    />

                                    <div className={classes.dialogActions}>
                                        <Button
                                            size="large"
                                            type='submit'
                                            aria-label="submit"
                                            onClick={() => handleAddActivity(formik.values, newItem, formik.setFieldValue)}
                                            disabled={!newItem}
                                            color="primary"
                                            style={{ fontWeight: 600, marginTop: 24 }}
                                        >
                                            {t("RegisterDialog.save")}
                                        </Button>
                                    </div>
                                </div>
                            </BaseDialog>

                            <Box style={{ margin: '35px 0' }}>
                                <NiceDivider style={{ background: '#0A08121F', height: 1, margin: 0 }} />
                                <Box style={{ padding: '10px 0' }}>
                                    <FormHelperText>
                                        {t('AnalyticsPage.sroi.sroiFlow.help')}
                                        <Link
                                            underline="always"
                                            component="button"
                                            style={{ paddingLeft: 4 }}
                                        >
                                            {t('AnalyticsPage.sroi.sroiFlow.clickHelp')}
                                        </Link>
                                    </FormHelperText>
                                </Box>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </div>
        </EmptyCondition>
    );
};

export default InterventionView;

