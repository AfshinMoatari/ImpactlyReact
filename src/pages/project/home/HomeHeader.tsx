import React from "react";
import {IconButton, Tooltip, Typography} from "@material-ui/core";
import history from "../../../history";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import {Skeleton} from "@material-ui/lab";
import {CustomTheme} from "../../../constants/theme";
import ColoredIconButton from "../../../components/buttons/ColoredIconButton";
import {Hidden} from "@material-ui/core";
import MenuLineIcon from "remixicon-react/MenuLineIcon";
import {useDrawer} from "./HomePage";

const useStyles = makeStyles<CustomTheme>((theme) => ({
    root: {
        padding: theme.spacing(3.5, 4),
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1, 2),
        },
    },
    avatarText: {
        display: 'flex',
        [theme.breakpoints.down('xs')]: {
            display: 'none'
        }
    }
}))

interface HomeHeaderProps {
    actions?: React.ReactNode;
    title: string | React.ReactNode;
    backRoute?: string;
    isLoading: boolean;
}

const HomeHeader: React.FC<HomeHeaderProps> =
    ({
         actions, 
         backRoute,
         title,
         isLoading
     }) => {
        const classes = useStyles();

        const {toggleDrawer} = useDrawer();
        const handleClickBack = () => {
            backRoute ? history.push(backRoute) : history.goBack();
        }

        return (
            <div className={classes.root}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    height: 52,
                    justifyContent: 'space-between'
                }}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        {isLoading && (
                            <>
                                <Skeleton variant='circle' width={35} height={35} style={{marginRight: 8}}/>
                                <Skeleton width={150} height={35}/>
                            </>
                        )}

                        {!isLoading && (
                            <>
                                <Typography variant="h2" style={{margin: 0}}>
                                    {title}
                                </Typography>
                            </>
                        )}
                    </div>

                        <Hidden mdUp implementation="css">
                            <ColoredIconButton
                                onClick={toggleDrawer}
                                flat={true}
                                inverse={true}
                                style={{width: 35, height: 35, padding: 8}}
                            >
                                <MenuLineIcon/>
                            </ColoredIconButton>
                        </Hidden>

                    {actions && actions}
                </div>
            </div>
        )
    }

export default HomeHeader;