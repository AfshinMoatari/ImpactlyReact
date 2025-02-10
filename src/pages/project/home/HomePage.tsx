import React, {createContext, useContext} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {useMediaQuery} from "@material-ui/core";
import useTheme from "@material-ui/core/styles/useTheme";
import DashboardSwitch from "../DashboardSwitch";
import HomeDrawer from "./HomeDrawer";
import {CustomTheme} from "../../../constants/theme";

const useStyles = makeStyles<CustomTheme>((theme) => {
    return ({
        root: {
            display: "flex"
        },
        content: {
            minHeight: '100vh',
            maxWidth: `calc(100% - ${theme.custom.drawerWidth}px)`,
            flex: 1,
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
    });
})

interface DrawerType {
    toggleDrawer: () => void;
}

export const DrawerContext = createContext<DrawerType | null>(null);

export const HomePage = () => {
    const classes = useStyles();

    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down("sm"))
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        if (mobile) setMobileOpen(!mobileOpen);
    }

    return (
        <div className={classes.root}>
            <HomeDrawer mobileOpen={mobileOpen} onMobileToggle={handleDrawerToggle}/>
            <DrawerContext.Provider value={{toggleDrawer: handleDrawerToggle}}>
                <DashboardSwitch/>
            </DrawerContext.Provider>
        </div>
    )
}

export const useDrawer = (): DrawerType => {
    const drawerQuery = useContext(DrawerContext);

    if (!drawerQuery) {
        throw new Error('useDrawer must be used within DrawerContext');
    }

    return drawerQuery;
};


export default HomePage;