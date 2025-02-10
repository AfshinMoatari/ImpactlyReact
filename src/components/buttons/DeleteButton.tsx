import React, { useState } from 'react';
import ConfirmDialog from "../dialogs/ConfirmDialog";
import Tooltip from "@material-ui/core/Tooltip";
import { useTheme, TextField } from "@material-ui/core";
import { RiCloseLine } from 'react-icons/ri';
import { IconButton } from '@mui/material';
import ActionButton from './ActionButton';

export interface DeleteButtonProps {
    title?: string;
    message?: string | string[] | undefined;
    onConfirm: () => void;
    size?: number;
    buttonText?: string;
    secure?: boolean;
    securityText?: string;
    dialogTitle?: string;
}
//need to find a way to add multiple messages
const DeleteButton: React.FC<DeleteButtonProps> = ({ title = "Slet", message, size = 24, onConfirm, buttonText, secure, securityText, dialogTitle }) => {
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [safeName, setSafeName] = useState("");
    const theme = useTheme();
    const handleClick = () => setShowDialog(true);
    const handleClose = () => setShowDialog(false);
    const handleConfirm = () => {
        setShowDialog(false);
        onConfirm && onConfirm();
    };
    const handleConfirmDisable = () => {
        const temp = securityText;
        if (!safeName || !temp) return true;
        return safeName.replace(' ', '') !== temp.replace(' ', '');
    }

    const renderMessageContent = () => {
        if (!message) return null;
        if (Array.isArray(message)) {
            return message.map((msg, index) => (
                <div key={index} style={{ marginBottom: "16px" }} dangerouslySetInnerHTML={{ __html: msg }} />
            ));
        } else {
            return <div style={{ marginBottom: "16px" }} dangerouslySetInnerHTML={{ __html: message }} />;
        }
    };

    return (
        <React.Fragment>
            <Tooltip title={title}>
                {!buttonText ?
                    <IconButton
                        color="inherit"
                        style={{ color: "#0A08128F" }}
                        onClick={handleClick}
                    >
                        <RiCloseLine size={size} />
                    </IconButton>
                    : <ActionButton onClick={handleClick} style={{
                        borderRadius: 52,
                        textTransform: "uppercase",
                        fontSize: 15,
                    }} variant="outlined">
                        {buttonText}
                    </ActionButton>
                }
            </Tooltip>
            {secure ?
                <ConfirmDialog
                    open={showDialog}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    disabled={handleConfirmDisable()}
                >
                    {renderMessageContent()}
                    <TextField
                        value={safeName}
                        onChange={e => setSafeName(e.target.value)}
                    />
                </ConfirmDialog>
                :
                <ConfirmDialog title={dialogTitle ? dialogTitle : title} open={showDialog} onClose={handleClose} onConfirm={handleConfirm}>
                    {message}
                </ConfirmDialog>
            }
        </React.Fragment>
    )
}

export default DeleteButton;
