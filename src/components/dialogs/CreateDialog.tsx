import React from 'react';
import Dialog, { DialogProps } from '@material-ui/core/Dialog/Dialog';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import RequestFeedbackDisplay from "../displays/FeedbackDisplay";
import Identifiable from "../../models/Identifyable";
import RequestFeedback from "../../models/rest/ResponseFeedback";
import { Formik, FormikProps } from "formik";
import { Backdrop, Box, CircularProgress, Typography } from "@material-ui/core";
import { FormikConfig, FormikHelpers } from "formik/dist/types";
import SubmitFreeForm from "../forms/SubmitFreeForm";
import { useTranslation } from "react-i18next";

export interface CreateDialogProps<T extends Partial<Identifiable>> extends FormikConfig<T> {
    title?: string;
    open: boolean;
    loading?: boolean;
    feedback?: RequestFeedback;
    onClose: () => void;
    hideBackdrop?: boolean;
    maxWidth?: DialogProps['maxWidth'];
    enableValidation?: boolean;
    children: (formik: FormikProps<T>) => React.ReactNode;
}

export const CreateDialog = <T,>({
    children, title, open, feedback, hideBackdrop = false,
    maxWidth = 'sm', onClose,
    initialValues, onSubmit, validationSchema,
    validateOnMount,
    enableReinitialize,
    enableValidation = false
}: CreateDialogProps<T>) => {
    const { t } = useTranslation();

    const handleSubmit = async (values: T, formikHelpers: FormikHelpers<T>) => {
        await onSubmit(values, formikHelpers);
        formikHelpers.resetForm();
        onClose();
    };

    return (
        <Formik<T>
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            initialValues={initialValues}
            validateOnMount={validateOnMount}
            enableReinitialize={enableReinitialize}
        >
            {(formik) => {
                const handleClose = () => {
                    onClose();
                    formik.resetForm();
                };
                return (
                    <SubmitFreeForm>
                        <Dialog
                            open={open}
                            onClose={handleClose}
                            maxWidth={maxWidth}
                            fullWidth={true}
                            hideBackdrop={hideBackdrop}
                        >
                            <Backdrop style={{ zIndex: 10, color: 'white' }} open={Boolean(formik?.isSubmitting)}>
                                <CircularProgress color="inherit" />
                            </Backdrop>

                            {title && <Typography variant="h2" style={{ padding: "8px 16px" }}>{title}</Typography>}

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <div style={{ width: 'calc(100% - 32px)' }}>
                                    {children(formik)}
                                    <RequestFeedbackDisplay feedback={feedback} />
                                </div>
                            </div>

                            <DialogActions
                                style={{
                                    background: Boolean(formik?.isValid) ? '#FDF7EC' : '',
                                    marginTop: 8,
                                    padding: '4px 8px'
                                }}>

                                <Box flex={1} />

                                <Button
                                    size="large"
                                    onClick={handleClose}
                                    style={{ fontWeight: 600, color: '#5f6368' }}
                                >
                                    {t("RegisterDialog.cancel")}
                                </Button>

                                <Button
                                    size="large"
                                    type="submit"
                                    aria-label="submit"
                                    onClick={formik?.submitForm}
                                    disabled={enableValidation ? false : (formik === undefined ? false : !formik?.isValid)}
                                    color={"primary"}
                                    style={{ fontWeight: 600 }}
                                >
                                    {t("RegisterDialog.save")}
                                </Button>

                            </DialogActions>
                        </Dialog>
                    </SubmitFreeForm>
                );
            }}
        </Formik>
    );
};

export default CreateDialog;
