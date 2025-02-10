import React, { useRef, useState } from "react";
import { EmptyCondition } from "../../../../components/containers/EmptyCondition";
import { useTranslation } from "react-i18next";
import { Box, Button, FormHelperText, Grid, IconButton, InputAdornment, TextField, Typography, makeStyles, Link, FormControl, InputLabel, MenuItem, Select, Theme } from "@material-ui/core";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import { ErrorMessage, Form, Formik, FormikHelpers, FormikProps } from "formik";
import useSROIContext from "./SROIFlowProvider";
import * as Yup from 'yup';
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import NiceOutliner from "../../../../components/containers/NiceOutliner";
import NiceDivider from "../../../../components/visual/NiceDivider";
import { TargetGroup } from "../../../../models/SROIFlow";
import ActionButton from "../../../../components/buttons/ActionButton";

const TargetGroupView: React.FC<
    {
        handleBack: () => void;
        handleNext: () => void;
        handleClose: () => void
    }
> = ({ handleBack, handleNext, handleClose }) => {
    const { state, onChange } = useSROIContext();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const formikRef = useRef<FormikProps<TargetGroup>>(null);

    const validationSchema = Yup.object().shape({
        category: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.category.required'))
            .oneOf(
                [
                    'VulnerableChildrenAndYouth',
                    'VulnerableAdults',
                    'AdultsWithDisabilities',
                    'VulnerableFamilies',
                    'RelativesOfVulnerableCitizens',
                    'Custom'
                ],
                t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.category.oneOf')
            ),
        customCategory: Yup.string().when('category', {
            is: 'Custom',
            then: Yup.string().required(t('Required')),
            otherwise: Yup.string()
        }),
        ageGroupMin: Yup.number()
            .required(t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.ageGroupMin.required'))
            .typeError(t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.ageGroupMin.typeError'))
            .min(1, t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.ageGroupMin.min'))
            .max(100, t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.ageGroupMin.max')),
        ageGroupMax: Yup.number()
            .required(t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.ageGroupMax.required'))
            .typeError(t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.ageGroupMax.typeError'))
            .min(1, t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.ageGroupMax.min'))
            .max(100, t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.ageGroupMax.max')),
        targetGroupDescription: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.targetGroupDescription.required'))
            .max(600, t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.targetGroupDescription.max')),
        riskFactors: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.riskFactors.required'))
            .max(600, t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.validation.riskFactors.max')),
    });

    const handleSave = async (values: TargetGroup, { resetForm }: FormikHelpers<TargetGroup>) => {
        setIsLoading(true);
        setTimeout(() => {
            handleNext();
            onChange({
                ...state,
                targetGroup: values,
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
        gridContainer: {
            marginTop: theme.spacing(2),
        },
        gridItem: {
            [theme.breakpoints.down('xs')]: {
                paddingLeft: '0 !important',
                paddingRight: '0 !important',
            }
        },
        helpBox: {
            margin: theme.spacing(4, 0),
        },
        inputAdornment: {
            [theme.breakpoints.down('md')]: {
                display: 'none',
            },
        },
    }));
    const classes = useStyles();

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
                    initialValues={state.targetGroup}
                    onSubmit={(values, formikHelpers) => handleSave(values, formikHelpers)}
                    validationSchema={validationSchema}
                    innerRef={formikRef}
                >
                    {formik => (
                        <Form className={classes.formContainer}>
                            <NiceOutliner className={classes.root}>
                                <Typography variant='h1'>
                                    {t('AnalyticsPage.sroi.sroiFlow.targetGroup.title')}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {t('AnalyticsPage.sroi.sroiFlow.targetGroup.description')}
                                </Typography>
                            </NiceOutliner>

                            <Grid container spacing={3} className={classes.gridContainer}>
                                <Grid item container spacing={2}>
                                    <Grid item container xs={12}>
                                        <Grid item xs={12} sm={6} className={classes.gridItem} style={{ paddingRight: 8 }}>
                                            <FormControl variant="outlined" size="small" fullWidth>
                                                <InputLabel id={"intervention.targetGroup.category-label"}>
                                                    {t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.categoryTitle')}
                                                </InputLabel>
                                                <Select
                                                    required
                                                    labelId={"intervention.targetGroup.category-label"}
                                                    id="intervention.targetGroup.category"
                                                    name="category"
                                                    label={t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.categoryTitle')}
                                                    value={formik.values.category}
                                                    onChange={formik.handleChange}
                                                    error={formik.touched.category && Boolean(formik.errors.category)}
                                                >
                                                    <MenuItem value="VulnerableChildrenAndYouth">{t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.categoryItems.0')}</MenuItem>
                                                    <MenuItem value="VulnerableAdults">{t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.categoryItems.1')}</MenuItem>
                                                    <MenuItem value="AdultsWithDisabilities">{t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.categoryItems.2')}</MenuItem>
                                                    <MenuItem value="VulnerableFamilies">{t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.categoryItems.3')}</MenuItem>
                                                    <MenuItem value="RelativesOfVulnerableCitizens">{t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.categoryItems.4')}</MenuItem>
                                                    <MenuItem value="Custom">{'Custom'}</MenuItem>
                                                </Select>
                                                <FormHelperText error={formik.touched.category && Boolean(formik.errors.category)}>
                                                    {formik.touched.category && formik.errors.category && (
                                                        <span className="error-container" style={{ margin: '0 14px' }}>
                                                            <ErrorMessage name="category" />
                                                        </span>
                                                    )}
                                                </FormHelperText>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6} style={{ paddingLeft: 8 }}>
                                            <TextField
                                                required
                                                name="customCategory"
                                                id="customCategory"
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label={t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.customCategoryTitle')}
                                                value={formik.values.customCategory}
                                                onChange={formik.handleChange}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end" className={classes.inputAdornment}>{t("Common.Adornment.maxCharLimit", { char: 100 })}</InputAdornment>,
                                                }}
                                                disabled={formik.values.category !== "Custom"}
                                                error={formik.touched.customCategory && Boolean(formik.errors.customCategory)}
                                                helperText={formik.touched.customCategory && formik.errors.customCategory}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid item container xs={12}>
                                        <Grid item xs={6} style={{ paddingRight: 8 }}>
                                            <TextField
                                                required
                                                name="ageGroupMin"
                                                id="ageGroupMin"
                                                fullWidth
                                                variant="outlined"
                                                label={t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.ageGroupMinTitle')}
                                                value={formik.values.ageGroupMin}
                                                onChange={(e) => {
                                                    let sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
                                                    if (sanitizedValue !== '') {
                                                        const numericValue = parseInt(sanitizedValue, 10);
                                                        if (numericValue > 100) {
                                                            sanitizedValue = '100';
                                                        } else if (numericValue < 1) {
                                                            sanitizedValue = '1';
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
                                                error={formik.touched.ageGroupMin && Boolean(formik.errors.ageGroupMin)}
                                                helperText={formik.touched.ageGroupMin && formik.errors.ageGroupMin}
                                            />
                                        </Grid>
                                        <Grid item xs={6} style={{ paddingLeft: 8 }}>
                                            <TextField
                                                required
                                                name="ageGroupMax"
                                                id="ageGroupMax"
                                                fullWidth
                                                variant="outlined"
                                                label={t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.ageGroupMaxTitle')}
                                                value={formik.values.ageGroupMax}
                                                onChange={(e) => {
                                                    let sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
                                                    if (sanitizedValue !== '') {
                                                        const numericValue = parseInt(sanitizedValue, 10);
                                                        if (numericValue > 100) {
                                                            sanitizedValue = '100';
                                                        } else if (numericValue < 1) {
                                                            sanitizedValue = '1';
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
                                                error={formik.touched.ageGroupMax && Boolean(formik.errors.ageGroupMax)}
                                                helperText={formik.touched.ageGroupMax && formik.errors.ageGroupMax}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid item container xs={12}>
                                        <TextField
                                            required
                                            name="targetGroupDescription"
                                            id="targetGroupDescription"
                                            fullWidth
                                            variant="outlined"
                                            label={t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.targetGroupDescriptionTitle')}
                                            value={formik.values.targetGroupDescription}
                                            onChange={formik.handleChange}
                                            multiline
                                            minRows={6}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end" className={classes.inputAdornment}>
                                                        {t("Common.Adornment.maxCharLimit", { char: 300 })}
                                                    </InputAdornment>
                                                ),
                                            }}
                                            error={formik.touched.targetGroupDescription && Boolean(formik.errors.targetGroupDescription)}
                                            helperText={formik.touched.targetGroupDescription && formik.errors.targetGroupDescription}
                                        />
                                    </Grid>
                                    <Grid item container xs={12}>
                                        <TextField
                                            required
                                            name="riskFactors"
                                            id="riskFactors"
                                            fullWidth
                                            variant="outlined"
                                            label={t('AnalyticsPage.sroi.sroiFlow.targetGroup.form.riskFactorsTitle')}
                                            value={formik.values.riskFactors}
                                            onChange={formik.handleChange}
                                            multiline
                                            minRows={6}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end" className={classes.inputAdornment}>
                                                        {t("Common.Adornment.maxCharLimit", { char: 300 })}
                                                    </InputAdornment>
                                                ),
                                            }}
                                            error={formik.touched.riskFactors && Boolean(formik.errors.riskFactors)}
                                            helperText={formik.touched.riskFactors && formik.errors.riskFactors}
                                        />
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

export default TargetGroupView;
