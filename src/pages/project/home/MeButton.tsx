import React, {useState} from "react";
import {Button, Divider, Menu, MenuItem, MenuList, Theme} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import {useAuth} from "../../../providers/authProvider";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ArrowDownSLineIcon from "remixicon-react/ArrowDownSLineIcon";
import Routes from "../../../constants/Routes";
import history from "../../../history";
import LogoutBoxLineIcon from 'remixicon-react/LogoutBoxLineIcon';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import {useTranslation} from "react-i18next";

interface MeButtonStyleProps {
    open: boolean;
}

const useStyles = makeStyles<Theme, MeButtonStyleProps>((theme) => ({
    avatar: {
        background: theme.palette.primary.main,
        marginRight: 12,
        width: 35,
        height: 35
    },
    avatarDiv: {
        height: 11,
        width: 11,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarText: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        lineHeight: 1.3
    },
    text: {
        height: 32,
        lineHeight: 32,
        flex: 1,
        fontWeight: 500
    },
    arrow: {
        transform: ({open}) => open ? 'rotateZ(180deg)' : '',
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
    menuOption: {
        height: 48,
    }
}));

const MeButton = () => {
    const auth = useAuth();
    const handleSignOutClick = () => auth.signOut();
    const currentUser = auth.currentUser;

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const classes = useStyles({open});
    const { t } = useTranslation();

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => setAnchorEl(null);

    const handleLinkClick = (route: string) => {
        handleClose();
        history.push(route)
    }

    return (
        <div style={{padding: '8px 16px', backgroundColor:'#0A0812', marginBottom: -8, paddingBottom: 8}}>
            <Button
                onClick={handleSignOutClick}
                style={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingLeft: 0,
                    borderRadius: 8,
                    width: 200,
                }}>
                <Box style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                    <Box className={classes.avatarText}>
                        <span style={{fontSize: 14, fontWeight: 600, color: '#FDF7EC'}}>
                            {currentUser?.firstName}
                        </span>
                        <span style={{fontSize: 10, color: 'grey'}}>
                            {currentUser?.email}
                        </span>
                    </Box>

                    <Box flex={1}/>
                    <LogoutBoxLineIcon style={{color: '#FDF7EC', marginRight: -10}} size={20} onClick={handleSignOutClick}/>
                </Box>
            </Button>
        </div>
    );
}

export default MeButton;