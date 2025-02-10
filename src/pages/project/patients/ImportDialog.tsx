import React from 'react';
import Dialog, {DialogProps} from '@material-ui/core/Dialog/Dialog';
import BulkImport from "./BulkImport";
import {Typography} from "@material-ui/core";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import IconButton from "@material-ui/core/IconButton";
import {useProjectBulkActionQuery} from "../../../hooks/useProjectQuery";
import ProjectPatient from "../../../models/ProjectPatient";
import {useTranslation} from "react-i18next";

interface ImportDialogProps extends DialogProps {
    onClose: () => void;
    refetch: () => void;
}

export const ImportDialog = ({ open, onClose, refetch}: ImportDialogProps) => {
    const bulkPatientsQuery = useProjectBulkActionQuery<ProjectPatient>(services => services.projectBulkUploadCitizens);
    const {t} = useTranslation();

    const handleBulkImportClick = async (result: any) => {
        await bulkPatientsQuery.createBulk(result);
        await new Promise((resolve) => setTimeout(resolve, 2500))
        refetch();
        onClose();
    };

    const handleOnCancel = () => {
        onClose(); // To close the BaseDialog after a cancel click
    };

    const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => onClose && onClose();

    return (
        <Dialog open={open} onClose={onClose} fullWidth={true}>
            <Typography variant="h2" style={{
                padding: "8px 16px",
                fontWeight: 400,
                fontSize: 24,
                lineHeight: "150%",
            }}>
                {t("ImportDialog.title")}
            </Typography>
            <IconButton onClick={handleClose} style={{position: "absolute", right: 8, top: 8}}>
                <CloseLineIcon/>
            </IconButton>
            <div style={{ borderBottom: "1px solid rgba(10, 8, 18, 0.12)"}} />
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 15
            }}>
                {t("ImportDialog.message")}
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'right',
                padding: 13
            }}>
                <BulkImport
                    onBulkImportClick={handleBulkImportClick}
                    onCancelClick={handleOnCancel}
                />
            </div>
        </Dialog>
    );
};
