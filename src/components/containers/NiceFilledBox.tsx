import React from "react";
import {Box, BoxProps, makeStyles, PropTypes} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles";


const useStyles = makeStyles<Theme, {color?: PropTypes.Color}>((theme) => ({
    box: {
        background: '#F6F8FA',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        color: ({color}) =>
            color === "primary" ? theme.palette.primary.main
            : color === "secondary" ? theme.palette.secondary.main
                : undefined
    }
}))

interface NiceFilledBoxProps extends BoxProps { color?: PropTypes.Color };
const NiceFilledBox: React.FC<NiceFilledBoxProps> = ({color, ...props}) => {
    const classes = useStyles({color});

    return (
        <Box className={classes.box} color="primary" {...props}/>
    )
}

export default NiceFilledBox;
