import React, { useEffect, useState } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { CustomTheme } from "../../constants/theme";
import IconButton from "@material-ui/core/IconButton";
import FileCopyFillIcon from "remixicon-react/FileCopy2LineIcon";
import Report from "../../models/Report";
import { useProjectCrudQuery } from "../../hooks/useProjectQuery";
import Box from "@material-ui/core/Box";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Menu, MenuItem } from "@mui/material";


const useStyles = makeStyles<CustomTheme>((theme) => ({
    root: {
        background: 'white',
        border: '1px solid rgba(0,0,0,.1)',
        borderRadius: "8px",
        cursor: 'pointer'
    },
    cover: {
        height: 160,
        background: '#503e8e14',
        borderRadius: "8px 8px 0px 0px",
        borderBottom: '1px solid rgba(0,0,0,.1)',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    title: {
        fontSize: 18,
        color: "#0a0812dd",
        fontWeight: 600,
        textAlign: 'center',
        padding: "12px 25px 0 25px",
    },
    subtitleWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: "#0A081299",
        padding: 12,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    iconButton: {
        width: "43px",
        color: "#0A08128F"
    }
}))

export interface OverviewCardProps {
    title: string;
    subtitle: string;
    onClick: VoidFunction;
    reportId?: string;
    onDup?: (c: Report | undefined) => Promise<void>;
    onEdit?: (c: Report | undefined) => Promise<void>;
    onDelete?: (c: Report | undefined) => Promise<void>;
    icon: React.ReactElement;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
    title,
    subtitle,
    icon,
    onClick,
    reportId,
    onDup,
    onEdit,
    onDelete
}) => {
    const [report, setReport] = useState<Report>();
    const classes = useStyles();
    const reportQuery = useProjectCrudQuery(reportId ?? '', service => service.projectReports);
    const handleCopy = (event: any) => {
        event.stopPropagation();
        onDup && onDup(report);
    };

    const handleIconClick = (event: any) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };


    useEffect(() => {
        if (reportQuery.value !== undefined) {
            setReport(reportQuery.value);
        }
    }, [reportQuery.value?.id]);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const styledIcon = React.cloneElement(icon, { style: { width: '35px', height: "30px", fill: '#503E8E' } });

    return (
        <Box className={classes.root}>
            <Box onClick={onClick}>
                <div className={classes.cover}>
                    {styledIcon}
                    <Box className={classes.title}>
                        {title}
                    </Box>
                </div>
                <div className={classes.subtitleWrapper}>
                    <Box className={classes.subtitle}>{subtitle}</Box>
                    {onDup && !onDelete && (
                        <IconButton className={classes.iconButton} color="primary" onClick={(event) => handleCopy(event)}>
                            <FileCopyFillIcon />
                        </IconButton>
                    )}
                    {onEdit && onDup && onDelete && (
                        <>
                            <IconButton
                                className={classes.iconButton}
                                color="primary"
                                onClick={handleIconClick}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={(event) => {
                                    event.stopPropagation();
                                    handleClose();
                                    onEdit?.(report);
                                }}>
                                    Edit
                                </MenuItem>
                                <MenuItem onClick={(event) => {
                                    event.stopPropagation();
                                    handleClose();
                                    onDup?.(report);
                                }}>
                                    Duplicate
                                </MenuItem>
                                <MenuItem onClick={(event) => {
                                    event.stopPropagation();
                                    handleClose();
                                    onDelete?.(report);
                                }}>
                                    Delete
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </div>
            </Box>
        </Box>
    );
}

export default OverviewCard;
