import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import LogoWhiteIcon from "../../assets/Logo_Impactly_OrangeWhite.png";
import {Theme} from "@material-ui/core";


// TODO get logo color
const useStyles = makeStyles<Theme>(() => ({
    img: {
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url("${LogoWhiteIcon}")`,
        backgroundSize: 'contain',
    }
}));

interface LogoProps {
    width?: number;
    height?: number;
}

const Logo: React.FC<LogoProps> = ({width = 250, height = 200}) => {
    const classes = useStyles();
    return (
        <div style={{width, height}} className={classes.img}/>
    )
}

export default Logo;