import React from "react";
import packageJson from '../../../package.json';
import makeStyles from "@material-ui/core/styles/makeStyles";
import {API_ENV} from "../../services/appServices";

const useStyles = makeStyles(theme => ({
    root: {
        position: "absolute",
        bottom: 8,
        right: 16,
        fontSize: 8,
        color: theme.palette.info.dark
    }
}))

export const VersionTag: React.FC = () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <span>{packageJson['name']} v{packageJson['version']} {API_ENV}</span>
        </div>
    )
};

export default VersionTag;
