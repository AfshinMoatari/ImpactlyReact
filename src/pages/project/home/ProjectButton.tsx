import { Button, Menu, MenuItem, MenuList, TextField, Theme, Tooltip } from "@material-ui/core";
import React, { useState } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useMeQuery } from "../../../hooks/useMeQuery";
import { useAuth } from "../../../providers/authProvider";
import Project, { projectNameSearchFilter } from "../../../models/Project";
import history from "../../../history";
import { getNavigationList } from "../../../constants/NavigationList";
import LoadingOverlay from "../../../components/feedback/LoadingOverlay";
import Box from "@material-ui/core/Box";
import { RiExpandUpDownLine } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import theme from "../../../constants/theme";
import dkLocale from "date-fns/locale/da";
import { enUS } from 'date-fns/locale';
import { useLanguage } from "../../../LanguageContext";
import i18n from "../../../i18n";
import { mapLanguageCode } from "../../../utils/languageHelper";
interface ProjectButtonStyleProps {
    open: boolean;
}

const useStyles = makeStyles<Theme, ProjectButtonStyleProps>((theme) => ({
    selector: {
        position: 'relative',
        margin: "0",
        padding: "0 1 0 0",
        width: 200,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontWeight: 500,
        fontSize: 15,
        transition: 'all 0.2s ease',
        cursor: 'pointer'
    },
    arrow: {
        transform: ({ open }) => open ? 'rotateZ(180deg)' : '',
        transition: 'all 0.1s ease'
    },
    menu: {
        width: 200,
        background: 'white',
        alignItems: 'center',
        padding: 0,
        fontWeight: 500,
        fontSize: 15
    },
    logoContainer: {
        width: 35,
        height: 35,
        borderRadius: 8,
        background: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
    },
    nameSpan: {
        color: '#FDF7EC',
        marginLeft: 12,
        overflowWrap: 'break-word',
        textAlign: 'left',
        maxWidth: '60%',
    },
    projectSearchField: {
        borderBottomColor: theme.palette.primary.main,
        "& .MuiFilledInput-root": {
            backgroundColor: "#FDF7EC"
        },
        "& .MuiFilledInput-root:hover": {
            backgroundColor: "rgba(10, 8, 18, 0.12)",
            "@media (hover: none)": {
                backgroundColor: "rgba(10, 8, 18, 0.12)"
            }
        },
        "& .MuiFilledInput-root.Mui-focused": {
            backgroundColor: "rgba(10, 8, 18, 0.12)"
        },
        '& label': {
            color: theme.palette.primary.main,
        }
    }
}));


const ProjectButton = () => {
    const me = useMeQuery();
    const auth = useAuth();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);

    const projects = me.elements?.projects;
    const classes = useStyles({ open });
    const { t } = useTranslation();
    const navigationList = getNavigationList(t)

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => { setAnchorEl(null); setSearch(""); };

    const handleSwitchProject = (projectId: string) => async () => {
        handleClose();
        const currentNav = navigationList.find(nav => history.location.pathname.includes(nav.path))
        await auth.switchProject(projectId, currentNav?.path ?? undefined)
    }
    const [searchTerm, setSearch] = useState<string>('');
    let filteredProjects = projects;
    filteredProjects = projects?.filter(projectNameSearchFilter(searchTerm));

    return (
        <div style={{ margin: '8px 0 6px 0' }}>
            <div
                style={{
                    paddingLeft: "2px",
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    fontSize: "10px",
                    color: "grey",
                }}
            >
                {/*<span className={classes.nameSpan}>*/}
                {/*    {auth.currentUser?.id}*/}
                {/*    {console.log(auth)}*/}
                {/*</span>*/}
            </div>
            <Button
                onClick={handleClick}
                className={classes.selector}
            >
                <div
                    style={{
                        paddingTop: "0",
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%'
                    }}
                >

                    <span className={classes.nameSpan}>
                        {auth.currentProject?.name}
                    </span>

                    <Box flex={1} />

                    <RiExpandUpDownLine style={{ color: '#FDF7EC', marginRight: '-28' }} size={22} />
                </div>
            </Button>
            <Menu
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                open={open}
                onClose={handleClose}
                elevation={0}
                MenuListProps={{
                    className: classes.menu
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >

                {me.query.isLoading &&
                    <React.Fragment>
                        <div style={{ height: 64 }} />
                        <LoadingOverlay />
                    </React.Fragment>
                }

                <MenuList
                    style={{ paddingTop: 0 }}>
                    <Box marginBottom={1}>
                        <TextField
                            fullWidth
                            className={classes.projectSearchField}
                            onKeyDown={e => e.stopPropagation()}
                            variant="filled"
                            label={t("navigationMain.SearchProject")}
                            value={searchTerm}
                            onChange={(event) => setSearch(event.target.value)}

                        />
                    </Box>
                    {filteredProjects?.map((p: Project) => (
                        <Tooltip title={p.name}>
                            <MenuItem
                                key={p.id}
                                onClick={handleSwitchProject(p.id)}
                                className={classes.menuOption}>
                                <span style={{
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                }}>{p.name}</span>
                            </MenuItem>
                        </Tooltip>
                    ))}
                </MenuList>
            </Menu>
        </div>
    )
}

export default ProjectButton;