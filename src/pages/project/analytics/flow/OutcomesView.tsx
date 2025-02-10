import React, { useRef, useState } from "react";
import {
    Box,
    Button,
    FormHelperText,
    Grid,
    IconButton,
    TextField,
    Typography,
    makeStyles,
    Theme
} from "@material-ui/core";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import { ErrorMessage, Form, Formik, FormikHelpers, FormikProps } from "formik";
import useSROIContext from "./SROIFlowProvider";
import * as Yup from 'yup';
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import NiceOutliner from "../../../../components/containers/NiceOutliner";
import { Outcome } from "../../../../models/SROIFlow";
import { useTranslation } from "react-i18next";
import { EmptyCondition } from "../../../../components/containers/EmptyCondition";
import OutcomeDialog from "./OutcomeDialog";
import ActionButton from "../../../../components/buttons/ActionButton";

const OutcomesView: React.FC<{
    handleBack: () => void;
    handleNext: () => void;
    handleClose: () => void;
}> = ({ handleBack, handleNext, handleClose }) => {
    const { state, onChange } = useSROIContext();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const formikRef = useRef<FormikProps<Outcome[]>>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const defaultOutcome = {
        outcomeName: "",
        outcomeDescription: "",
        measurementMethod: "",
        outcomeStart: "",
        outcomeDuration: null,
        outcomePopulation: null,
        effectType: "",
        effectSize: null,
        significance: "",
        source: "",
        comments: "",
        answerRate: null,
        startYears: null,
        yearsCollected: null,
        skipAlternative: false,
        alternative: {
            amount: null,
            source: "",
            comment: ""
        },
        skipSensitivityAnalysis: false,
        sensitivityAnalysis: {
            deadweight: null,
            displacement: null,
            attribution: null,
            dropoff: null
        },
        beneficiaries: [{
            name: '',
            type: 'Social',
            valueType: 'Significance',
            value: null,
            source: '',
            comments: ''
        }]
    }

    const [selectedOutcome, setSelectedOutcome] = useState<Outcome>(defaultOutcome);
    const [isEdit, setEdit] = useState<boolean>(false);

    const validationSchema = Yup.object().shape({
        outcomes: Yup.array()
            .required(t('AnalyticsPage.sroi.sroiFlow.outcomes.form.validation.outcomes.required'))
            .min(1, t('AnalyticsPage.sroi.sroiFlow.outcomes.form.validation.outcomes.min'))
            .of(
                Yup.object().shape({
                    outcomeName: Yup.string().required(t('AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.validation.outcomeName.required')),
                })
            )
    });

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOutcome(defaultOutcome);
    };

    const handleSave = async (values: Outcome[], { resetForm }: FormikHelpers<Outcome[]>) => {
        setIsLoading(true);
        setTimeout(() => {
            handleNext();
            onChange({
                ...state,
                outcomes: values,
            });
            setIsLoading(false);
        }, 400);
    };

    const handleOutcomeSubmit = (outcome: Outcome) => {
        setIsLoading(true);

        const currentOutcomes = formikRef.current?.values || [];

        if (isEdit) {
            const updatedOutcomes = currentOutcomes.map((o) =>
                o.outcomeName === selectedOutcome.outcomeName ? outcome : o
            );
            formikRef.current?.setValues(updatedOutcomes);
        } else {
            formikRef.current?.setValues([
                ...currentOutcomes,
                outcome
            ]);
        }

        setOpenDialog(false);
        setIsLoading(false);

        formikRef.current?.validateForm();
    };

    const handleCopyOutcome = (outcome: Outcome) => {
        if (formikRef.current) {
            const currentValues = [...formikRef.current.values];
            currentValues.push({ ...outcome, outcomeName: `${outcome.outcomeName} (Copy)` });
            formikRef.current.setValues(currentValues);
        }
    };

    const handleRemoveOutcome = (outcomeIndex: number) => {
        if (formikRef.current) {
            const currentValues = [...formikRef.current.values];
            currentValues.splice(outcomeIndex, 1);
            formikRef.current.setValues(currentValues);
        }
    };

    const handleEditOutcome = (outcome: Outcome) => {
        setEdit(true);
        setSelectedOutcome(outcome);
        setOpenDialog(true);
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
        outcomesList: {
            width: '100%',
            marginTop: theme.spacing(2),
        },
        outcomeItem: {
            marginBottom: theme.spacing(2),
            padding: theme.spacing(2),
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: theme.spacing(1),
            [theme.breakpoints.down('xs')]: {
                padding: theme.spacing(1),
            },
        },
        addButton: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(3),
        },
        dialogContent: {
            width: '100%',
            maxWidth: 1000,
            margin: 'auto',
            [theme.breakpoints.down('sm')]: {
                maxWidth: '100%',
            },
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
                    initialValues={state.outcomes}
                    onSubmit={handleSave}
                    validationSchema={validationSchema}
                    innerRef={formikRef}
                >
                    {formik => (
                        <Form className={classes.formContainer}>
                            <NiceOutliner className={classes.root}>
                                <Typography variant='h1'>
                                    {t('AnalyticsPage.sroi.sroiFlow.outcomes.title')}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {t('AnalyticsPage.sroi.sroiFlow.outcomes.description')}
                                </Typography>
                            </NiceOutliner>

                            <div className={classes.outcomesList}>
                                {formik.values.map((outcome, outcomeIndex) => (
                                    <Grid
                                        item
                                        container
                                        xs={12}
                                        key={outcomeIndex}
                                        alignItems="center"
                                        spacing={0}
                                        wrap="nowrap"
                                        style={{ marginBottom: 16 }}
                                    >
                                        <Grid item>
                                            <IconButton
                                                onClick={() => handleRemoveOutcome(outcomeIndex)}
                                            >
                                                <CloseLineIcon color={"#0A08128F"} />
                                            </IconButton>
                                        </Grid>

                                        <Grid item xs>
                                            <TextField
                                                required
                                                name={`outcomes[${outcomeIndex}].outcomeName`}
                                                id={`outcomes[${outcomeIndex}].outcomeName`}
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label={t("AnalyticsPage.sroi.sroiFlow.outcomes.outcomeDialog.form.outcomeNameTitle")}
                                                value={outcome.outcomeName || ''}
                                                onChange={formik.handleChange}
                                                error={Boolean(
                                                    formik.touched?.[outcomeIndex]?.outcomeName &&
                                                    formik.errors?.[outcomeIndex]?.outcomeName
                                                )}
                                            />
                                            <ErrorMessage
                                                name={`outcomes[${outcomeIndex}].outcomeName`}
                                                component={FormHelperText}
                                                style={{ color: 'red' }}
                                            />
                                        </Grid>

                                        <Grid item>
                                            <Button
                                                color="default"
                                                variant="contained"
                                                style={{
                                                    boxShadow: "0 2px 3px rgba(0,0,0,.09)",
                                                    padding: "10px 16px",
                                                    borderRadius: 36,
                                                    whiteSpace: "nowrap",
                                                    marginLeft: 12,
                                                }}
                                                onClick={() => handleCopyOutcome(outcome)}
                                            >
                                                {t('AnalyticsPage.sroi.sroiFlow.copy')}
                                            </Button>
                                        </Grid>

                                        <Grid item>
                                            <Button
                                                color="primary"
                                                variant="contained"
                                                style={{
                                                    boxShadow: "0 2px 3px rgba(0,0,0,.09)",
                                                    padding: "10px 16px",
                                                    borderRadius: 36,
                                                    whiteSpace: "nowrap",
                                                    marginLeft: 12,
                                                }}
                                                onClick={() => handleEditOutcome(outcome)}
                                            >
                                                {t('AnalyticsPage.sroi.sroiFlow.edit')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                ))}
                            </div>

                            <div className={classes.addButton}>
                                <Button
                                    onClick={() => setOpenDialog(true)}
                                    style={{ fontWeight: 600, color: "#ED4C2F" }}
                                >
                                    {t('AnalyticsPage.sroi.sroiFlow.outcomes.addOutcome')}
                                </Button>
                            </div>

                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <ActionButton
                                        size="small"
                                        style={{
                                            borderRadius: 52,
                                            padding: "6px 16px",
                                            textTransform: "uppercase",
                                            fontSize: 14,
                                        }}
                                        disabled={formik.isSubmitting || formik.values.length === 0}
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
                        </Form>
                    )}
                </Formik>
                <OutcomeDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    initialValues={selectedOutcome}
                    onSubmit={(newOutcome) => {
                        handleOutcomeSubmit(newOutcome);
                    }}
                    lang={state.general.reportLanguage}
                />
            </div>
        </EmptyCondition>
    );
};

export default OutcomesView;
