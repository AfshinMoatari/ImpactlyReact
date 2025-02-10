import { Box, Paper, PaperProps } from "@material-ui/core";
import React, { useRef } from "react";
import { ReportModuleConfig } from "../../models/Report";
import modulesMap from "../../pages/project/report/modules";
import IconButton from '@mui/material/IconButton';
import { ReactComponent as DraggableIcon } from '../icons/draggable.svg';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/system';
import * as htmlToImage from "html-to-image"
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";


type ModulePaperProps = PaperProps & {
    config: ReportModuleConfig;
    isShared?: Boolean;
    onRemove?: (c: ReportModuleConfig) => void;
    onEdit?: (c: ReportModuleConfig) => void;
    onEditLabels?: (c: ReportModuleConfig) => void;
    onDub?: (c: ReportModuleConfig) => void;
    onExport?: (c: ReportModuleConfig) => void;
}

const StyledIconButton = styled(IconButton)`
  &:hover {
    background: none;
  }

  .MuiTouchRipple-root {
    display: none;
  }
`;

const ModulePaper: React.FC<ModulePaperProps> = ({
    config,
    onRemove,
    onEdit,
    onEditLabels,
    onDub,
    onExport,
    children,
    isShared,  // Add isShared to the destructured props
    ...props
}) => {
    const elementRef = useRef(null);
    const { name } = config;
    const { t } = useTranslation();

    const handleRemove = () => onRemove && onRemove(config);
    const handleEdit = () => onEdit && onEdit(config);
    const handleEditLabels = () => onEditLabels && onEditLabels(config);
    const handleCopy = () => onDub && onDub(config);
    const handleExport = () => onExport && onExport(config);

    const handleExportImage = () => {
        if (elementRef.current != null)
            htmlToImage.toPng(elementRef.current as HTMLElement).then((res) => {
                saveAs(res, `image.jpg`);
            });
    };

    const options = [
        { label: t("moduleConfigs.edit"), handler: handleEdit },
        { label: t("moduleConfigs.editLabels"), handler: handleEditLabels },
        { label: t("moduleConfigs.copy"), handler: handleCopy },
        { label: t("moduleConfigs.delete"), handler: handleRemove },
        { label: t("moduleConfigs.export"), handler: handleExport },
    ];

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (handler: () => void) => {
        handler();
        handleClose();
    };

    const ModuleViewComponent = modulesMap[config.type]?.viewComponent;
    if (ModuleViewComponent === undefined) return null;

    const styles: React.CSSProperties = {
        ...props?.style,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
    };

    return (
        config.type !== "pictureUpload" ? (
            <Paper
                ref={elementRef}
                data-grid={{ ...config.layout, y: Infinity, static: false }}
                elevation={0}
                {...props}
                style={styles}
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    pr={1}
                    marginBottom={1.2}
                    borderBottom="1px solid rgba(10, 8, 18, 0.12)"
                >
                    <Box component="h3" pl={1} display="flex" alignItems="center">
                        {!isShared && (
                            <DraggableIcon
                                className={"no-print"}
                                style={{ fill: "rgba(10, 8, 18, 0.56)", height: 30 }}
                            />
                        )}
                        <Box pl={1.5} fontWeight={600}>
                            {name}
                        </Box>
                    </Box>
                    {!isShared && (
                        <StyledIconButton
                            aria-label="more"
                            id="long-button"
                            aria-controls={open ? 'long-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={handleClick}
                            style={{ backgroundColor: 'none' }}
                        >
                            <MoreVertIcon />
                        </StyledIconButton>
                    )}
                </Box>
                {!isShared && (
                    <Menu
                        id="menu-dropdown"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        PaperProps={{
                            style: {
                                boxShadow: 'none',
                                border: '1px solid #ECEEF0',
                            },
                        }}
                    >
                        {options.map((option, index) => (
                            <MenuItem
                                key={index}
                                onClick={() => handleMenuItemClick(option.handler)}
                            >
                                {option.label}
                            </MenuItem>
                        ))}
                    </Menu>
                )}
                <Box className="report" height="100%">
                    <ModuleViewComponent config={config} mode="complete" />
                </Box>
                {children}
            </Paper>
        ) :
            (
                <Paper
                    {...props}
                    style={styles}
                >
                    <Box className="report" height="100%" position="relative">
                        {!isShared && (
                            <StyledIconButton
                                aria-label="more"
                                id="long-button"
                                aria-expanded={open ? 'true' : undefined}
                                aria-haspopup="true"
                                onClick={handleClick}
                                style={{
                                    position: 'absolute',
                                    top: 15,
                                    right: 15,
                                    width: "30px",
                                    height: "30px",
                                    backgroundColor: '#FFFFFF80'
                                }}
                            >
                                <MoreVertIcon />
                            </StyledIconButton>
                        )}
                        <Menu
                            id="menu-dropdown"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                style: {
                                    width: '100px',
                                    boxShadow: 'none',
                                    border: '1px solid #ECEEF0',
                                },
                            }}
                        >
                            {options.map((option, index) => (
                                <MenuItem key={index} onClick={() => handleMenuItemClick(option.handler)}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Menu>
                        <ModuleViewComponent config={config} mode="complete" />
                        {children}
                    </Box>
                </Paper>
            )
    );
};

export default ModulePaper;