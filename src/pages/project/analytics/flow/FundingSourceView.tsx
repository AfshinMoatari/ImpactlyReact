import React, { useRef, useState, useEffect } from "react";
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
import ActionButton from "../../../../components/buttons/ActionButton";
import { FundingSource } from "../../../../models/SROIFlow";

const FundingSourceView: React.FC<
    {
        handleBack: () => void;
        handleNext: () => void;
        handleClose: () => void
    }
> = ({ handleBack, handleNext, handleClose }) => {
    const { state, onChange } = useSROIContext();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const formikRef = useRef<FormikProps<FundingSource>>(null);

    const validationSchema = Yup.object().shape({
        totalCosts: Yup.number()
            .required(t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.validation.totalCosts.required'))
            .min(1, t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.validation.totalCosts.min'))
            .typeError(t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.validation.totalCosts.typeError')),
        fundings: Yup.array().of(
            Yup.object().shape({
                fundingName: Yup.string()
                    .required(t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.validation.fundingSourceName.required'))
                    .max(60, t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.validation.fundingSourceName.max')),
                proportion: Yup.number()
                    .required(t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.validation.proportion.required'))
                    .typeError(t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.validation.proportion.typeError'))
                    .min(1, t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.validation.proportion.min'))
                    .max(100, t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.validation.proportion.max'))
            })
        )
    });

    const handleSave = async (values: FundingSource, { resetForm }: FormikHelpers<FundingSource>) => {
        setIsLoading(true);
        setTimeout(() => {
            handleNext();
            onChange({
                ...state,
                fundingSource: values,
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
        inputAdornment: {
            [theme.breakpoints.down('md')]: {
                display: 'none',
            },
        },
    }));
    const classes = useStyles();

    const handleAddFunding = (formik: FormikProps<FundingSource>) => {
        const newFundings = [...formik.values.fundings];
        newFundings.push({ fundingName: '', proportion: 0 });
        formik.setValues({
            ...formik.values,
            fundings: newFundings
        });
    };

    const handleRemoveFunding = (fundingIndex: number, formik: FormikProps<FundingSource>) => {
        const newFundings = [...formik.values.fundings];
        newFundings.splice(fundingIndex, 1);
        formik.setValues({
            ...formik.values,
            fundings: newFundings
        });
    };

    return (
        <>
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
                    initialValues={state.fundingSource}
                    onSubmit={(values, formikHelpers) => handleSave(values, formikHelpers)}
                    validationSchema={validationSchema}
                    innerRef={formikRef}
                >
                    {formik => (
                        <Form className={classes.formContainer}>
                            <NiceOutliner className={classes.root}>
                                <Typography variant='h1'>
                                    {t('AnalyticsPage.sroi.sroiFlow.fundingSource.title')}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {t('AnalyticsPage.sroi.sroiFlow.fundingSource.description')}
                                </Typography>
                            </NiceOutliner>
                            <Grid container spacing={4}>
                                <Grid item container spacing={4}>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            name="totalCosts"
                                            id="totalCosts"
                                            fullWidth
                                            variant="outlined"
                                            label={t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.totalInputCostsTitle')}
                                            size="small"
                                            type="text"
                                            value={formik.values.totalCosts}
                                            onChange={(e) => {
                                                let inputValue = e.target.value;
                                                inputValue = inputValue.replace(/[^0-9.]/g, '');

                                                formik.handleChange({
                                                    target: {
                                                        name: e.target.name,
                                                        value: inputValue,
                                                    },
                                                });
                                            }}
                                            error={formik.touched.totalCosts && Boolean(formik.errors.totalCosts)}
                                            helperText={formik.touched.totalCosts && formik.errors.totalCosts}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <NiceDivider style={{ background: '#0A08121F', height: 1, margin: 0 }} />
                                    </Grid>
                                </Grid>
                                <Grid item container xs={12}>
                                    {formik.values.fundings.map((funding, fundingIndex) => (
                                        <Grid item container xs={12} key={fundingIndex}>
                                            <Grid item xs={12}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="h3" style={{ flexGrow: 1 }}>
                                                        {formik.values.fundings[fundingIndex]?.fundingName || `${t("AnalyticsPage.sroi.fundingSource.form.fundingSourceName", { count: fundingIndex + 1 })}`}
                                                    </Typography>
                                                    {fundingIndex > 0 && (
                                                        <IconButton onClick={() => handleRemoveFunding(fundingIndex, formik)}>
                                                            <CloseLineIcon color={"#0A08128F"} />
                                                        </IconButton>
                                                    )}
                                                </div>
                                            </Grid>
                                            <Grid item container xs={12}>
                                                <Grid item xs={8} style={{ paddingRight: 8 }}>
                                                    <TextField
                                                        required
                                                        name={`fundings[${fundingIndex}].fundingName`}
                                                        id={`fundings[${fundingIndex}].fundingName`}
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        label={t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.fundingSourceNameTitle')}
                                                        value={formik.values.fundings[fundingIndex]?.fundingName}
                                                        onChange={formik.handleChange}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end" className={classes.inputAdornment}>
                                                                    {t("Common.Adornment.maxCharLimit", { char: 100 })}
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        error={Boolean(formik.touched.fundings?.[fundingIndex]?.fundingName && formik.errors.fundings?.[fundingIndex]?.fundingName)}
                                                    />
                                                    <FormHelperText
                                                        error={Boolean(formik.touched.fundings?.[fundingIndex]?.fundingName && formik.errors.fundings?.[fundingIndex]?.fundingName)}
                                                    >
                                                        {formik.touched.fundings?.[fundingIndex]?.fundingName && (
                                                            <span className="error-container" style={{ margin: '0 14px' }}>
                                                                <ErrorMessage name={`fundings[${fundingIndex}].fundingName`} />
                                                            </span>
                                                        )}
                                                    </FormHelperText>
                                                </Grid>
                                                <Grid item xs={4} style={{ paddingLeft: 8 }}>
                                                    <TextField
                                                        required
                                                        name={`fundings[${fundingIndex}].proportion`}
                                                        id={`fundings[${fundingIndex}].proportion`}
                                                        fullWidth
                                                        variant="outlined"
                                                        label={t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.fundingSourceProportionTitle')}
                                                        value={formik.values.fundings[fundingIndex]?.proportion}
                                                        onChange={(e) => {
                                                            let inputValue = e.target.value;
                                                            inputValue = inputValue.replace(/[^0-9.]/g, '');

                                                            const numericValue = parseFloat(inputValue);
                                                            if (!isNaN(numericValue)) {
                                                                if (numericValue < 1) {
                                                                    inputValue = '1';
                                                                } else if (numericValue > 100) {
                                                                    inputValue = '100';
                                                                }
                                                            }

                                                            formik.handleChange({
                                                                target: {
                                                                    name: e.target.name,
                                                                    value: inputValue,
                                                                },
                                                            });
                                                        }}
                                                        size="small"
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                        }}
                                                        error={Boolean(formik.touched.fundings?.[fundingIndex]?.proportion && formik.errors.fundings?.[fundingIndex]?.proportion)}
                                                    />
                                                    <FormHelperText
                                                        error={Boolean(formik.touched.fundings?.[fundingIndex]?.proportion && formik.errors.fundings?.[fundingIndex]?.proportion)}
                                                    >
                                                        {formik.touched.fundings?.[fundingIndex]?.proportion && (
                                                            <span className="error-container" style={{ margin: '0 14px' }}>
                                                                <ErrorMessage name={`fundings[${fundingIndex}].proportion`} />
                                                            </span>
                                                        )}
                                                    </FormHelperText>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    ))}
                                    <Grid item xs={12}>
                                        <Button
                                            onClick={() => handleAddFunding(formik)}
                                            style={{ fontWeight: 600, color: "#ED4C2F" }}>
                                            {t('AnalyticsPage.sroi.sroiFlow.fundingSource.form.addFundingSource')}
                                        </Button>
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
        </>
    );
};

export default FundingSourceView;
