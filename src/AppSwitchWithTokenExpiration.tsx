import React, { useEffect, useState } from "react";
import { useAuth } from "./providers/authProvider";
import { client } from "./services/appServices";
import SnackbarProvider from "./providers/snackbarProvider";
import ConfirmDialog from "./components/dialogs/ConfirmDialog";
import AppSwitch from "./AppSwitch";
import { useTranslation } from "react-i18next";
import { mapLanguageCode } from "./utils/languageHelper";
import i18n from "./i18n";


function withTokenExpiration(props: any) {
    return function TokenExpiration() {
        const client1 = client;
        const auth = useAuth();
        const [extendSession, setExtendSession] = useState(false);
        const [showPopup, setShowPopup] = useState(false);
        const { t } = useTranslation();

        const projLang = useAuth().currentProject?.textLanguage;
        const languageCode = mapLanguageCode(projLang as string)

        useEffect(() => {
            i18n.changeLanguage(languageCode ?? 'en')
            i18n.loadLanguages(languageCode ?? 'en')
        }, [languageCode]);

        useEffect(() => {
            if (auth?.value?.authorization?.expiresAt) {
                const expAt = new Date(auth.value.authorization.expiresAt).getTime();
                const remainingTime = expAt - Date.now();
                const warningTime = remainingTime * 0.8;

                const logoutTimer = setTimeout(() => {
                    auth.signOut();
                    window.location.reload();
                }, remainingTime);

                const popupTimer = setTimeout(async () => {
                    setShowPopup(true);
                    if (extendSession) {
                        setExtendSession(false)
                        setShowPopup(true);
                    } else {
                        setExtendSession(false);
                    }
                }, warningTime);

                return () => {
                    clearTimeout(logoutTimer);
                    clearTimeout(popupTimer);
                };
            }
        }, [auth.value, extendSession]);

        const handlePopupClose = () => {
            setShowPopup(false)
        }
        const handleExtendSession = async () => {
            const refreshToken = auth?.value?.authorization?.refreshToken;
            const response = await client1.refreshAuthorization(refreshToken);
            if (response.success) {
                SnackbarProvider.showFeedback({
                    severity: 'success',
                    message: t("tokenExpiration.sessionExtendSuccessMessage"),
                });
                if (auth.value != null) auth.value.authorization = response.value
                setExtendSession(true);
                setShowPopup(false);
            } else {
                SnackbarProvider.showFeedback({
                    severity: 'error',
                    message: t("tokenExpiration.sessionExtendErrorMessage"),
                });
                auth.signOut();
                window.location.reload();
                SnackbarProvider.showFeedback({
                    severity: 'success',
                    message: t("tokenExpiration.sessionExpiredMessage"),
                });
            }
        };


        return (
            <>
                {showPopup && (
                    <ConfirmDialog
                        title={t("tokenExpiration.sessionExpirationConfirmation")}
                        open={showPopup}
                        onClose={handlePopupClose}
                        onConfirm={handleExtendSession}
                    />
                )}
                <AppSwitch {...props} />
            </>
        );
    };
}

export default withTokenExpiration;
