import React, { useRef, useState } from "react";
import { EmptyCondition } from "../../../../components/containers/EmptyCondition";
import { Box, Button, Checkbox, FormHelperText, Grid, IconButton, Link, makeStyles, TextField, Theme, Typography } from "@material-ui/core";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import { FormikProps, FormikHelpers, Formik, Form, Field } from "formik";
import { t } from "i18next";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import NiceOutliner from "../../../../components/containers/NiceOutliner";
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import * as Yup from 'yup';
import { Confirmation } from "../../../../models/SROIFlow";
import useSROIContext from "./SROIFlowProvider";
import NiceDivider from "../../../../components/visual/NiceDivider";
import ActionButton from "../../../../components/buttons/ActionButton";


const ConfirmationView: React.FC<{ handleBack: () => void; handleSubmit: (state: any) => void; handleClose: () => void }> = ({ handleBack, handleSubmit, handleClose }) => {
    const formikRef = useRef<FormikProps<Confirmation>>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { state, onChange } = useSROIContext();

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
        checkboxLabel: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: theme.spacing(2),
        }
    }));
    const classes = useStyles();
    const validationSchema = Yup.object().shape({

    });
    const handleSave = async (values: Confirmation, { resetForm }: FormikHelpers<Confirmation>) => {
        setIsLoading(true);
        setTimeout(() => {
            onChange({
                ...state,
                confirmation: values,
            });
            handleSubmit({
                ...state,
                confirmation: values,
            });
            setIsLoading(false);
        }, 400);
    };

    return (
        <EmptyCondition>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'row', padding: 16 }}>
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

                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'auto',
                    padding: '0 32px'
                }}>
                    {isLoading && <LoadingOverlay />}
                    <Formik
                        initialValues={state.confirmation}
                        onSubmit={(values, formikHelpers) => handleSave(values, formikHelpers)}
                        validationSchema={validationSchema}
                        innerRef={formikRef}
                    >
                        {formik => (
                            <Form style={{
                                width: '100%',
                                maxWidth: 800,
                                margin: '32px auto'
                            }}>
                                <NiceOutliner className={classes.root}>
                                    <Typography variant='h1'>
                                        {t('AnalyticsPage.sroi.sroiFlow.confirmation.title')}
                                    </Typography>
                                    <Typography variant="subtitle1">
                                        {t('AnalyticsPage.sroi.sroiFlow.confirmation.description')}
                                    </Typography>
                                </NiceOutliner>

                                <Grid container spacing={8}>
                                    <Grid container item spacing={2}>
                                        <Grid item xs={12}>
                                            <Field
                                                as={Checkbox}
                                                name="isSavedTemplate"
                                                id="isSavedTemplate"
                                                checked={formik.values.isSavedTemplate}
                                                onChange={formik.handleChange}
                                                required
                                            />
                                            <span>
                                                {t('AnalyticsPage.sroi.sroiFlow.confirmation.form.isSavedTemplate')}
                                            </span>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                name="templateName"
                                                id="templateName"
                                                fullWidth
                                                variant="outlined"
                                                label={t('AnalyticsPage.sroi.sroiFlow.confirmation.form.templateNameTitle')}
                                                size="small"
                                                type="text"
                                                value={formik.values.templateName}
                                                onChange={formik.handleChange}
                                                error={formik.touched.templateName && Boolean(formik.errors.templateName)}
                                                helperText={formik.touched.templateName && formik.errors.templateName}
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
                                            {t('AnalyticsPage.sroi.sroiFlow.confirmation.downloadReport')}
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
            </div>
        </EmptyCondition>
    )
}

export default ConfirmationView;
