import React from "react";
import {makeStyles} from "@material-ui/core";
import {CustomTheme} from "../../constants/theme";

const useStyles = makeStyles<CustomTheme, { color: "primary" | "secondary" }>((theme) => ({
    outer: {
        backgroundColor: ({color}) => theme.palette[color].main,
        borderColor: ({color}) => theme.palette[color].main,
        color: theme.palette.common.white,
        fontFamily: "Inter",
        minWidth: 148,
        width: "100%",
        height: "100%",
        borderRadius: 8,
    },
    inner: {
        width: "100%",
        height: "100%",
    }
}))

interface ColorCardProps {
    color?:"primary" | "secondary"
}

const ColorCard: React.FC<ColorCardProps> = ({ color = "primary", children }) => {
    const classes = useStyles({color})

    return (
        <div className={classes.outer} >
            <div className={classes.inner}>
                {children}
            </div>
        </div>
    )
}

export default ColorCard;