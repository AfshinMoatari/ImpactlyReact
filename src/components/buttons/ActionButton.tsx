import {Button} from "@material-ui/core";
import React from "react";
import {ButtonProps} from "@material-ui/core/Button";

const ActionButton: React.FC<ButtonProps> = ({children, style, ...props}) => {
    return (
        <Button
            color='primary'
            variant='contained'
            style={{
                minWidth: '104px',
                height: '40px',
                boxShadow: '0 2px 3px rgba(0,0,0,.09)',
                paddingBottom: 10,
                paddingTop: 10,
                borderRadius: 8,
                fontSize: '0.9285714285714286rem',
                fontWeight: 400,
                textAnchor: "start",
                ...style,
            }}
            {...props}
        >
            {children}
        </Button>
    )
}

export default ActionButton;
