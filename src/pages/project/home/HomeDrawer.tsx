import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Hidden} from "@material-ui/core";
import DrawerButton from "./DrawerButton";
import {CustomTheme} from "../../../constants/theme";
import ProjectButton from "./ProjectButton";
import {getNavigationList} from "../../../constants/NavigationList";
import MeButton from "./MeButton";
import Routes from "../../../constants/Routes";
import {useAuth} from "../../../providers/authProvider";
import Permissions, {checkPermission} from "../../../constants/Permissions";
import {useLocation} from "react-router-dom";
import Settings5LineIcon from "remixicon-react/Settings5LineIcon";
import NiceDivider from "../../../components/visual/NiceDivider";
import {useProjectCrudListQuery} from "../../../hooks/useProjectQuery";
import Notification2LineIcon from "remixicon-react/Notification2LineIcon";
import UserSettingsLineIcon from "remixicon-react/UserSettingsLineIcon";
import { useTranslation, Trans } from 'react-i18next';

const useStyles = makeStyles<CustomTheme>((theme) => ({
    drawer: {
        width: theme.custom.drawerWidth,
        flexShrink: 0,
        [theme.breakpoints.down("sm")]: {
            display: 'none',
        },
    },
    drawerPaper: {
        color: '#FDF7EC',
        width: theme.custom.drawerWidth,
        boxShadow: 'none',
        border: 'none',
        backgroundColor: theme.palette.secondary.main,
        overflowX: 'hidden'
    },
    drawerTop: {
        padding: theme.spacing(0, 2),
        height: theme.custom.appBarHeight
    },
    avatarText: {
        display: 'flex',
        [theme.breakpoints.down('xs')]: {
            display: 'none'
        }
    }
}));

interface DashboardDrawerProps {
    mobileOpen: boolean;
    onMobileToggle: () => void;
}

export const HomeDrawer: React.FC<DashboardDrawerProps> = ({mobileOpen, onMobileToggle}) => {
    const addDays = (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    const notificationsQuery = useProjectCrudListQuery(services => services.projectNotifications);
    const notifications = notificationsQuery.elements;
    let notificationsAmount: number = 0;
    for (let i = 0; i < notifications.length; i++) {
        if(addDays(notifications[i].sendOutDate as Date, 2) < new Date()) notificationsAmount++;
    }
    const classes = useStyles();
    const auth = useAuth();

    const location = useLocation();
    const settingsPermission = checkPermission(Permissions.settingsRead, auth);
    const { t } = useTranslation();
    const navigationList = getNavigationList(t)


    const content = (
        <Box display="flex" flexDirection="column" flexGrow={1}>
            <ProjectButton/>
            <NiceDivider style={{backgroundColor: '#503E8E', marginLeft:-16, marginBottom: 12, width: '116%', height: 1}} className={classes.drawerPaper}/>
            {navigationList.map((item) => {
                if ((item.permission === undefined || checkPermission(item.permission, auth)) && item.path !== Routes.notifications) return (
                    <DrawerButton
                        iconColor="#FDF7EC"
                        textColor="#FDF7EC"
                        key={item.path}
                        item={item}
                        pathname={location.pathname}
                        onToggle={onMobileToggle}
                    />
                )
                return null;
            })}
            <Box flex={1}/>
            <DrawerButton
                iconColor="#FDF7EC"
                textColor="#FDF7EC"
                pathname={location.pathname}
                item={{
                    icon: Notification2LineIcon,
                    name: (
                        <>
                            <Trans i18nKey='navigationMain.Activities'></Trans>
                        </>
                    ),
                    path: Routes.notifications,
                    showRedDot: notificationsAmount !== 0,
                    notificationAmount: notificationsAmount,
                }}
            />

            {settingsPermission && (
                <DrawerButton
                    iconColor="#FDF7EC"
                    textColor="#FDF7EC"
                    pathname={location.pathname}
                    item={{
                        icon: Settings5LineIcon,
                        name: <Trans i18nKey='navigationMain.Project'></Trans>,
                        path: Routes.projectSettings
                    }}
                />

            )}

            <DrawerButton
                iconColor="#FDF7EC"
                textColor="#FDF7EC"
                pathname={location.pathname}
                item={{
                    name: <Trans i18nKey='navigationMain.Profile'></Trans>,
                    icon: UserSettingsLineIcon,
                    path: Routes.me,
                }}
            />

            <NiceDivider style={{backgroundColor: '#503E8E', marginLeft:-16, marginTop: 12, width: '116%', height: 1}}/>
            <MeButton/>

            <div style={{height: 8}}/>
        </Box>
    )

    return (
        <nav className={classes.drawer} aria-label="navigation">
            <Hidden smUp implementation="css">
                <Drawer
                    container={window === undefined ? undefined : () => window.document.body}
                    variant="temporary"
                    anchor="left"
                    open={mobileOpen}
                    onClose={onMobileToggle}
                    classes={{paper: classes.drawerPaper}}
                    ModalProps={{keepMounted: true}}
                >
                    {content}
                </Drawer>
            </Hidden>
            <Hidden smDown implementation="css">
                <Drawer
                    classes={{paper: classes.drawerPaper}}
                    variant="permanent"
                    open
                >
                    {content}
                </Drawer>
            </Hidden>
        </nav>
    )
}

export default HomeDrawer;



