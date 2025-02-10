import React from 'react';
import { enUS } from 'date-fns/locale';
import { ThemeProvider } from '@material-ui/core';
import theme, { CustomTheme } from "./constants/theme";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import dkLocale from "date-fns/locale/da";
import { AppQueryProvider } from "./providers/appQueryProvider";
import { Router } from "react-router-dom";
import history from "./history";
import AppSwitch from "./AppSwitch";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import withTokenExpiration from "./AppSwitchWithTokenExpiration";
import { LanguageProvider } from './LanguageContext';
import { useLanguage } from "./LanguageContext";

const AppSwitchWithTokenExpiration = withTokenExpiration(AppSwitch);

function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
}

function AppContent() {
    const { language } = useLanguage();

    let selectedLocale;
    switch (language) {
        case 'da':
            selectedLocale = dkLocale;
            break;
        case 'en':
            selectedLocale = enUS;
            break;
    }

    return (
        <Router history={history}>
            <ThemeProvider<CustomTheme> theme={theme}>
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={selectedLocale}>
                    <AppQueryProvider>
                        <AppSwitchWithTokenExpiration />
                    </AppQueryProvider>
                </MuiPickersUtilsProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
