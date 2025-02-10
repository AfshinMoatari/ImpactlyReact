import * as Yup from "yup";
import { Button, Checkbox, FormControl, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import React from "react";
import { FormikConfig } from "formik/dist/types";
import { useTranslation } from "react-i18next";
import { Outcome } from "../../../../models/SROIFlow";
import CreateDialog from "../../../../components/dialogs/CreateDialog";
import { ErrorMessage, Field } from "formik";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import IconItem from "../../survey/IconItem";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, Theme } from "@material-ui/core/styles";

export interface NameForm { name: string }

interface OutcomeDialogProps {
    onSubmit: FormikConfig<Outcome>["onSubmit"];
    open: boolean;
    onClose: VoidFunction;
    initialValues: Outcome;
    lang: string;
}

const useStyles = makeStyles((theme: Theme) => ({
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
    dialogHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing(2)
    },
    dialogTitle: {
        margin: 0,
        fontWeight: 600
    },
    dialogContent: {
        padding: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        },
    },
    beneficiariesSection: {
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(2),
        marginTop: theme.spacing(2)
    },
    sectionContainer: {
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(2),
        marginTop: theme.spacing(2)
    },
    basicFormSection: {
        marginBottom: theme.spacing(4)
    },
    inputAdornment: {
        [theme.breakpoints.down('md')]: {
            display: 'none !important',
        },
    },
    helperText: {
        '&.MuiFormHelperText-contained': {
            margin: 0,
            marginLeft: '0 !important',
            marginRight: '0 !important'
        },
        '& .MuiFormHelperText-root': {
            margin: 0,
            marginLeft: '0 !important',
            marginRight: '0 !important'
        }
    },
    formControl: {
        '& .MuiFormHelperText-contained': {
            margin: 0,
            marginLeft: '0 !important',
            marginRight: '0 !important'
        },
        '& .MuiFormHelperText-root': {
            margin: 0,
            marginLeft: '0 !important',
            marginRight: '0 !important'
        }
    }
}));

const OutcomeDialog: React.FC<OutcomeDialogProps> = ({ onSubmit, open, onClose, initialValues, lang }) => {
    const { t } = useTranslation();
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
    const currentYear = new Date().getFullYear();
    const startYears = Array.from(new Array(currentYear - 2000 + 1), (val, index) => 2000 + index);
    const currencySymbols: { [key: string]: string } = {
        EUR: '€',
        DKK: 'kr.'
    };
    const validationSchema = Yup.object().shape({
        outcomeName: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomeName.required'))
            .max(30, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomeName.max')),
        outcomeDescription: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomeDescription.required'))
            .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomeDescription.max')),
        measurementMethod: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.measurementMethod.required'))
            .oneOf(
                ['ValidatedQuestionnaires', 'CustomQuestionnaires', 'Registrations', 'DataExtraction'],
                t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.measurementMethod.oneOf')
            ),
        outcomeStart: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomeStart.required'))
            .oneOf(['PeriodAfter', 'PeriodOfActivity'], t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomeStart.oneOf')),
        outcomeDuration: Yup.number()
            .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomeDuration.typeError'))
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomeDuration.required'))
            .min(1, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomeDuration.min'))
            .integer(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomeDuration.integer')),
        outcomePopulation: Yup.number()
            .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomePopulation.typeError'))
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomePopulation.required'))
            .min(1, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomePopulation.min'))
            .integer(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomePopulation.integer')),
        effectType: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.effectType.required'))
            .oneOf(['Person', 'Score'], t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.effectType.oneOf')),
        effectSize: Yup.number()
            .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.effectSize.typeError'))
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.effectSize.required'))
            .min(0.000001, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.effectSize.min'))
            .positive(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.effectSize.positive')),
        answerRate: Yup.number()
            .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.answerRate.typeError'))
            .min(0.0001, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.answerRate.min'))
            .positive(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.answerRate.positive')),
        startYears: Yup.number()
            .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.startYears.typeError'))
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.startYears.required'))
            .integer(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.startYears.integer')),
        yearsCollected: Yup.number()
            .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.yearsCollected.typeError'))
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.yearsCollected.required'))
            .min(1, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.yearsCollected.min'))
            .integer(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.yearsCollected.integer')),
        significance: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.significance.required'))
            .oneOf(['Significance', 'Insignificance'], t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.significance.oneOf')),
        source: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.source.required'))
            .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.source.max')),
        comments: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.comments.required'))
            .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.comments.max')),

        skipAlternative: Yup.boolean(),
        alternative: Yup.lazy((_, context) => {
            const skipAlternative = context?.context?.skipAlternative;

            if (skipAlternative) {
                return Yup.object().shape({
                    amount: Yup.number().nullable(),
                    source: Yup.string().nullable(),
                    comment: Yup.string().nullable(),
                });
            } else {
                return Yup.object().shape({
                    amount: Yup.number()
                        .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.alternative.amount.required'))
                        .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.alternative.amount.typeError'))
                        .min(0, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.alternative.amount.min'))
                        .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.alternative.amount.max')),
                    source: Yup.string()
                        .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.alternative.source.required'))
                        .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.alternative.source.max')),
                    comment: Yup.string()
                        .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.alternative.comment.required'))
                        .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.alternative.comment.max')),
                });
            }
        }),

        skipSensitivityAnalysis: Yup.boolean(),
        sensitivityAnalysis: Yup.lazy((_, context) => {
            const skipSensitivityAnalysis = context?.context?.skipSensitivityAnalysis;

            if (skipSensitivityAnalysis) {
                return Yup.object().shape({
                    deadweight: Yup.number().nullable(),
                    displacement: Yup.number().nullable(),
                    attribution: Yup.number().nullable(),
                    dropOff: Yup.number().nullable()
                });
            } else {
                return Yup.object().shape({
                    deadweight: Yup.number()
                        .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.deadweight.typeError'))
                        .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.deadweight.required'))
                        .min(0, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.deadweight.min'))
                        .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.deadweight.max')),
                    displacement: Yup.number()
                        .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.displacement.typeError'))
                        .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.displacement.required'))
                        .min(0, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.displacement.min'))
                        .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.displacement.max')),
                    attribution: Yup.number()
                        .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.attribution.typeError'))
                        .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.attribution.required'))
                        .min(0, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.attribution.min'))
                        .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.attribution.max')),
                    dropoff: Yup.number()
                        .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.dropoff.typeError'))
                        .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.dropOff.required'))
                        .min(0, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.dropOff.min'))
                        .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.sensitivityAnalysis.dropOff.max'))
                });
            }
        }),

        beneficiaries: Yup.array().of(
            Yup.object().shape({
                name: Yup.string()
                    .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.name.required'))
                    .oneOf(
                        ['State', 'Municipality', 'ExternalOrganisation', 'InternalOrganisation', 'Citizens', 'CaretakersNextOfKin', 'Employees', 'Volunteers', 'Custom'],
                        t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.name.oneOf')
                    ),
                type: Yup.string()
                    .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.type.required'))
                    .oneOf(
                        ['Budgetary', 'Social', 'NonPriced'],
                        t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.type.oneOf')
                    ),
                value: Yup.number()
                    .when('type', {
                        is: (val: string | undefined) => ['Social', 'Budgetary', undefined].includes(val),
                        then: Yup.number()
                            .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.value.typeError'))
                            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.value.required'))
                            .typeError(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.value.typeError'))
                            .positive(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.value.positive'))
                            .notOneOf([0], t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.value.notOneOf')),
                        otherwise: Yup.number().nullable()
                    }),
                source: Yup.string()
                    .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.source.required'))
                    .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.source.max')),
                comments: Yup.string()
                    .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.comments.required'))
                    .max(100, t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.beneficiaries.comments.max')),
            })
        )
    });


    const handleAddBeneficiary = (values: any, setFieldValue: any) => {
        const newBeneficiary = {
            name: '',
            type: 'Social',
            valueType: 'Significance',
            value: null,
            source: '',
            comments: ''
        };

        setFieldValue('beneficiaries', [...values.beneficiaries, newBeneficiary]);
    };

    const handleRemoveBeneficiary = (values: any, beneficiaryIndex: number, setFieldValue: any) => {
        let updatedBeneficiary = [...values.beneficiaries];
        updatedBeneficiary = updatedBeneficiary.filter((_, i) => i !== beneficiaryIndex);
        setFieldValue('beneficiaries', updatedBeneficiary);
    };

    const getCurrencySymbol = (currency: string): string => {
        if (currencySymbols.hasOwnProperty(currency)) {
            return currencySymbols[currency];
        }
        return '';
    };

    const classes = useStyles();

    return (
        <CreateDialog<Outcome>
            onSubmit={onSubmit}
            initialValues={initialValues}
            title={
                <div className={classes.dialogHeader}>
                    <Typography variant="h6" className={classes.dialogTitle}>
                        {t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.outcomeTitle')}
                    </Typography>
                    <IconButton size="small" onClick={onClose}>
                        <CloseLineIcon color="primary" />
                    </IconButton>
                </div>
            }
            open={open}
            validationSchema={validationSchema}
            onClose={onClose}
            validateOnMount
            maxWidth="md"
            validateOnChange
            validateOnBlur
            enableValidation
            enableReinitialize
            fullScreen={isSmallScreen}
            className={classes.dialog}
        >
            {({ values, errors, touched, setFieldValue, handleChange }) => (
                <Grid container direction="column" xs={12} spacing={2}>
                    <Grid container direction="column" spacing={2} className={classes.basicFormSection}>
                        <Grid item xs={12}>
                            <TextField
                                value={values.outcomeName}
                                onChange={handleChange}
                                required
                                name={`outcomeName`}
                                id={`outcomeName`}
                                fullWidth
                                variant="outlined"
                                label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.outcomeNameTitle')}
                                size="small"
                                inputProps={{
                                    maxLength: 30
                                }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t("Common.Adornment.maxCharLimit", { char: 30 })}</InputAdornment>,
                                }}
                                error={touched.outcomeName}
                            />
                            <FormHelperText error={Boolean(touched.outcomeName && errors.outcomeName)}>
                                {touched.outcomeName && errors.outcomeName && (
                                    <span className="error-container">
                                        <ErrorMessage name="outcomeName" />
                                    </span>
                                )}
                            </FormHelperText>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                value={values.outcomeDescription}
                                onChange={handleChange}
                                name={`outcomeDescription`}
                                id={`outcomeDescription`}
                                fullWidth
                                variant="outlined"
                                label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.outcomeDescription')}
                                size="small"
                                inputProps={{
                                    maxLength: 100
                                }}
                                multiline
                                minRows={2}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t("Common.Adornment.maxCharLimit", { char: 100 })}</InputAdornment>,
                                }}
                                error={touched.outcomeDescription}
                            />
                            <FormHelperText error={Boolean(touched.outcomeDescription && errors.outcomeDescription)}>
                                {touched.outcomeDescription && errors.outcomeDescription && (
                                    <span className="error-container">
                                        <ErrorMessage name="outcomeDescription" />
                                    </span>
                                )}
                            </FormHelperText>
                        </Grid>
                        <Grid item container spacing={2}>
                            <Grid item xs={12} sm={6} md={6}>
                                <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                    <InputLabel id={`measurementMethod-label`}>{`${t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.measurementMethodTitle')}`}</InputLabel>
                                    <Select
                                        value={values.measurementMethod}
                                        onChange={handleChange}
                                        required
                                        labelId={`measurementMethod-label`}
                                        id={`measurementMethod`}
                                        name={`measurementMethod`}
                                        label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.measurementMethodTitle')}
                                        error={touched.measurementMethod}
                                        className={classes.formControl}
                                    >
                                        <MenuItem value="ValidatedQuestionnaires">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.measurementMethodItems.0')}</MenuItem>
                                        <MenuItem value="CustomQuestionnaires">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.measurementMethodItems.1')}</MenuItem>
                                        <MenuItem value="Registrations">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.measurementMethodItems.2')}</MenuItem>
                                        <MenuItem value="DataExtraction">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.measurementMethodItems.3')}</MenuItem>
                                    </Select>
                                    <FormHelperText
                                        error={Boolean(touched.measurementMethod && errors.measurementMethod)}
                                        className={classes.helperText}
                                    >
                                        {touched.measurementMethod && errors.measurementMethod && (
                                            <span className="error-container">
                                                <ErrorMessage name="measurementMethod" />
                                            </span>
                                        )}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                    <InputLabel id={`outcomeStart-label`}>{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.outcomeStartTitle')}</InputLabel>
                                    <Select
                                        value={values.outcomeStart}
                                        onChange={handleChange}
                                        required
                                        labelId={`outcomeStart-label`}
                                        id={`outcomeStart`}
                                        name={`outcomeStart`}
                                        label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.outcomeStartTitle')}
                                        error={touched.outcomeStart}
                                    >
                                        <MenuItem value="PeriodAfter">{`${t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.outcomeStartItems.0')}`}</MenuItem>
                                        <MenuItem value="PeriodOfActivity">{`${t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.outcomeStartItems.1')}`}</MenuItem>
                                    </Select>
                                    <FormHelperText error={Boolean(touched.outcomeStart && errors.outcomeStart)}>
                                        {touched.outcomeStart && errors.outcomeStart && (
                                            <span className="error-container">
                                                <ErrorMessage name="outcomeStart" />
                                            </span>
                                        )}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid item container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    value={values.outcomeDuration}
                                    required
                                    name="outcomeDuration"
                                    id="outcomeDuration"
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.outcomeDurationTitle')}
                                    onChange={(e) => {
                                        let inputValue = e.target.value.replace(/[^0-9]/g, '');
                                        if (parseInt(inputValue) < 1) {
                                            inputValue = '1';
                                        }
                                        e.target.value = inputValue;
                                        handleChange(e);
                                    }}
                                    size="small"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t('Common.DateTime.years')}</InputAdornment>,
                                    }}
                                    error={touched.outcomeDuration}
                                />
                                <FormHelperText error={Boolean(touched.outcomeDuration && errors.outcomeDuration)}>
                                    {touched.outcomeDuration && errors.outcomeDuration && (
                                        <span className="error-container">
                                            <ErrorMessage name="outcomeDuration" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    value={values.outcomePopulation}
                                    required
                                    name="outcomePopulation"
                                    id="outcomePopulation"
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.outcomePopulationTitle')}
                                    onChange={(e) => {
                                        let inputValue = e.target.value.replace(/[^0-9]/g, '');
                                        if (parseInt(inputValue) < 1) {
                                            inputValue = '1';
                                        }
                                        e.target.value = inputValue;
                                        handleChange(e);
                                    }}
                                    size="small"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t('Common.Measurement.person')}</InputAdornment>,
                                    }}
                                    error={touched.outcomePopulation}
                                />
                                <FormHelperText error={Boolean(touched.outcomePopulation && errors.outcomePopulation)}>
                                    {touched.outcomePopulation && errors.outcomePopulation && (
                                        <span className="error-container">
                                            <ErrorMessage name="outcomePopulation" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                    <InputLabel id="effectType-label">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.effectTypeTitle')}</InputLabel>
                                    <Select
                                        value={values.effectType}
                                        onChange={handleChange}
                                        required
                                        labelId="effectType-label"
                                        id="effectType"
                                        name="effectType"
                                        label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.effectTypeTitle')}
                                        error={touched.effectType}
                                    >
                                        <MenuItem value="Person">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.effectTypeItems.0')}</MenuItem>
                                        <MenuItem value="Score">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.effectTypeItems.1')}</MenuItem>
                                    </Select>
                                    <FormHelperText error={Boolean(touched.effectType && errors.effectType)}>
                                        {touched.effectType && errors.effectType && (
                                            <span className="error-container">
                                                <ErrorMessage name="effectType" />
                                            </span>
                                        )}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    value={values.effectSize}
                                    required
                                    name="effectSize"
                                    id="effectSize"
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.effectSizeTitle')}
                                    onChange={(e) => {
                                        let inputValue = e.target.value.replace(/[^0-9.]/g, '');
                                        if (parseFloat(inputValue) < 1) {
                                            inputValue = '1';
                                        }
                                        e.target.value = inputValue;
                                        handleChange(e);
                                    }}
                                    size="small"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t('Common.Measurement.units')}</InputAdornment>,
                                    }}
                                    error={touched.effectSize}
                                />
                                <FormHelperText error={Boolean(touched.effectSize && errors.effectSize)}>
                                    {touched.effectSize && errors.effectSize && (
                                        <span className="error-container">
                                            <ErrorMessage name="effectSize" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                        </Grid>
                        <Grid item container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    value={values.answerRate}
                                    name={`answerRate`}
                                    id={`answerRate`}
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.answerRateTitle')}
                                    onChange={(e) => {
                                        let inputValue = e.target.value;

                                        inputValue = inputValue.replace(/[^0-9.]/g, '');

                                        let numericValue = parseFloat(inputValue);
                                        if (isNaN(numericValue) || numericValue < 0) {
                                            inputValue = '';
                                        } else if (numericValue > 100) {
                                            inputValue = '100';
                                            numericValue = 100;
                                        }
                                        handleChange(e);
                                    }}
                                    size="small"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>%</InputAdornment>,
                                    }}
                                    error={touched.answerRate}
                                />
                                <FormHelperText error={Boolean(touched.answerRate && errors.answerRate)}>
                                    {touched.answerRate && errors.answerRate && (
                                        <span className="error-container">
                                            <ErrorMessage name="answerRate" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                    <InputLabel id="year-label">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.yearTitle')}</InputLabel>
                                    <Select
                                        value={values.startYears}
                                        onChange={handleChange}
                                        required
                                        labelId="year-label"
                                        id="startYears"
                                        name="startYears"
                                        label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.yearTitle')}
                                        error={touched.startYears}
                                    >
                                        {startYears.map(startYear => (
                                            <MenuItem key={startYear} value={startYear}>
                                                {startYear}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText error={Boolean(touched.startYears && errors.startYears)}>
                                        {touched.startYears && errors.startYears && (
                                            <span className="error-container">
                                                <ErrorMessage name="startYears" />
                                            </span>
                                        )}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    value={values.yearsCollected}
                                    required
                                    name={`yearsCollected`}
                                    id={`yearsCollected`}
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.yearsCollectedTitle')}
                                    onChange={(e) => {
                                        let inputValue = e.target.value;

                                        inputValue = inputValue.replace(/[^0-9]/g, '');

                                        if (parseInt(inputValue) < 1) {
                                            inputValue = '1';
                                        }
                                        handleChange(e);
                                    }}
                                    size="small"
                                    error={touched.yearsCollected}
                                />
                                <FormHelperText error={Boolean(touched.yearsCollected && errors.yearsCollected)}>
                                    {touched.yearsCollected && errors.yearsCollected && (
                                        <span className="error-container">
                                            <ErrorMessage name="yearsCollected" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                    <InputLabel id={`significance-label`}>{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.significanceTitle')}</InputLabel>
                                    <Select
                                        value={values.significance}
                                        onChange={handleChange}
                                        required
                                        labelId={`significance-label`}
                                        id={`significance`}
                                        name={`significance`}
                                        label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.significanceTitle')}
                                        error={touched.significance}
                                    >
                                        <MenuItem value="Significance">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.significanceItems.0')}</MenuItem>
                                        <MenuItem value="Insignificance">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.significanceItems.1')}</MenuItem>
                                    </Select>
                                    <FormHelperText error={Boolean(touched.significance && errors.significance)}>
                                        {touched.significance && errors.significance && (
                                            <span className="error-container">
                                                <ErrorMessage name="significance" />
                                            </span>
                                        )}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                value={values.source}
                                onChange={handleChange}
                                name={`source`}
                                id={`source`}
                                fullWidth
                                variant="outlined"
                                label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.sourceTitle')}
                                size="small"
                                inputProps={{
                                    maxLength: 100
                                }}
                                multiline
                                minRows={2}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t("Common.Adornment.maxCharLimit", { char: 100 })}</InputAdornment>,
                                }}
                                error={touched.source}
                            />
                            <FormHelperText error={Boolean(touched.source && errors.source)}>
                                {touched.source && errors.source && (
                                    <span className="error-container">
                                        <ErrorMessage name="source" />
                                    </span>
                                )}
                            </FormHelperText>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                value={values.comments}
                                onChange={handleChange}
                                name={`comments`}
                                id={`comments`}
                                fullWidth
                                variant="outlined"
                                label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.commentsTitle')}
                                size="small"
                                inputProps={{
                                    maxLength: 100
                                }}
                                multiline
                                minRows={2}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t("Common.Adornment.maxCharLimit", { char: 100 })}</InputAdornment>,
                                }}
                                error={touched.comments}
                            />
                            <FormHelperText error={Boolean(touched.comments && errors.comments)}>
                                {touched.comments && errors.comments && (
                                    <span className="error-container">
                                        <ErrorMessage name="comments" />
                                    </span>
                                )}
                            </FormHelperText>
                        </Grid>
                    </Grid>

                    <Grid container item xs={12} className={classes.sectionContainer}>
                        <Typography variant="h3" style={{ marginTop: 20, marginBottom: 15 }}>
                            {t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.basicAlternative.title')}
                        </Typography>
                        <Grid item xs={12}>
                            <Field
                                value={values.skipAlternative}
                                checked={values.skipAlternative}
                                onChange={handleChange}
                                as={Checkbox}
                                name="skipAlternative"
                                id="skipAlternative"
                                required
                            />
                            <span>
                                {t("AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.skip")}
                            </span>
                        </Grid>

                        <Grid item container spacing={2}>
                            <Grid item xs={3} sm={3} md={3}>
                                <TextField
                                    type="number"
                                    disabled={values.skipAlternative}
                                    value={values.alternative.amount}
                                    name={`alternative.amount`}
                                    id={`alternative.amount`}
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.basicAlternative.amountTitle')}
                                    onChange={handleChange}
                                    size="small"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>%</InputAdornment>,
                                    }}
                                    error={touched.alternative?.amount}
                                />
                                <FormHelperText error={Boolean(touched.alternative?.amount && errors.alternative?.amount)}>
                                    {touched.alternative?.amount && errors.alternative?.amount && (
                                        <span className="error-container">
                                            <ErrorMessage name="alternative.amount" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                            <Grid item xs={9} sm={9} md={9}>
                                <TextField
                                    disabled={values.skipAlternative}
                                    value={values.alternative.source}
                                    onChange={handleChange}
                                    name={`alternative.source`}
                                    id={`alternative.source`}
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.basicAlternative.sourceTitle')}
                                    size="small"
                                    inputProps={{
                                        maxLength: 100
                                    }}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t("Common.Adornment.maxCharLimit", { char: 100 })}</InputAdornment>,
                                    }}
                                    error={touched.alternative?.source}
                                />
                                <FormHelperText error={Boolean(touched.alternative?.source && errors.alternative?.source)}>
                                    {touched.alternative?.source && errors.alternative?.source && (
                                        <span className="error-container">
                                            <ErrorMessage name="alternative.source" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12}>
                                <TextField
                                    disabled={values.skipAlternative}
                                    value={values.alternative.comment}
                                    onChange={handleChange}
                                    name={`alternative.comment`}
                                    id={`alternative.comment`}
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.basicAlternative.commentsTitle')}
                                    size="small"
                                    inputProps={{
                                        maxLength: 100
                                    }}
                                    multiline
                                    minRows={2}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t("Common.Adornment.maxCharLimit", { char: 100 })}</InputAdornment>,
                                    }}
                                    error={touched.alternative?.comment}
                                />
                                <FormHelperText error={Boolean(touched.alternative?.comment && errors.alternative?.comment)}>
                                    {touched.alternative?.comment && errors.alternative?.comment && (
                                        <span className="error-container">
                                            <ErrorMessage name="alternative.comment" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                        </Grid>

                    </Grid>

                    <Grid container item xs={12} className={classes.sectionContainer}>
                        <Typography variant="h3" style={{ marginTop: 20, marginBottom: 15 }}>
                            {t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.sensitivityAnalysis.title')}
                        </Typography>
                        <Grid item xs={12}>
                            <Field
                                value={values.skipSensitivityAnalysis}
                                checked={values.skipSensitivityAnalysis}
                                onChange={handleChange}
                                as={Checkbox}
                                name="skipSensitivityAnalysis"
                                id="skipSensitivityAnalysis"
                                required
                            />
                            <span>
                                {t("AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.skip")}
                            </span>
                        </Grid>

                        <Grid item container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    type="number"
                                    disabled={values.skipSensitivityAnalysis}
                                    value={values.sensitivityAnalysis.deadweight}
                                    name="sensitivityAnalysis.deadweight"
                                    id="sensitivityAnalysis.deadweight"
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.sensitivityAnalysis.deadweightTitle')}
                                    onChange={handleChange}
                                    size="small"
                                    error={Boolean(touched.sensitivityAnalysis?.deadweight && errors.sensitivityAnalysis?.deadweight)}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>%</InputAdornment>,
                                    }}
                                />
                                <FormHelperText error={Boolean(touched.sensitivityAnalysis?.deadweight && errors.sensitivityAnalysis?.deadweight)}>
                                    {touched.sensitivityAnalysis?.deadweight && errors.sensitivityAnalysis?.deadweight && (
                                        <span className="error-container" style={{ margin: '0 14px' }}>
                                            <ErrorMessage name="sensitivityAnalysis.deadweight" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    disabled={values.skipSensitivityAnalysis}
                                    value={values.sensitivityAnalysis.displacement}
                                    name="sensitivityAnalysis.displacement"
                                    id="sensitivityAnalysis.displacement"
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.sensitivityAnalysis.displacementTitle')}
                                    onChange={handleChange}
                                    size="small"
                                    error={Boolean(touched.sensitivityAnalysis?.displacement && errors.sensitivityAnalysis?.displacement)}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>%</InputAdornment>,
                                    }}
                                />
                                <FormHelperText error={Boolean(touched.sensitivityAnalysis?.displacement && errors.sensitivityAnalysis?.displacement)}>
                                    {touched.sensitivityAnalysis?.displacement && errors.sensitivityAnalysis?.displacement && (
                                        <span className="error-container">
                                            <ErrorMessage name="sensitivityAnalysis.displacement" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    disabled={values.skipSensitivityAnalysis}
                                    value={values.sensitivityAnalysis.attribution}
                                    name={`sensitivityAnalysis.attribution`}
                                    id={`sensitivityAnalysis.attribution`}
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.sensitivityAnalysis.attributionTitle')}
                                    onChange={(e) => {
                                        let inputValue = e.target.value;

                                        inputValue = inputValue.replace(/[^0-9.]/g, '');

                                        let numericValue = parseFloat(inputValue);
                                        if (isNaN(numericValue) || numericValue < 0) {
                                            inputValue = '';
                                        } else if (numericValue > 100) {
                                            inputValue = '100';
                                            numericValue = 100;
                                        }
                                        handleChange(e);
                                    }}
                                    size="small"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>%</InputAdornment>,
                                    }}
                                    error={Boolean(touched.sensitivityAnalysis?.attribution && errors.sensitivityAnalysis?.attribution)}
                                />
                                <FormHelperText error={Boolean(touched.sensitivityAnalysis?.attribution && errors.sensitivityAnalysis?.attribution)}>
                                    {touched.sensitivityAnalysis?.attribution && errors.sensitivityAnalysis?.attribution && (
                                        <span className="error-container">
                                            <ErrorMessage name="sensitivityAnalysis.attribution" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    disabled={values.skipSensitivityAnalysis}
                                    value={values.sensitivityAnalysis.dropoff}
                                    name={`sensitivityAnalysis.dropoff`}
                                    id={`sensitivityAnalysis.dropoff`}
                                    fullWidth
                                    variant="outlined"
                                    label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.sensitivityAnalysis.dropOffTitle')}
                                    onChange={(e) => {
                                        let inputValue = e.target.value;

                                        inputValue = inputValue.replace(/[^0-9.]/g, '');

                                        let numericValue = parseFloat(inputValue);
                                        if (isNaN(numericValue) || numericValue < 0) {
                                            inputValue = '';
                                        } else if (numericValue > 100) {
                                            inputValue = '100';
                                            numericValue = 100;
                                        }
                                        handleChange(e);
                                    }}
                                    size="small"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>%</InputAdornment>,
                                    }}
                                    error={Boolean(touched.sensitivityAnalysis?.dropoff && errors.sensitivityAnalysis?.dropoff)}
                                />
                                <FormHelperText error={Boolean(touched.sensitivityAnalysis?.dropoff && errors.sensitivityAnalysis?.dropoff)}>
                                    {touched.sensitivityAnalysis?.dropoff && errors.sensitivityAnalysis?.dropoff && (
                                        <span className="error-container">
                                            <ErrorMessage name="sensitivityAnalysis.dropoff" />
                                        </span>
                                    )}
                                </FormHelperText>
                            </Grid>
                        </Grid>

                    </Grid>

                    <Grid container item xs={12} className={classes.beneficiariesSection}>
                        {values.beneficiaries.map((beneficiary, beneficiaryIndex) => (
                            <Grid container item xs={12}>
                                <Grid item xs={12}>
                                    <Grid container justifyContent="space-between" alignItems="center">
                                        <Typography variant="h3" style={{ marginTop: 20, marginBottom: 15 }}>
                                            {`${t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesTitle')} ${beneficiaryIndex + 1}`}
                                        </Typography>

                                        {values?.beneficiaries && values?.beneficiaries.length > 1 && (
                                            <IconItem>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => { handleRemoveBeneficiary(values, beneficiaryIndex, setFieldValue); handleChange(e) }}
                                                >
                                                    <CloseLineIcon />
                                                </IconButton>
                                            </IconItem>
                                        )}
                                    </Grid>
                                </Grid>

                                <Grid item container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                            <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                                <InputLabel id={`outcomes.beneficiary-name-label-${beneficiaryIndex}`}>{`${t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesTitle')} ${beneficiaryIndex + 1}`}</InputLabel>
                                                <Select
                                                    required
                                                    labelId={`beneficiary-name-label-${beneficiaryIndex}`}
                                                    id={`beneficiaries[${beneficiaryIndex}].name`}
                                                    name={`beneficiaries[${beneficiaryIndex}].name`}
                                                    label={`${t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesTitle')} ${beneficiaryIndex + 1}`}
                                                    value={beneficiary.name}
                                                    onChange={handleChange}
                                                    error={touched.beneficiaries?.[beneficiaryIndex]?.name}
                                                >
                                                    <MenuItem value="State">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesItems.0')}</MenuItem>
                                                    <MenuItem value="Region">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesItems.1')}</MenuItem>
                                                    <MenuItem value="Municipality">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesItems.2')}</MenuItem>
                                                    <MenuItem value="ExternalOrganisation">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesItems.3')}</MenuItem>
                                                    <MenuItem value="InternalOrganisation">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesItems.4')}</MenuItem>
                                                    <MenuItem value="Citizens">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesItems.5')}</MenuItem>
                                                    <MenuItem value="CaretakersNextOfKin">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesItems.6')}</MenuItem>
                                                    <MenuItem value="Employees">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesItems.7')}</MenuItem>
                                                    <MenuItem value="Volunteers">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesItems.8')}</MenuItem>
                                                    <MenuItem value="Custom">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.beneficiariesItems.9')}</MenuItem>
                                                </Select>
                                                <FormHelperText error={Boolean(touched.beneficiaries?.[beneficiaryIndex]?.name && errors.beneficiaries?.[beneficiaryIndex]?.name)}>
                                                    {touched.beneficiaries?.[beneficiaryIndex]?.name && errors.beneficiaries?.[beneficiaryIndex]?.name && (
                                                        <span className="error-container">
                                                            <ErrorMessage name={`beneficiaries[${beneficiaryIndex}].name`} />
                                                        </span>
                                                    )}
                                                </FormHelperText>
                                            </FormControl>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                            <InputLabel id={`beneficiary-type-label-${beneficiaryIndex}`}>{`${t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.effectTypeTitle')} ${beneficiaryIndex + 1}`}</InputLabel>
                                            <Select
                                                required
                                                labelId={`beneficiary-type-label-${beneficiaryIndex}`}
                                                id={`beneficiaries[${beneficiaryIndex}].type`}
                                                name={`beneficiaries[${beneficiaryIndex}].type`}
                                                label={`${t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.effectTypeTitle')} ${beneficiaryIndex + 1}`}
                                                value={beneficiary.type}
                                                onChange={handleChange}
                                                error={touched.beneficiaries?.[beneficiaryIndex]?.type}
                                            >
                                                <MenuItem value="Budgetary">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.effectTypeItems.0')}</MenuItem>
                                                <MenuItem value="Social">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.effectTypeItems.1')}</MenuItem>
                                                <MenuItem value="NonPriced">{t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.effectTypeItems.2')}</MenuItem>
                                            </Select>
                                            <FormHelperText error={Boolean(touched.beneficiaries?.[beneficiaryIndex]?.type && errors.beneficiaries?.[beneficiaryIndex]?.type)}>
                                                {touched.beneficiaries?.[beneficiaryIndex]?.type && errors.beneficiaries?.[beneficiaryIndex]?.type && (
                                                    <span className="error-container">
                                                        <ErrorMessage name={`beneficiaries[${beneficiaryIndex}].type`} />
                                                    </span>
                                                )}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            required={values.beneficiaries?.[beneficiaryIndex]?.type !== "NonPriced"}
                                            disabled={values.beneficiaries?.[beneficiaryIndex]?.type === "NonPriced"}
                                            name={`beneficiaries[${beneficiaryIndex}].value`}
                                            id={`beneficiaries[${beneficiaryIndex}].value`}
                                            fullWidth
                                            variant="outlined"
                                            label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.valueUnitTitle')}
                                            value={beneficiary.value}
                                            onChange={(e) => {
                                                let inputValue = e.target.value;

                                                inputValue = inputValue.replace(/[^0-9.]/g, '');

                                                handleChange({
                                                    target: {
                                                        name: `beneficiaries[${beneficiaryIndex}].value`,
                                                        value: inputValue,
                                                    },
                                                });
                                            }}
                                            size="small"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{getCurrencySymbol(lang)}</InputAdornment>
                                            }}
                                            error={touched.beneficiaries?.[beneficiaryIndex]?.value}
                                        />
                                        <FormHelperText error={Boolean(touched.beneficiaries?.[beneficiaryIndex]?.value && errors.beneficiaries?.[beneficiaryIndex]?.value)}>
                                            {touched.beneficiaries?.[beneficiaryIndex]?.value && errors.beneficiaries?.[beneficiaryIndex]?.value && (
                                                <span className="error-container">
                                                    <ErrorMessage name={`beneficiaries[${beneficiaryIndex}].value`} />
                                                </span>
                                            )}
                                        </FormHelperText>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                            <InputLabel id={`valueType-label-${beneficiaryIndex}`}>{'significance'}</InputLabel>
                                            <Select
                                                value={beneficiary.valueType}
                                                required
                                                labelId={`valueType-label-${beneficiaryIndex}`}
                                                name={`beneficiaries[${beneficiaryIndex}].valueType`}
                                                id={`beneficiaries[${beneficiaryIndex}].valueType`}
                                                label={'significance'}
                                                error={touched.beneficiaries?.[beneficiaryIndex]?.valueType}
                                            >
                                                <MenuItem value="Significance">{`Significance`}</MenuItem>
                                                <MenuItem value="Insignificance">{`Insignificance`}</MenuItem>
                                            </Select>
                                            <FormHelperText error={Boolean(touched.beneficiaries?.[beneficiaryIndex]?.valueType && errors.beneficiaries?.[beneficiaryIndex]?.valueType)}>
                                                {touched.beneficiaries?.[beneficiaryIndex]?.valueType && errors.beneficiaries?.[beneficiaryIndex]?.valueType && (
                                                    <span className="error-container">
                                                        <ErrorMessage name={`beneficiaries[${beneficiaryIndex}].valueType`} />
                                                    </span>
                                                )}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            name={`beneficiaries[${beneficiaryIndex}].source`}
                                            id={`beneficiaries[${beneficiaryIndex}].source`}
                                            label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.sourceTitle')}
                                            value={beneficiary.source}
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            inputProps={{
                                                maxLength: 100
                                            }}
                                            onChange={handleChange}
                                            multiline
                                            minRows={2}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t("Common.Adornment.maxCharLimit", { char: 100 })}</InputAdornment>,
                                            }}
                                            error={touched.beneficiaries?.[beneficiaryIndex]?.source}
                                        />
                                        <FormHelperText error={Boolean(touched.beneficiaries?.[beneficiaryIndex]?.source && errors.beneficiaries?.[beneficiaryIndex]?.source)}>
                                            {touched.beneficiaries?.[beneficiaryIndex]?.source && errors.beneficiaries?.[beneficiaryIndex]?.source && (
                                                <span className="error-container">
                                                    <ErrorMessage name={`beneficiaries[${beneficiaryIndex}].source`} />
                                                </span>
                                            )}
                                        </FormHelperText>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            name={`beneficiaries[${beneficiaryIndex}].comments`}
                                            id={`beneficiaries[${beneficiaryIndex}].comments`}
                                            value={beneficiary.comments}
                                            fullWidth
                                            variant="outlined"
                                            label={t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.commentsTitle')}
                                            size="small"
                                            onChange={handleChange}
                                            inputProps={{
                                                maxLength: 100
                                            }}
                                            multiline
                                            minRows={2}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t("Common.Adornment.maxCharLimit", { char: 100 })}</InputAdornment>,
                                            }}
                                            error={touched.beneficiaries?.[beneficiaryIndex]?.comments}
                                        />
                                        <FormHelperText error={Boolean(touched.beneficiaries?.[beneficiaryIndex]?.comments && errors.beneficiaries?.[beneficiaryIndex]?.comments)}>
                                            {touched.beneficiaries?.[beneficiaryIndex]?.comments && errors.beneficiaries?.[beneficiaryIndex]?.comments && (
                                                <span className="error-container">
                                                    <ErrorMessage name={`beneficiaries[${beneficiaryIndex}].comments`} />
                                                </span>
                                            )}
                                        </FormHelperText>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            onClick={() => handleAddBeneficiary(values, setFieldValue)}
                                            style={{ fontWeight: 600, color: "#ED4C2F" }}>
                                            {t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.beneficiaries.addBeneficiary')}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>

                </Grid>
            )
            }
        </CreateDialog >
    )
}

export default OutcomeDialog;
