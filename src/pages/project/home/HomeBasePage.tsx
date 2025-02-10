import React, {useEffect, useState} from "react";
import BasePage from "../../../components/containers/BasePage";
import {makeStyles} from "@material-ui/core";
import {CustomTheme} from "../../../constants/theme";
import HomeHeader from "./HomeHeader";
import {useLocation} from "react-router-dom";
import {getNavigationList} from "../../../constants/NavigationList";
import {useTranslation} from "react-i18next";

const useStyles = makeStyles<CustomTheme>((theme) => ({
    content: {
        minHeight: '100vh',
        maxWidth: `calc(100% - ${theme.custom.drawerWidth}px)`,
        flex: 1,
        backgroundColor: "#FDF7EC",
        display: 'flex',
        justifyContent: 'center',
        flexDirection: "column",
        [theme.breakpoints.down('sm')]: {
            maxWidth: '100%',
        },
    },
    switch: {
        flex: 1,
        position: 'relative',
        display: 'flex'
    }
}))

interface HomeBasePageProps {
    title?: string | React.ReactNode;
    actions?: React.ReactNode;
    backRoute?: string;
    loading?: boolean;
}

const HomeBasePage: React.FC<HomeBasePageProps> =
    ({
         children,
         title,
         actions,
         backRoute,
         loading = false,
     }) => {
        const classes = useStyles();
        const location = useLocation();
        const [headerTitle, setHeaderTitle] = useState<string | React.ReactNode>();
        const { t } = useTranslation();
        const navigationList = getNavigationList(t)

        const nav = navigationList.find(nav => location.pathname.includes(nav.path));

        useEffect(() => {
            setHeaderTitle(title ?? nav?.name)
            return () => {
                setHeaderTitle(nav?.name)
            }
        }, [title, nav?.name])

        return (
            <div className={classes.content}>
                <HomeHeader
                    title={headerTitle}
                    isLoading={loading}
                    actions={!loading && actions}
                    backRoute={backRoute}
                />
                <div className={classes.switch}>
                    <BasePage>
                        {children}
                    </BasePage>
                </div>
            </div>

        )
    }

export default HomeBasePage;
