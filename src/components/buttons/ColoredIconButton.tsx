import React from "react";
import clsx from "clsx";
import {alpha, IconButton} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {IconButtonProps} from "@material-ui/core/IconButton";
import customTheme from "../../constants/theme"
const useStyles = makeStyles((theme) => ({
    main: {
        background: customTheme.custom.CallToActionIconBG,
        boxShadow: '0 4px 6px ' + alpha(theme.palette.primary.main, 0.25),
        transition: theme.transitions.create(['background-color', 'box-shadow']),
        color: customTheme.custom.CallToActionIconText,
        "&:hover": {
            background: alpha(theme.palette.primary.main, 0.8),
            boxShadow: '0 6px 8px ' + alpha(theme.palette.primary.main, 0.3),
        }
    },
    inverse: {
        background: customTheme.custom.CallToActionIconBG,
        boxShadow: '0 4px 6px ' + alpha(theme.palette.primary.contrastText, 0.25),
        transition: theme.transitions.create(['background-color', 'box-shadow']),
        color: customTheme.custom.CallToActionIconText,
        "&:hover": {
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            boxShadow: '0 6px 8px ' + alpha(theme.palette.primary.contrastText, 0.3)
        }
    },
    flat: {
        boxShadow: "0 0 0 #0000",
        "&:hover": {
            boxShadow: "0 0 0 #0000",
        }
    }
}));

interface ColoredProps {
    inverse?: boolean;
    flat?: true;
}

export type ColoredIconButtonProps = ColoredProps & IconButtonProps;

const ColoredIconButton: React.FC<ColoredIconButtonProps> = ({ inverse = false, flat = false, className: classNameProp, ...props }) => {
    const classes = useStyles();
    const className = clsx([inverse ? classes.inverse : classes.main, flat ? classes.flat : undefined, classNameProp].filter(s => s));
    return (
        <IconButton className={className} {...props} />
    )
}

export default ColoredIconButton;