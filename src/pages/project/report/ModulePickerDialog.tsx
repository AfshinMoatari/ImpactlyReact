import React, { useState } from "react";
import { Backdrop, DialogActions, Grid, Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import modulesMap, { Module, modules } from "./modules";
import ModuleItemCard from "./ModuleItemCard";
import BaseDialog from "../../../components/dialogs/BaseDialog";
import { ReportModuleConfig } from "../../../models/Report";
import { EmptyCondition } from "../../../components/containers/EmptyCondition";
import IconButton from "@material-ui/core/IconButton";
import CreateButton from "../../../components/buttons/CreateButton";
import useSubmitButtonRef from "../../../hooks/useSubmitButtonRef";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import { useTranslation } from "react-i18next";
import NiceDivider from "../../../components/visual/NiceDivider";
import { Button } from "@mui/material";
import OutlinedButton from "../../../components/buttons/OutlinedButton";

interface ModulePickerDialogProps {
    open: boolean;
    onClose: VoidFunction;
    onSave: (m: ReportModuleConfig) => void;
    edit: boolean;
    editConfig: ReportModuleConfig | undefined;
    setDateRangesValid?: (valid: boolean | undefined) => void;
}

export const ModulePickerDialog: React.FC<ModulePickerDialogProps> = ({ open, onClose, onSave, edit, editConfig, setDateRangesValid }) => {
    //this is to validate the date ranges before submitting a module config. It dissables the button "Tilfoj Modul" if not valid.
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const handleValidityChange = (isValid: boolean) => {
        setIsButtonDisabled(!isValid);
        if (setDateRangesValid) {
            setDateRangesValid(isValid);
        }
    }

    const [moduleType, setModuleType] = useState<string>();
    const [submitButtonRef] = useSubmitButtonRef();
    const { t } = useTranslation();
    const registrations: Module[] = []
    //todo find a better name for this
    const other: Module[] = []
    if (edit) {
        if (moduleType === undefined) setModuleType(editConfig?.type);
        open = true;
    }
    for (const module of modules) {
        if (module.type === "aggregatedCount" || module.type === "numericalAverage" || module.type === "statusDistribution") {
            registrations.push(module)
        } else {
            other.push(module)
        }
    }
    const handleClose = () => {
        onClose();
        setTimeout(() => setModuleType(undefined), 300);
    }
    const handleClickAdd = () => submitButtonRef.current?.click();
    const handleGoBack = () => setModuleType(undefined);
    const handleSelectModule = (m: Module) => () => setModuleType(m.type);

    const handleSubmit = (config: Partial<ReportModuleConfig>) => {
        onSave(config as ReportModuleConfig);
        setModuleType(undefined);
    }

    const noneSelected = moduleType === undefined;

    const renderModuleConfig = () => {
        if (!noneSelected) {
            const Config = modulesMap[moduleType as keyof typeof modulesMap].configComponent;
            if (Config !== undefined) return <Config onSubmit={handleSubmit} submitRef={submitButtonRef}
                editModuleConfig={editConfig} setDateRangesValid={handleValidityChange} />
        }
        return (
            <div>
                Dit modul er ikke implementeret
            </div>
        )
    }

    return (
        <BaseDialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth={true}
            style={{ overflow: "hidden" }}
            title={
                noneSelected ? t("ReportPage.ModulePickerDialog.addModule") : (
                    !edit ?
                        <div>
                            <IconButton onClick={handleGoBack}>
                                <ArrowLeftLineIcon />
                            </IconButton>
                            <span>{t("ReportPage.ModulePickerDialog.configureModule")}</span>
                        </div> :
                        <div>
                            <Typography variant='h2' style={{ paddingBottom: 2 }}>
                                {t("ReportPage.ModulePickerDialog.title")}
                            </Typography>
                            <Typography variant='subtitle2'>
                                {t(`ReportsIndex.${editConfig?.type}.title`)}
                            </Typography>
                        </div>
                )
            }
        >
            <NiceDivider style={{ backgroundColor: '#0A08121F', width: "105%", marginLeft: -10, overflow: "hidden", height: 1 }} />
            <Backdrop style={{ zIndex: 10, color: 'white' }} open={false}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <DialogContent style={{ padding: '0px 18px 2px 18px', marginBottom: 20, marginLeft: 15, height: '1000px' }}>
                <EmptyCondition
                    isEmpty={noneSelected}
                    empty={(
                        <Grid direction={"row"} wrap={"wrap"} xs={12} container spacing={2}>
                            {modules.map((m, i) => {
                                return (
                                    <Grid xs={4} key={m.type} item>
                                        <ModuleItemCard module={m} onClick={handleSelectModule(m)} />
                                    </Grid>
                                )
                            })}
                        </Grid>
                    )}
                >
                    {renderModuleConfig()}
                </EmptyCondition>
            </DialogContent>
            <EmptyCondition
                isEmpty={noneSelected}
            >
                <DialogActions style={{
                    borderTop: '1px solid #0A08121F'
                }}>
                    <OutlinedButton
                        text={t('ReportPage.ModulePickerDialog.back')}
                        aria-label="submit"
                        onClick={handleClose}
                        style={{ fontWeight: 600 }}
                    />

                    <CreateButton text={edit ? t("ReportPage.ModulePickerDialog.updateModule") : t("ReportPage.ModulePickerDialog.addModule")} onClick={handleClickAdd} disabled={isButtonDisabled} />

                </DialogActions>
            </EmptyCondition>
        </BaseDialog>
    )
}

export default ModulePickerDialog;
