import React from "react";
import SearchInput from "../inputs/SearchInput";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {IconButton} from "@material-ui/core";
import AddFillIcon from "remixicon-react/AddFillIcon";
import theme from "../../constants/theme";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
        zIndex: 1,
    },
    filterIcon: {
        padding: 3,
        marginLeft: 16,
        background: theme.palette.primary.light,
    },
    filterText: {
        color: theme.palette.primary.light,
        fontSize: 14,
        fontWeight: 600,
        marginLeft: 6
    },
    flexCenter: {
        display: "flex",
        alignItems: 'center',
    },
    flexCenterPointer: {
        paddingLeft: 8,
        display: "flex",
        alignItems: 'center',
        cursor: 'pointer'
    }
}))

interface ToolbarProps {
    search?: string;
    onSearch?: (s: string) => void;
    actionStart?: React.ReactNode;
    actionEnd?: React.ReactNode;
    onFilter?: () => void;
}

const BasePageToolbar: React.FC<ToolbarProps> = ({search, onSearch, actionStart, actionEnd, onFilter}) => {
    const classes = useStyles();
    const showSearch = search !== undefined && onSearch !== undefined;
    return (
        <Box className={classes.root}>
            <div className={classes.flexCenter}>
                {showSearch && <SearchInput search={search} onChange={onSearch} width={256}/>}
                {actionStart && actionStart}
                <div className={classes.flexCenterPointer}>
                    {onFilter && (
                        <React.Fragment>
                            <IconButton size='small' className={classes.filterIcon}>
                                <AddFillIcon size={14} color='white'/>
                            </IconButton>
                            <span className={classes.filterText}>Tilføj filter</span>
                        </React.Fragment>
                    )}
                </div>
            </div>
            <div>
                {actionEnd}
            </div>
        </Box>
    )
}

export default BasePageToolbar;
