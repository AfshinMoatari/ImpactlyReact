import React, { useState, useEffect, useCallback } from "react";
import {
    Backdrop,
    DialogActions,
    Grid,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    FormControlLabel,
    Switch,
    makeStyles,
    Theme
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import { useTranslation } from "react-i18next";
import { useHistory } from 'react-router-dom';

import { Module, modules } from "./modules";
import Routes from "../../../constants/Routes";
import Analytics from "../../../models/Analytics";
import { DefaultSROIFlowState } from "./flow/SROIFlowProvider";
import BaseDialog from "../../../components/dialogs/BaseDialog";
import { EmptyCondition } from "../../../components/containers/EmptyCondition";
import CreateButton from "../../../components/buttons/CreateButton";
import NiceDivider from "../../../components/visual/NiceDivider";
import OutlinedButton from "../../../components/buttons/OutlinedButton";
import CustomTypography from "../../../components/CustomTypography";
import ReportItemCard from "./ReportItemCard";

interface AnalyticsPickerDialogProps {
    open: boolean;
    onClose: VoidFunction;
    analytics: Analytics[];
}

interface ConfigOption {
    id: string;
    name: string;
}

const useStyles = makeStyles((theme: Theme) => ({
    switchBase: {
        '&.Mui-checked': {
            color: `${theme.palette.primary.main} !important`,
        },
        '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: `${theme.palette.primary.main} !important`,
        },
    },
    dialogContent: {
        padding: '0px 18px 2px 18px',
        marginBottom: 20,
        marginLeft: 15,
        height: (props: { noneSelected: boolean }) =>
            props.noneSelected ? '1000px' : '400px'
    },
    divider: {
        backgroundColor: '#0A08121F',
        width: "105%",
        marginLeft: -10,
        overflow: "hidden",
        height: 1
    },
    dialogActions: {
        borderTop: '1px solid #0A08121F'
    }
}));

export const AnalyticsPickerDialog: React.FC<AnalyticsPickerDialogProps> = ({
    open,
    onClose,
    analytics
}) => {
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [selectedConfig, setSelectedConfig] = useState<string>("");
    const [useTemplate, setUseTemplate] = useState(true);
    const [showConfig, setShowConfig] = useState(false);

    const { t } = useTranslation();
    const history = useHistory();
    const classes = useStyles({ noneSelected: !selectedModule });

    useEffect(() => {
        if (open) {
            resetState();
        }
    }, [open]);

    const resetState = () => {
        setSelectedModule(null);
        setSelectedConfig("");
        setUseTemplate(true);
        setShowConfig(false);
    };

    const getDefaultConfig = useCallback((moduleType: string) => {
        switch (moduleType) {
            case 'SROI':
                return new DefaultSROIFlowState();
            default:
                return null;
        }
    }, []);

    const getConfigOptions = useCallback((): ConfigOption[] => {
        if (!selectedModule || !analytics) return [];

        return analytics
            .filter(analytic =>
                analytic.reportConfig?.confirmation?.isSavedTemplate &&
                analytic.reportConfig?.confirmation?.templateName?.trim()
            )
            .map(analytic => ({
                id: analytic.id,
                name: analytic.reportConfig.confirmation.templateName || ''
            }));
    }, [selectedModule, analytics]);

    const handleSelectModule = useCallback((m: Module) => () => {
        // Check if there are available templates for this module
        const hasTemplates = analytics?.some(analytic =>
            analytic.reportConfig?.confirmation?.isSavedTemplate &&
            analytic.reportConfig?.confirmation?.templateName?.trim()
        );

        if (!hasTemplates) {
            onClose();
            history.push(
                Routes.projectAnalyticsFlow
                    .replace(':moduleType', m.type)
                    .replace(':action', 'create')
                    .replace('/:analyticId', ''),
                { analyticsData: getDefaultConfig(m.type), isEdit: false, isTemplate: false }
            );
            return;
        }

        setSelectedModule(m);
        setShowConfig(true);
    }, [analytics, history, getDefaultConfig, onClose]);

    const handleCreate = useCallback(() => {
        if (!selectedModule) return;

        onClose();
        if (!useTemplate) {
            history.push(
                Routes.projectAnalyticsFlow
                    .replace(':moduleType', selectedModule.type)
                    .replace(':action', 'create')
                    .replace('/:analyticId', ''),
                { analyticsData: getDefaultConfig(selectedModule.type), isEdit: false, isTemplate: false }
            );
        } else if (selectedConfig) {
            const selectedAnalytic = analytics.find(a => a.id === selectedConfig);
            if (!selectedAnalytic?.reportConfig) {
                return; // or handle the error case
            }

            history.push(
                Routes.projectAnalyticsFlow
                    .replace(':moduleType', selectedModule.type)
                    .replace(':action', 'create')
                    .replace(':analyticId', `template/${selectedConfig}`),
                { analyticsData: selectedAnalytic, isEdit: false, isTemplate: true }
            );
        }
    }, [selectedModule, useTemplate, selectedConfig, analytics, history, getDefaultConfig, onClose]);

    const renderModuleGrid = () => (
        <Grid direction="row" wrap="wrap" xs={12} container spacing={2}>
            {modules.map((m) => (
                <Grid xs={4} key={m.type} item>
                    <ReportItemCard module={m} onClick={handleSelectModule(m)} />
                </Grid>
            ))}
        </Grid>
    );

    const renderConfigSection = () => (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <CustomTypography
                    style={{
                        marginTop: '35px',
                        textAlign: 'left',
                        color: '#666'
                    }}
                >
                    {t('AnalyticsPage.useTemplateDialog.description', {
                        count: getConfigOptions().length,
                        moduleType: selectedModule?.type
                    })}
                </CustomTypography>
            </Grid>
            <Grid item xs={12}>
                <FormControlLabel
                    style={{
                        marginBottom: '24px',
                        width: '100%'
                    }}
                    control={
                        <Switch
                            checked={useTemplate}
                            onChange={(e) => {
                                setUseTemplate(e.target.checked);
                                setSelectedConfig("");
                            }}
                            classes={{ switchBase: classes.switchBase }}
                        />
                    }
                    label={t('AnalyticsPage.useTemplateDialog.useTemplate')}
                />
                <FormControl
                    variant="outlined"
                    fullWidth
                    disabled={!useTemplate}
                    style={{ marginTop: '8px' }}
                >
                    <InputLabel>
                        {t('AnalyticsPage.useTemplateDialog.selectConfig')}
                    </InputLabel>
                    <Select
                        value={selectedConfig}
                        onChange={(e) => setSelectedConfig(e.target.value as string)}
                        label={t('AnalyticsPage.useTemplateDialog.selectConfig')}
                    >
                        {getConfigOptions().map((config) => (
                            <MenuItem key={config.id} value={config.id}>
                                {config.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );

    return (
        <BaseDialog
            open={open}
            onClose={onClose}
            maxWidth={!selectedModule ? "lg" : "xs"}
            fullWidth
            style={{ overflow: "hidden" }}
            title={
                !selectedModule ? (
                    t('AnalyticsPage.useTemplateDialog.createAnalytics')
                ) : (
                    <div>
                        <IconButton onClick={() => setSelectedModule(null)}>
                            <ArrowLeftLineIcon />
                        </IconButton>
                        <span>{t('AnalyticsPage.useTemplateDialog.createAnalytics')}</span>
                    </div>
                )
            }
        >
            <NiceDivider className={classes.divider} />
            <Backdrop style={{ zIndex: 10, color: 'white' }} open={false}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <DialogContent className={classes.dialogContent}>
                <EmptyCondition
                    isEmpty={!showConfig}
                    empty={renderModuleGrid()}
                >
                    {selectedModule && renderConfigSection()}
                </EmptyCondition>
            </DialogContent>
            {selectedModule && (
                <DialogActions className={classes.dialogActions}>
                    <OutlinedButton
                        text={t('AnalyticsPage.useTemplateDialog.back')}
                        aria-label="back"
                        onClick={() => setSelectedModule(null)}
                        style={{ fontWeight: 600 }}
                    />
                    <CreateButton
                        text={t('AnalyticsPage.useTemplateDialog.createAnalytics')}
                        disabled={useTemplate && !selectedConfig}
                        onClick={handleCreate}
                    />
                </DialogActions>
            )}
        </BaseDialog>
    );
};

export default AnalyticsPickerDialog;
