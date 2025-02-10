import React from 'react';
import {Box, Button, Dialog, DialogActions, DialogContent, Typography} from '@material-ui/core';
import {DialogProps} from "@material-ui/core/Dialog/Dialog";
import { useTranslation } from 'react-i18next';

export interface ConfirmDialogProps {
    title?: string;
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    dialogProps?: Omit<DialogProps, "open" | "onClose">;
    disabled?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({title, open, onClose, dialogProps, children, disabled, onConfirm}) => {
    const { t } = useTranslation();
    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={onClose}
            {...dialogProps}
        >
            <Typography variant="h2" style={{padding: "8px 16px"}}>{title}</Typography>
            <DialogContent>
                <Box p={1}>
                    {children}
                </Box>
            </DialogContent>
            <DialogActions
                style={{
                    background: '#FDF7EC',
                    marginTop: 8,
                    padding: '4px 8px'
                }}
            >
                <Button size="large" onClick={onClose}
                        style={{fontWeight: 600, color: '#5f6368'}}>
                    {t('ConfirmDialog.no')}
                </Button>
                <Button
                    size="large"
                    type='submit'
                    aria-label="submit"
                    onClick={onConfirm}
                    color={"primary"}
                    style={{fontWeight: 600}}
                    disabled={disabled}
                >
                    {t('ConfirmDialog.yes')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmDialog;