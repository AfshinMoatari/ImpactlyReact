import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Box, Button, FormHelperText, Grid, IconButton, InputAdornment, TextField,
    Typography, makeStyles, Link, List, DialogContent,
    Theme
} from "@material-ui/core";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import { ErrorMessage, Form, Formik, FormikHelpers, FormikProps } from "formik";
import useSROIContext from "./SROIFlowProvider";
import * as Yup from 'yup';
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import NiceOutliner from "../../../../components/containers/NiceOutliner";
import NiceDivider from "../../../../components/visual/NiceDivider";
import ActionButton from "../../../../components/buttons/ActionButton";
import FormChip from "../../../../components/FormChip";
import BlueButton from "../../../../components/buttons/BlueButton";
import BaseDialog from "../../../../components/dialogs/BaseDialog";
import { Stakeholder } from "../../../../models/SROIFlow";

const StakeholdersView: React.FC<{
    handleBack: () => void;
    handleNext: () => void;
    handleClose: () => void
}> = ({ handleBack, handleNext, handleClose }) => {
    const { state, onChange } = useSROIContext();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const formikRef = useRef<FormikProps<Stakeholder[]>>(null);

    const validationSchema = Yup.array().of(
        Yup.object().shape({
            stakeholderName: Yup.string()
                .required(t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.validation.stakeholderName.required'))
                .max(30, t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.validation.stakeholderName.max')),
            stakeholderAmount: Yup.number()
                .required(t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.validation.stakeholderAmount.required'))
                .min(1, t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.validation.stakeholderAmount.min'))
                .integer(t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.validation.stakeholderAmount.integer'))
                .positive(t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.validation.stakeholderAmount.positive')),
            changes: Yup.array()
                .required(t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.validation.changes.required'))
                .min(1, t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.validation.changes.min'))
        })
    ).min(1, t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.validation.required'));

    const handleSave = async (values: Stakeholder[], { setSubmitting }: FormikHelpers<Stakeholder[]>) => {
        try {
            await validationSchema.validate(values, { abortEarly: false });
            setIsLoading(true);
            setTimeout(() => {
                handleNext();
                onChange({
                    ...state,
                    stakeholders: values,
                });
                setIsLoading(false);
            }, 400);
        } catch (err) {
            console.error('Validation failed:', err);
            setSubmitting(false);
            return;
        }
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
        inputAdornment: {
            [theme.breakpoints.down('md')]: {
                display: 'none',
            },
        },
    }));
    const classes = useStyles();

    const handleAddChange = (stakeholderIndex: number, value: string, setFieldValue: FormikHelpers<Stakeholder[]>["setFieldValue"]) => {
        handleCloseDialog();

        const updatedChanges = [
            ...(formikRef.current?.values[stakeholderIndex].changes || []),
            value
        ];

        setFieldValue(`[${stakeholderIndex}].changes`, updatedChanges);
    };

    const [openDialog, setOpenDialog] = useState(false);
    const [newItem, setNewItem] = useState('');
    const [currentStakeholderIndex, setCurrentStakeholderIndex] = useState<number | null>(null);

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewItem('');
        setCurrentStakeholderIndex(null);
    };

    const handleAddChangeClick = (index: number) => {
        setCurrentStakeholderIndex(index);
        setOpenDialog(true);
    };

    const handleAddStakeholder = (formik: FormikProps<Stakeholder[]>) => {
        const newStakeholders = [...formik.values];
        newStakeholders.push({ stakeholderName: '', stakeholderAmount: 0, changes: [] });
        formik.setValues(newStakeholders);
    };

    const handleRemoveStakeholder = (stakeholderIndex: number, formik: FormikProps<Stakeholder[]>) => {
        const newStakeholders = [...formik.values];
        newStakeholders.splice(stakeholderIndex, 1);
        formik.setValues(newStakeholders);
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
                    initialValues={state.stakeholders}
                    onSubmit={handleSave}
                    validationSchema={validationSchema}
                    validateOnMount
                    validateOnChange
                    validateOnBlur
                    innerRef={formikRef}
                >
                    {formik => (
                        <Form className={classes.formContainer}>
                            <NiceOutliner className={classes.root}>
                                <Typography variant='h1'>
                                    {t('AnalyticsPage.sroi.sroiFlow.stakeholders.title')}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {t('AnalyticsPage.sroi.sroiFlow.stakeholders.description')}
                                </Typography>
                            </NiceOutliner>
                            <Grid container spacing={8}>
                                <Grid item container spacing={2}>
                                    {formik.values.map((stakeholder, stakeholderIndex) => (
                                        <Grid item container xs={12} spacing={1} key={stakeholderIndex}>
                                            <Grid item xs={12}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="h3" style={{ flexGrow: 1 }}>
                                                        {formik.values[stakeholderIndex]?.stakeholderName || `${t("AnalyticsPage.sroi.sroiFlow.stakeholders.form.stakeholderName", { count: stakeholderIndex + 1 })}`}
                                                    </Typography>
                                                    {stakeholderIndex > 0 && (
                                                        <IconButton onClick={() => handleRemoveStakeholder(stakeholderIndex, formik)}>
                                                            <CloseLineIcon color={"#0A08128F"} />
                                                        </IconButton>
                                                    )}
                                                </div>
                                            </Grid>
                                            <Grid item container>
                                                <Grid item xs={8} style={{ paddingRight: 8 }}>
                                                    <TextField
                                                        required
                                                        name={`[${stakeholderIndex}].stakeholderName`}
                                                        id={`[${stakeholderIndex}].stakeholderName`}
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        label={t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.stakeholderNameTitle')}
                                                        value={formik.values[stakeholderIndex]?.stakeholderName}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end" className={classes.inputAdornment}>
                                                                    {t("Common.Adornment.maxCharLimit", { char: 100 })}
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        error={
                                                            formik.touched[stakeholderIndex]?.stakeholderName &&
                                                            Boolean(formik.errors[stakeholderIndex]?.stakeholderName)
                                                        }
                                                    />
                                                    <FormHelperText
                                                        error={
                                                            formik.touched[stakeholderIndex]?.stakeholderName &&
                                                            formik.errors[stakeholderIndex]?.stakeholderName
                                                        }
                                                    >
                                                        {formik.touched?.[stakeholderIndex]?.stakeholderName && (
                                                            <span className="error-container" style={{ margin: '0 14px' }}>
                                                                <ErrorMessage name={`[${stakeholderIndex}].stakeholderName`} />
                                                            </span>
                                                        )}
                                                    </FormHelperText>
                                                </Grid>
                                                <Grid item xs={4} style={{ paddingLeft: 8 }}>
                                                    <TextField
                                                        required
                                                        name={`[${stakeholderIndex}].stakeholderAmount`}
                                                        id={`[${stakeholderIndex}].stakeholderAmount`}
                                                        fullWidth
                                                        variant="outlined"
                                                        label={t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.stakeholderAmountTitle')}
                                                        value={formik.values[stakeholderIndex]?.stakeholderAmount}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
                                                            formik.setFieldValue(`[${stakeholderIndex}].stakeholderAmount`, value ? Number(value) : '');
                                                        }}
                                                        onBlur={formik.handleBlur}
                                                        size="small"
                                                        type="text" // Keep as text to handle empty string case
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end" className={classes.inputAdornment}>
                                                                    {t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.numbers')}
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        error={Boolean(formik.touched?.[stakeholderIndex]?.stakeholderAmount && formik.errors?.[stakeholderIndex]?.stakeholderAmount)}
                                                    />
                                                    <FormHelperText
                                                        error={Boolean(formik.touched?.[stakeholderIndex]?.stakeholderAmount && formik.errors?.[stakeholderIndex]?.stakeholderAmount)}
                                                    >
                                                        {formik.touched?.[stakeholderIndex]?.stakeholderAmount && (
                                                            <span className="error-container" style={{ margin: '0 14px' }}>
                                                                <ErrorMessage name={`[${stakeholderIndex}].stakeholderAmount`} />
                                                            </span>
                                                        )}
                                                    </FormHelperText>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <List
                                                    sx={{
                                                        width: "100%",
                                                    }}
                                                >
                                                    <li>
                                                        {formik.values?.[stakeholderIndex]?.changes.map((change, index) => (
                                                            <FormChip
                                                                key={index}
                                                                style={{
                                                                    borderRadius: 16,
                                                                    maxWidth: "100%",
                                                                    marginBottom: 8,
                                                                    marginLeft: 2
                                                                }}
                                                                itemName={change}
                                                                onDelete={() => {
                                                                    const updatedChanges = formik.values?.[stakeholderIndex]?.changes.filter((_, i) => i !== index);
                                                                    formik.setFieldValue(`[${stakeholderIndex}].changes`, updatedChanges);
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
                                                            onClick={() => handleAddChangeClick(stakeholderIndex)}
                                                        >
                                                            {t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.addChange')}
                                                        </BlueButton>

                                                        <FormHelperText error={formik.touched?.[stakeholderIndex]?.changes && Boolean(formik.errors?.[stakeholderIndex]?.changes)}>
                                                            {formik.touched?.[stakeholderIndex]?.changes && formik.errors?.[stakeholderIndex]?.changes && (
                                                                <span className="error-container" style={{ display: 'block', marginLeft: 16 }}>
                                                                    {formik.errors?.[stakeholderIndex]?.changes}
                                                                </span>
                                                            )}
                                                        </FormHelperText>
                                                    </li>
                                                </List>
                                            </Grid>
                                        </Grid>
                                    ))}
                                    <Grid item xs={12}>
                                        <Button
                                            onClick={() => handleAddStakeholder(formik)}
                                            style={{ fontWeight: 600, color: "#ED4C2F" }}>
                                            {t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.addStakeholder')}
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

                            <BaseDialog
                                open={openDialog}
                                onClose={handleCloseDialog}
                                title={t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.addChangesDialog.changesTitle')}
                                description={""}
                                className={classes.dialog}
                            >
                                <DialogContent className={classes.dialogContent}>
                                    <TextField
                                        label={t('AnalyticsPage.sroi.sroiFlow.stakeholders.form.addChangesDialog.changeTitle')}
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
                                            endAdornment: (
                                                <InputAdornment position="end" className={classes.inputAdornment}>
                                                    {t("Common.Adornment.maxCharLimit", { char: 100 })}
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        size="large"
                                        type='submit'
                                        aria-label="submit"
                                        onClick={() => {
                                            if (currentStakeholderIndex !== null) {
                                                handleAddChange(currentStakeholderIndex, newItem, formik.setFieldValue);
                                            }
                                        }}
                                        disabled={!newItem}
                                        color={"primary"}
                                        style={{ fontWeight: 600, marginTop: 24 }}
                                    >
                                        {t("RegisterDialog.save")}
                                    </Button>
                                </DialogContent>
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
        </>
    );
};

export default StakeholdersView;
