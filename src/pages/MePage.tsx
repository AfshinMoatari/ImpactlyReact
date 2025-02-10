import React from "react";
import {useAuth} from "../providers/authProvider";
import {useMeQuery} from "../hooks/useMeQuery";
import {FormControl, Grid, InputLabel, MenuItem, Select, Typography} from "@material-ui/core";
import NiceOutliner from "../components/containers/NiceOutliner";
import AuthUser from "../models/AuthUser";
import CrudModel from "../models/CrudModel";
import Project from "../models/Project";
import theme from "../constants/theme";
import MailFillIcon from "remixicon-react/MailFillIcon";
import renderPhoneNumber from "../lib/string/renderPhoneNumber";
import PhoneFillIcon from "remixicon-react/PhoneFillIcon";
import HomeBasePage from "./project/home/HomeBasePage";
import {useProjectCrudListQuery} from "../hooks/useProjectQuery";
import i18n from "../i18n";
import {useLanguage} from "../LanguageContext";
import {useTranslation} from "react-i18next";

export const MePage: React.FC = () => {
    const auth = useAuth();
    const me = auth.currentUser as AuthUser & CrudModel;
    const myProjectsQuery = useMeQuery();
    const usersQuery = useProjectCrudListQuery(services => services.projectUsers);
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();

    if (myProjectsQuery.query.isLoading || myProjectsQuery.elements === undefined || me === undefined) return null;

    const myProjects = (myProjectsQuery.elements.projects ?? []) as Project[];

    const current = (p: Project) => p.id === auth.currentProjectId ? {
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        color: "white",
    } : {}

    const userRole = usersQuery?.elements.find((x) => x.id === auth.currentUser?.id)?.roleId
    const createdDate = me.createdAt && new Date(me.createdAt).toLocaleDateString("da-DK", {
        day: "numeric",
        month: "short",
        year: "numeric"
    })

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const newLang = event.target.value as string;
        i18n.changeLanguage(newLang)
            .then(() => {
                setLanguage(newLang);
            })
            .catch((error) => {
                console.error("Failed to change language:", error);
            });
    };

    return (
        <HomeBasePage
            title={t("MePage.myProfile")}
        >
            <Grid container spacing={2}>
                <Grid item xs>
                    <NiceOutliner style={{marginBottom: 16, height: "auto"}}>
                        <Typography variant="h2">
                            {me.name}
                        </Typography>
                        <Typography variant="subtitle1">
                            {t("MePage.userRole", {userRole: userRole})}
                        </Typography>
                        <Typography variant="subtitle2">
                            {t("MePage.createdDate", {createdDate: createdDate})}
                        </Typography>
                    </NiceOutliner>

                    <NiceOutliner style={{marginBottom: 16, height: "auto"}} innerStyle={{display: "flex"}}>
                        <div style={{display: "flex", alignItems: "center", width: "50%"}}>
                            <PhoneFillIcon color={theme.palette.secondary.main} size={20}/>
                            <Typography variant="h3" style={{margin: "0 0 0 16px"}}>
                                {me.phoneNumber ? renderPhoneNumber(me.phoneNumber) : "Intet mobilnr."}
                            </Typography>
                        </div>

                        <div style={{display: "flex", alignItems: "center", width: "50%"}}>
                            <MailFillIcon color={theme.palette.secondary.main} size={20}/>
                            <Typography variant="h3" style={{margin: "0 0 0 16px"}}>
                                {me.email ? me.email : "Ingen email"}
                            </Typography>
                        </div>
                    </NiceOutliner>

                    <FormControl variant="outlined" fullWidth>
                        <InputLabel id="language-select-label">{t('LanguageSelector.label')}</InputLabel>
                        <Select
                            labelId="language-select-label"
                            id="language-select"
                            value={language}
                            onChange={handleChange}
                            label={t('LanguageSelector.label')}
                        >
                            <MenuItem value={'en'}>English</MenuItem>
                            <MenuItem value={'da'}>Dansk</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={4}>
                    <NiceOutliner>
                        <Typography variant="h3">{t("MePage.projects")}</Typography>
                        <Typography variant="subtitle2" style={{paddingBottom: 16}}>
                            {t("MePage.projectsDescription")}
                        </Typography>
                        {myProjects.map(p => (
                            <NiceOutliner innerStyle={{marginBottom: 12, ...current(p),}}>
                                {p.name}
                            </NiceOutliner>
                        ))}
                    </NiceOutliner>
                </Grid>
            </Grid>
        </HomeBasePage>
    )
}

export default MePage;