import {Dialog, DialogTitle, DialogTitleProps} from "@material-ui/core";
import {DialogProps} from "@material-ui/core/Dialog/Dialog";
import React, {CSSProperties, ReactNode} from "react";
import IconButton from "@material-ui/core/IconButton";
import CloseLineIcon from "remixicon-react/CloseLineIcon";

interface BaseDialogProps extends Omit<DialogProps, "title"> {
    title: ReactNode;
    description?: ReactNode;
    TitleProps?: DialogTitleProps;
    style?: CSSProperties
}

const BaseDialog: React.FC<BaseDialogProps> = ({TitleProps, title, description, children, style, ...props}) => {
    const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => props.onClose && props.onClose(e, "backdropClick");
    return (
        <Dialog {...props} >
            <DialogTitle style={style}>
                {title}
                <IconButton onClick={handleClose} style={{position: "absolute", right: 8, top: 8}}>
                    <CloseLineIcon/>
                </IconButton>
                {description && <p
                    style={{
                        margin: 0,
                        marginTop: 0,
                        fontSize: 14,
                        fontWeight: 400,
                        color: 'rgba(10, 8, 18, 0.6)'
                    }}>{description}</p>}
            </DialogTitle>
            {children}
        </Dialog>
    )
}

export default BaseDialog;
