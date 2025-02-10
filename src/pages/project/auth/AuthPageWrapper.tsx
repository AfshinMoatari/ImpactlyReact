import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Box, Grid, Hidden} from "@material-ui/core";
import VersionTag from "../../../components/displays/VersionTag";
import Logo from "../../../components/containers/Logo";
import BG from '../../../assets/auth_bg.png'

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    gradient: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, rgba(28,22,55,1) 0%, rgba(28,22,55,0.5) 100%), url(${BG})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
    },
    content: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    form: {
        padding: theme.spacing(0, 30),
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(0, 2),
        },
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
    }
}));

const AuthPageWrapper: React.FC = ({children}) => {
    const classes = useStyles();

    return (
        <Grid container className={classes.root}>
            <Grid item xs={false} sm={false} md={6} lg={6} className={classes.gradient}>
                <Hidden smDown implementation='css'>
                    <Logo/>
                </Hidden>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <div className={classes.content}>
                    <Box
                        width='100%'
                        height='100%'
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        style={{position: 'relative'}}
                    >
                        <div className={classes.form}>
                            {children}
                        </div>
                        <VersionTag/>
                    </Box>
                </div>
            </Grid>
        </Grid>
    );
}


export default AuthPageWrapper;

