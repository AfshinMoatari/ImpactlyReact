import React, { useEffect, useState } from "react";
import { Backdrop, Box, DialogActions, Grid, TextField, Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogContent from "@material-ui/core/DialogContent";
import modulesMap, { Module, modules } from "./modules";
import ModuleItemCard from "./ModuleItemCard";
import BaseDialog from "../../../components/dialogs/BaseDialog";
import { ReportModuleConfig } from "../../../models/Report";
import { EmptyCondition } from "../../../components/containers/EmptyCondition";
import CreateButton from "../../../components/buttons/CreateButton";
import useSubmitButtonRef from "../../../hooks/useSubmitButtonRef";
import NiceDivider from "../../../components/visual/NiceDivider";
import OutlinedButton from "../../../components/buttons/OutlinedButton";
import { useAppServices } from "../../../providers/appServiceProvider";
import { BarChartData } from "../../../services/reportService";
import { IncidentRegistration, NumericRegistration, StatusRegistration } from "../../../models/Registration";
import { useTranslation } from "react-i18next";

interface EditLabelsDialogProps {
    openLabelsDialog: boolean;
    onClose: VoidFunction;
    onSave: (m: ReportModuleConfig) => void;
    editConfig: ReportModuleConfig | undefined;
}

export const EditLabelsDialog: React.FC<EditLabelsDialogProps> = ({ openLabelsDialog, onClose, onSave, editConfig }) => {
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const services = useAppServices();
    const [moduleType, setModuleType] = useState<string>();
    const [submitButtonRef] = useSubmitButtonRef();
    const [labels, setLabels] = useState<{ [key: number]: string }>({});
    const { t } = useTranslation();

    const [data, setData] = useState<
        BarChartData
        | IncidentRegistration
        | NumericRegistration
        | StatusRegistration
        | IncidentRegistration | undefined>(undefined);

    useEffect(() => {
        const fetch = async () => {
            let res;
            switch (editConfig?.type) {
                case 'surveyStats':
                    res = await services.reports.getSurveyStatsData(editConfig as ReportModuleConfig);
                    if ("value" in res && res.success) {
                        setData(res.value as BarChartData)
                    }
                    break;
                case 'customDistribution':
                    res = await services.reports.getCustomSurveyData(editConfig as ReportModuleConfig);
                    if ("value" in res && res.success) {
                        setData(res.value as BarChartData)
                    }
                    break;
                case 'numericalAverage':
                    res = await services.reports.getRegistrationData(editConfig as ReportModuleConfig);
                    if ("value" in res && res.success) {
                        setData(res.value as NumericRegistration)
                    }
                    break;
                case 'statusDistribution':
                    res = await services.reports.getStatusData(editConfig as ReportModuleConfig);
                    if ("value" in res && res.success) {
                        setData(res.value as StatusRegistration)
                    }
                    break;
                case 'aggregatedCount':
                    res = await services.reports.getIncidentData(editConfig as ReportModuleConfig);
                    if ("value" in res && res.success) {
                        setData(res.value as IncidentRegistration)
                    }
                    break;
                case 'correlativeDistribution':
                    res = await services.reports.getCorrelativeDistributionData(editConfig as ReportModuleConfig);
                    if ("value" in res && res.success) {
                        setData(res.value as BarChartData)
                    }
                    break;
                default:
                    console.error(`Unknown type: ${editConfig?.type}`);
                    return;
            }

            if ("value" in res && res.success) {
                if (editConfig?.labels) {
                    setLabels(editConfig.labels);
                } else {
                    const initialLabels = (res.value.chartDatas || []).reduce((acc: { [key: number]: string }, item: any, index: number) => {
                        acc[index] = item.Name;
                        return acc;
                    }, {});
                    setLabels(initialLabels);
                    setIsButtonDisabled(Object.values(initialLabels).some(label => label.trim() === ''));
                }
            }
        };

        fetch();
    }, [editConfig, services.reports]);

    const handleLabelChange = (index: number, newValue: string) => {
        setLabels(prevLabels => {
            const updatedLabels = { ...prevLabels, [index]: newValue };
            setIsButtonDisabled(Object.values(updatedLabels).some(label => label.trim() === ''));
            return updatedLabels;
        });
    };

    const handleReset = () => {
        if (data) {
            const initialLabels = (data.chartDatas || []).reduce((acc: { [key: number]: string }, item: any, index: number) => {
                acc[index] = item.Name;
                return acc;
            }, {});
            setLabels(initialLabels);
            setIsButtonDisabled(Object.values(initialLabels).some(label => label.trim() === ''));
        }
    };

    const handleClose = () => {
        onClose();
        setLabels({});
        setData(undefined);
        setTimeout(() => setModuleType(undefined), 300);
    };

    const handleClickAdd = () => submitButtonRef.current?.click();
    const handleSelectModule = (m: Module) => () => setModuleType(m.type);

    const renderModuleConfig = () => {
        if (editConfig?.type) {
            const Config = modulesMap[editConfig?.type as keyof typeof modulesMap]?.viewComponent;
            if (Config) {
                return <Config config={{ ...editConfig as ReportModuleConfig, labels }} mode="complete" />;
            }
        }
        return <div>Dit modul er ikke implementeret</div>;
    };

    const handleSave = () => {
        if (!editConfig?.type) {
            console.error("Module type is missing. Cannot save.");
            return;
        }

        const updatedConfig: ReportModuleConfig = {
            ...editConfig,
            labels, // Ensure labels are included
            type: editConfig.type, // Ensure type is always provided
        };

        onSave(updatedConfig);
    };



    const chunkArray = <T,>(array: T[], size: number): T[][] => {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };
    const rows = chunkArray(data?.chartDatas ?? [], 3);

    return (
        <BaseDialog
            open={openLabelsDialog}
            onClose={handleClose}
            maxWidth="md"
            fullWidth={true}
            style={{ overflow: "hidden" }}
            title={
                <div>
                    <Typography variant="h2" style={{ paddingBottom: 2 }}>
                        {t("SurveyBuilder.customizeLabelsTitle")}
                    </Typography>
                    <Typography variant="subtitle2">
                        {t("SurveyBuilder.customizeLabelsSubTitle")}
                    </Typography>
                </div>
            }
        >
            <NiceDivider style={{ backgroundColor: "#0A08121F", width: "105%", marginLeft: -10, overflow: "hidden", height: 1 }} />
            <DialogContent style={{ padding: "0px 18px 2px 18px", marginBottom: 20, marginLeft: 15, height: "600px" }}>
                <EmptyCondition
                    empty={
                        <Grid direction={"column"} wrap={"wrap"} xs={12} container spacing={2}>
                            {modules.map((m, i) => (
                                <Grid xs={4} key={m.type} item>
                                    <ModuleItemCard module={m} onClick={handleSelectModule(m)} />
                                </Grid>
                            ))}
                        </Grid>
                    }
                >
                    {renderModuleConfig()}
                </EmptyCondition>
                <Box>
                    <Typography variant="h2" style={{ paddingBottom: 2 }}>
                        {t("SurveyBuilder.currentLabels")}
                    </Typography>
                    <Grid container spacing={2}>
                        {rows.map((row, rowIndex) => (
                            <Grid container item key={rowIndex} spacing={2}>
                                {row.map((item, index) => {
                                    const gridSize = 12 / Math.min(row.length, 3) as 1 | 2 | 3 | 4 | 6 | 12;

                                    return (
                                        <Grid item xs={gridSize} key={index}>
                                            <TextField
                                                size="small"
                                                label={`Label ${rowIndex * 3 + index + 1}`}
                                                value={labels[rowIndex * 3 + index] ?? item.Name} // Use labels if available, else fallback to data
                                                onChange={(e) => handleLabelChange(rowIndex * 3 + index, e.target.value)}
                                                variant="outlined"
                                                fullWidth
                                                margin="normal"
                                                required
                                                error={labels[rowIndex * 3 + index]?.trim() === ''}
                                                helperText={labels[rowIndex * 3 + index]?.trim() === '' ? t("SurveyBuilder.notEmphty") : ''}
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </DialogContent>
            <EmptyCondition>
                <DialogActions style={{ borderTop: "1px solid #0A08121F" }}>
                    <OutlinedButton
                        text={t("moduleConfigs.back")}
                        aria-label="submit"
                        onClick={handleClose}
                        style={{ fontWeight: 600 }}
                    />
                    <OutlinedButton
                        text={t("moduleConfigs.reset")}
                        aria-label="reset"
                        onClick={handleReset}
                        style={{ fontWeight: 600 }}
                    />
                    <button ref={submitButtonRef} style={{ display: 'none' }} onClick={handleSave}>Save</button>
                    <CreateButton text={t("SurveyBuilder.editBtn")} onClick={handleClickAdd} disabled={isButtonDisabled} />
                </DialogActions>
            </EmptyCondition>
        </BaseDialog>
    );
};

export default EditLabelsDialog;
