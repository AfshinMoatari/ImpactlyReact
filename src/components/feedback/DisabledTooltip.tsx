import React from "react";
import {Tooltip} from "@material-ui/core";

interface DisabledTooltipProps {
    title: NonNullable<React.ReactNode>;
    disabled: boolean;
    children: React.ReactElement;
}

const DisabledTooltip: React.FC<DisabledTooltipProps> = ({title, disabled, children}) => {
    if (disabled) return (
        <Tooltip title={title}>
            <div style={{ display: "initial" }}>
                {React.cloneElement(children, { disabled })}
            </div>
        </Tooltip>
    )

    return (
        <div style={{ display: "initial" }}>
            {children}
        </div>
    )
}

export default DisabledTooltip;