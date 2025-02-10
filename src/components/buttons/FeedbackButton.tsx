import React, {CSSProperties, useState} from "react";
import ActionButton from "./ActionButton";
import RestResponse from "../../models/rest/RestResponse";
import CircularProgress from "@material-ui/core/CircularProgress";
import snackbarProvider from "../../providers/snackbarProvider";
import {ButtonProps} from "@material-ui/core/Button";
import ColoredIconButton from "./ColoredIconButton";

interface FeedbackButtonProps<T = unknown> extends ButtonProps {
    icon: any;
    onClick: (e: React.MouseEvent) => RestResponse<T> | undefined;
    style?: CSSProperties;
    success?: string;
    children?: React.ReactChild;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({onClick, success = "Handlingen er successful", icon, children, ...props}) => {
    const [loading, setLoading] = useState(false);
    const Icon = icon;

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);
        const res = await onClick(e);

        if (!res) return;

        if (res.success) snackbarProvider.success(success)
        else snackbarProvider.showFeedback(res.feedback);

        setLoading(false);

    }

    if (children === undefined || children === null) return (
        <ColoredIconButton
            onClick={handleClick}
            flat={true}
            inverse={true}
            style={{width: 35, height: 35, padding: 8}}
        >
            {loading ? <CircularProgress color="inherit" style={{width: 17, height: 17}}/> : <Icon size={17}/>}
        </ColoredIconButton>
    )

    return (
        <ActionButton
            endIcon={loading ? <CircularProgress color="inherit" style={{width: 17, height: 17}}/> : <Icon size={17}/>}
            onClick={handleClick}
            {...props}
        >
            {children}
        </ActionButton>
    )
}

export default FeedbackButton;
