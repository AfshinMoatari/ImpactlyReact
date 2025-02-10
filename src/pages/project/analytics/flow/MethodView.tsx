import React, { useRef, useState } from "react";
import { EmptyCondition } from "../../../../components/containers/EmptyCondition";
import { useTranslation } from "react-i18next";
import { Box, Button, FormHelperText, Grid, IconButton, Link, makeStyles, Typography } from "@material-ui/core";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import { Formik, Form, FormikProps, FormikHelpers } from "formik";
import NiceOutliner from "../../../../components/containers/NiceOutliner";
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import NiceDivider from "../../../../components/visual/NiceDivider";
import * as Yup from 'yup';
import { Method } from "../../../../models/SROIFlow";
import useSROIContext from "./SROIFlowProvider";
import ReactQuill from "react-quill";
import ActionButton from "../../../../components/buttons/ActionButton";

const MethodView: React.FC<{ handleBack: () => void; handleNext: () => void; handleClose: () => void }> = ({ handleBack, handleNext, handleClose }) => {
    const { t } = useTranslation();
    const formikRef = useRef<FormikProps<Method>>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { state, onChange } = useSROIContext();

    const useStyles = makeStyles((theme: Theme) => ({
        root: {
            width: "100%",
            borderRadius: 0,
            '& > div:first-child': {
                background: "none",
                padding: '16px 0',
                border: '0',
                borderRadius: 0,
                '& > span#label:first-child': {
                    fontWeight: 'bold'
                }
            }
        },
        inputAdornment: {
            [theme.breakpoints.down('md')]: {
                display: 'none',
            },
        },
    }));
    const classes = useStyles();
    const validationSchema = Yup.object().shape({

    });
    const handleSave = async (values: Method, { resetForm }: FormikHelpers<Method>) => {
        setIsLoading(true);
        setTimeout(() => {
            handleNext();
            onChange({
                ...state,
                method: values,
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
                    <Formik
                        initialValues={state.method}
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
                                        {t('AnalyticsPage.sroi.sroiFlow.method.title')}
                                    </Typography>
                                    <Typography variant="subtitle1">
                                        {t('AnalyticsPage.sroi.sroiFlow.method.description')}
                                    </Typography>
                                    <ul>
                                        <li>{t('AnalyticsPage.sroi.sroiFlow.method.list.0')}</li>
                                        <li>{t('AnalyticsPage.sroi.sroiFlow.method.list.1')}</li>
                                        <li>{t('AnalyticsPage.sroi.sroiFlow.method.list.2')}</li>
                                        <li>{t('AnalyticsPage.sroi.sroiFlow.method.list.3')}</li>
                                        <li>{t('AnalyticsPage.sroi.sroiFlow.method.list.4')}</li>
                                    </ul>
                                    <Typography variant="caption">
                                        {t('AnalyticsPage.sroi.sroiFlow.method.limit')}
                                    </Typography>
                                </NiceOutliner>

                                <Grid container spacing={8}>
                                    <Grid item container spacing={2}>
                                        <div style={{ width: '100%' }}>
                                            <ReactQuill
                                                value={formik.values.description}
                                                theme="snow"
                                                onChange={(e) => formik.setFieldValue("description", e)}
                                                style={{ width: '100%' }}
                                                modules={{
                                                    toolbar: [
                                                        ['bold', 'italic', 'underline'],
                                                        [
                                                            { 'align': '' },
                                                            { 'align': 'center' },
                                                            { 'align': 'right' },
                                                            { 'align': 'justify' }
                                                        ],
                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    ]
                                                }}
                                            />
                                        </div>
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
            </div>
        </EmptyCondition>
    );
};

export default MethodView;
