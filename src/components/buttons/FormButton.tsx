import React from 'react';
import {makeStyles} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';
import ActionButton from "./ActionButton";

const useStyles = makeStyles((theme) => ({
    buttonContainer: {
        position: 'relative',
    },
    buttonProgress: {
        color: 'white',
        position: 'absolute',
        display: 'flex',
        margin: 'auto',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
}));

interface FormButtonProps {
    text?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    endIcon?: React.ReactNode;
}

export const FormButton: React.FC<FormButtonProps> =
    ({
         children,
         text,
         disabled = false,
         loading = false,
         fullWidth = true,
         onClick,
         endIcon
     }) => {
        const classes = useStyles();
        return (
            <div className={classes.buttonContainer}>
                <ActionButton
                    style={{borderRadius: '32px', whiteSpace: "nowrap", width: "auto"}}
                    endIcon={endIcon}
                    fullWidth={fullWidth}
                    variant="contained"
                    aria-label="submit"
                    type="submit"
                    disabled={disabled || loading}
                    onClick={onClick}
                >
                    {text ?? children}
                </ActionButton>
                {loading && <CircularProgress size={24} className={classes.buttonProgress}/>}
            </div>
        );
    };

export default FormButton;
