import {Button} from "@mui/material";
import { darken, styled } from '@mui/material/styles';
import React from "react";
import {ButtonProps} from "@mui/material/Button";
import {RemixiconReactIconComponentType} from "remixicon-react";
import Typography from "@material-ui/core/Typography";

const ColorButton = styled(Button)<ButtonProps>(({ theme }) => ({
    '&:hover': {
      backgroundColor: `rgba(237, 76, 47,0.5) !important`,
    },
  }));

const ButtonLine: React.FC<ButtonProps> = ({style, ...props}) => {
    return (
        <ColorButton
            color='primary'
            variant="outlined"
            style={{
                boxShadow: '0 2px 3px rgba(0,0,0,.09)',
                width: "auto",
                paddingBottom: 10,
                whiteSpace: "nowrap",
                paddingTop: 10,
                borderRadius: 36,
                textTransform: "uppercase",
                border: "1px solid rgb(237, 76, 47)",
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
        <ButtonLine {...props}>
            <Icon style={{paddingRight: children ? 8 : 0, borderRadius: '32px' }} size={children ? 17 : 20} />
            {children && <Typography noWrap={true}>{children}</Typography>}
        </ButtonLine>
    )
}

export default ButtonLine;
