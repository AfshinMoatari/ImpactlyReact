import React, {useEffect, useState} from 'react';
import Dialog, {DialogProps} from '@material-ui/core/Dialog/Dialog';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import RequestFeedbackDisplay from "../displays/FeedbackDisplay";
import Identifiable from "../../models/Identifyable";
import RequestFeedback from "../../models/rest/ResponseFeedback";
import {Form, Formik, FormikProps} from "formik";
import {Backdrop, Box, CircularProgress, TextField, Typography, useTheme} from "@material-ui/core";
import {FormikConfig, FormikHelpers} from "formik/dist/types";
import ConfirmDialog from "./ConfirmDialog";
import CreateButton from '../buttons/CreateButton';
import OutlinedButton from '../buttons/OutlinedButton';
import {useTranslation} from "react-i18next";

export interface CrudDialogProps<T extends Partial<Identifiable>> extends Omit<FormikConfig<T>, "initialValues"> {
    title?: string;
    element: T | undefined;
    loading?: boolean;
    feedback?: RequestFeedback;
    onCancel: () => void;
    onCopyClick?: (element: T) => void;
    onDelete?: (id: string) => void;
    hideBackdrop?: boolean;
    maxWidth?: DialogProps['maxWidth'];
    children: (formik: FormikProps<T>) => React.ReactNode;
    initialValues?: T;
    safe?: true;
}

export const CrudDialog = <T extends Partial<Identifiable> | Identifiable, >
({
     children, title, element, feedback, hideBackdrop = false,
     maxWidth = 'sm', onCancel, onDelete, onCopyClick, safe,
     ...formikProps
 }: CrudDialogProps<T>) => {

    const [titleState, setTitleState] = useState(title);
    const [safeName, setSafeName] = useState("");
    const {t} = useTranslation();

    useEffect(() => {
        if (!element) return;
        setTitleState(title);
        return () => setSafeName("")
    }, [element, title]);

    const theme = useTheme();
    const [openDelete, setOpenDelete] = useState<boolean>(false);

    const handleSubmit = async (values: T, formikHelpers: FormikHelpers<T>) => {
        const res = await formikProps.onSubmit(values, formikHelpers);
        if (res?.success !== undefined) {
            if (!res.success) return;
        }
        onCancel();
    }

    const handleClickCloseDelete = () => {
        setOpenDelete(false);
    }
    const handleClickOpen = () => setOpenDelete(true);

    const handleClickAcceptDelete = () => {
        if (onDelete && element?.id) {
            onDelete(element.id);
        }
        setOpenDelete(false);
        onCancel();
    };

    const handleConfirmDisable = () => {
        if (!safe) return false;
        const temp = (element as T & { name: string })?.name;
        if (!safeName || !temp) return true;
        return safeName.replace(' ', '') !== temp.replace(' ', '');
    }

    const handleEnterSubmit = (formik: FormikProps<T>) => async (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (!formik.isValid) return;
        if (e.key === "Enter") {
            await handleSubmit(formik.values, formik);
            e.preventDefault();
            e.stopPropagation();
        }
    }

    return (
        <Formik<T>
            {...formikProps}
            onSubmit={handleSubmit}
            initialValues={element ?? {} as T}
            enableReinitialize
        >
            {(formik) => (
                <Form onKeyPress={handleEnterSubmit(formik)}>
                    <Dialog
                        open={Boolean(element)}
                        onClose={onCancel}
                        maxWidth={maxWidth}
                        fullWidth={true}
                        hideBackdrop={hideBackdrop}
                    >
                        <Backdrop style={{zIndex: 10, color: 'white'}} open={Boolean(formik?.isSubmitting)}>
                            <CircularProgress color="inherit"/>
                        </Backdrop>

                        {title &&
                            <Typography variant="h2" style={{padding: "20px 16px"}}>{titleState}</Typography>
                        }

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <div style={{width: 'calc(100% - 32px)'}}>
                                {children(formik)}
                                <RequestFeedbackDisplay feedback={feedback}/>
                            </div>
                        </div>

                        <DialogActions
                            style={{
                                background: Boolean(formik?.isValid) ? '#FDF7EC' : '',
                                margin: 8,
                                marginTop: 14,
                                padding: '4px 8px'
                            }}>

                            {element?.id && Boolean(onDelete) && (
                                <Button
                                    onClick={handleClickOpen}
                                    style={{
                                        fontWeight: 600,
                                        color: theme.palette.error.main
                                    }}
                                >
                                    {t('CrudDialog.delete')}
                                </Button>
                            )}

                            <Box flex={1}/>

                            <OutlinedButton
                                text='Annuller'
                                onClick={onCancel}
                                style={{fontWeight: 600, color: '#5f6368'}}
                            >
                                {t('CrudDialog.cancel')}
                            </OutlinedButton>
                            <CreateButton
                                text='Udfør'
                                aria-label="submit"
                                onClick={formik?.submitForm}
                                disabled={formik !== undefined ? !formik?.isValid : false}
                                style={{fontWeight: 600}}
                            >
                                {t('CrudDialog.execute')}
                            </CreateButton>
                        </DialogActions>
                    </Dialog>
                    <ConfirmDialog
                        open={openDelete}
                        onClose={handleClickCloseDelete}
                        onConfirm={handleClickAcceptDelete}
                        disabled={handleConfirmDisable()}
                    >
                        <>
                            <div>
                                {t('CrudDialog.areYouSure')}
                            </div>
                            {safe && (
                                <>
                                    <div style={{marginTop: 16, marginBottom: 16}}>
                                        {t('CrudDialog.criticalAction')}
                                    </div>
                                    <div>
                                        {t('CrudDialog.enterElementName')}
                                    </div>
                                    <TextField
                                        value={safeName}
                                        onChange={e => setSafeName(e.target.value)}
                                    />
                                </>
                            )}
                        </>
                    </ConfirmDialog>
                </Form>
            )}
        </Formik>
    );
};

export default CrudDialog;
