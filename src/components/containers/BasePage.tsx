import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {CustomTheme} from "../../constants/theme";
import clsx from 'clsx';

const useStyles = makeStyles<CustomTheme>((theme) => ({
    root: {
        flex: 1,
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: "column",
        justifyContent: 'flex-start',
        alignItems: "center",
        position: 'relative',
        padding: theme.spacing(0, 4, 2, 4),
        [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(0, 2, 2, 2),
        }
    }
}))

interface BasePageProps {
    className?: string;
}

const BasePage: React.FC<BasePageProps> =
    ({
         children,
         className,
     }) => {
        const classes = useStyles();

        return (
            <div className={clsx(classes.root, className)}>
                {children}
            </div>
        );
    }

export default BasePage;

