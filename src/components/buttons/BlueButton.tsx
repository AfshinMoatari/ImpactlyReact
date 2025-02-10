import Button from "@material-ui/core/Button";
import React from "react";
import {ButtonProps} from "@material-ui/core/Button";
import {RemixiconReactIconComponentType} from "remixicon-react";
import Typography from "@material-ui/core/Typography";

const BlueButton: React.FC<ButtonProps> = ({style, ...props}) => {
    return (
        <Button
            color='primary'
            variant='contained'
            style={{
                boxShadow: '0 2px 3px rgba(0,0,0,.09)',
                width: "auto",
                paddingBottom: 10,
                whiteSpace: "nowrap",
                paddingTop: 10,
                borderRadius: 36,
                textTransform: "uppercase",
                ...style,
            }}
            {...props}
        />
    )
}

interface BlueIconButtonProps extends ButtonProps {
    icon: RemixiconReactIconComponentType;
    children?: string;
}

export const PrimaryIconButton: React.FC<BlueIconButtonProps> = ({children, icon, ...props}) => {
    const Icon = icon;

    return (
        <BlueButton {...props}>
            <Icon style={{paddingRight: children ? 8 : 0, borderRadius: '32px' }} size={children ? 17 : 20} />
            {children && <Typography noWrap={true}>{children}</Typography>}
        </BlueButton>
    )
}

export default BlueButton;
