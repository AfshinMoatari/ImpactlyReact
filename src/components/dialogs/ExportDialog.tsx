import React, { useEffect, useState } from "react";
import {
    Backdrop,
    DialogActions,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    TextField,
    Typography,
    Select,
    SelectChangeEvent,
    OutlinedInput,
    Box,
} from "@mui/material";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import BaseDialog from "./BaseDialog";
import { useAuth } from "../../providers/authProvider";
import projectTag from "../../models/ProjectTag";
import CheckboxMenuItem from "../inputs/CheckboxMenuItem";
import storageService from "../../services/storageService";
import { HOST } from "../../services/appServices";
import { RequestMethod, restClient } from "../../services/restClient";
import ActionButton from "../buttons/ActionButton";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import snackbarProvider from "../../providers/snackbarProvider";
import { useTranslation } from 'react-i18next';
import CustomSwitch from "../buttons/CustomSwitch";
import {KeyboardDatePicker} from "@material-ui/pickers";

interface ExportDialogProps {
    open: boolean;
    onClose: VoidFunction;
    tags: projectTag[];
}

interface OptionsProps {
    fields: string[];
    filter: string[];
    orderBy: string[];
    sortedBy: string[];
    format: string[];
}

export interface FieldObject {
    id: string;
    checked: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            minWidth: 120,
        }
    })
);
export const ExportDialog: React.FC<ExportDialogProps> = ({open, onClose, tags,}) => {
    const classes = useStyles();
    const storage = storageService(HOST);
    const client = restClient(HOST, storage);
    const auth = useAuth();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [format, setFormat] = useState<string>("")
    const [options, setOptions] = useState<OptionsProps>();
    const [datatypes, setDatatypes] = useState<string>("");
    const [allData, setAllData] = useState(false);
    const [filter, setFilter] = useState<string>("");
    const fieldsObj: FieldObject[] = new Array<FieldObject>();
    const { t } = useTranslation();

    useEffect(() => {
        async function getOptions() {
            const res = await client.fetchForm(
                RequestMethod.GET,
                `/api/web/v1/me/projects/${auth.currentProjectId}/dump/options`
            );
            if (res.success) {
                setOptions(res.value as OptionsProps);
            } else {
                return;
            }
        }

        if (!options) {
            getOptions();
        }
    });

    const handleDatatypesChange = (event: SelectChangeEvent) => {
        setDatatypes(event.target.value);
    };

    const handleClose = () => {
        onClose();
    };

    const handleTypesChange = (event: SelectChangeEvent) => {
        setFilter(event.target.value as string);
    };

    const handleFormatChange = (event: SelectChangeEvent) => {
        setFormat(event.target.value as string)
    }

    const handleFieldsChange = (event: SelectChangeEvent<typeof fieldsObj>) => {
        //add logic later
    };

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter("");
        setAllData(event.target.checked);
    };

    const handleStartDateChange = (date: Date | null) => {
        if (date) {
            date.setHours(12, 0, 0, 0);
        }
        setStartDate(date);
    };

    const handleEndDateChange = (date: Date | null) => {
        if (date) {
            date.setHours(12, 0, 0, 0);
        }
        setEndDate(date);
    };

    const handleSubmit = () => {
        const fields: string[] = [];
        if (!allData) {
            for (const fieldsObjElement of fieldsObj) {
                if (fieldsObjElement.checked) {
                    fields.push(fieldsObjElement.id);
                }
            }
        }
        if (startDate && endDate) {
            const body = {
                sortedBy: datatypes,
                filter: filter === "" ? "Alle typer data" : filter,
                fields: allData ? options?.fields : fields,
                userName: auth.currentUser?.name,
                projectName: auth.currentProject?.name,
                startDate: startDate,
                endDate: endDate,
            };

            let endpoint = `/api/web/v1/me/projects/${auth.currentProjectId}/dump`;
            if (format === "Raw") {
                endpoint += '/raw';
            }

            client
                .fetchJSON(
                    RequestMethod.POST,
                    endpoint,
                    body
                )
                .then((res) => {
                    if (res.success) {
                        handleClose();
                        snackbarProvider.success(t('ExportDialog.successSnackbar'));
                    } else {
                        snackbarProvider.error(res.feedback.message);
                    }
                });
        } else {
            snackbarProvider.error(t('ExportDialog.errorSnackbar'));
        }
    };

    const placeholder = "";
    const renderValue = (selected: unknown): React.ReactNode => {
        if (allData) {
            return "Alle valgt";
        }
        if (Array.isArray(selected)) {
            if (selected.length > 1) return `${selected.length} valgte`;
            else return `${selected.length} valgt`;
        }
        if ((selected as string[])?.length === 0) {
            return placeholder;
        }

        return "" + (placeholder !== undefined ? placeholder : "");
    };

    return (
        <BaseDialog
            disableEnforceFocus
            open={open}
            onClose={handleClose}
            fullWidth={true}
            title={<span style={{ fontFamily: 'Lora', fontSize: '24px' }}>{t("ExportDialog.title")}</span>}
            description={<span style={{ fontFamily: 'Inter' }}>{t("ExportDialog.description")}</span>}
            style={{padding: "16px"}}
        >
            <Backdrop style={{ zIndex: 10, color: "white" }} open={false}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Divider />
            <DialogContent style={{ padding: "16px" }}>
            <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <TextField
                        variant={"outlined"}
                        label={t("ExportDialog.fileNameLabel")}
                        disabled
                        size="small"
                        value={`${
                            useAuth().currentProject?.name
                        }-data-${new Date().toLocaleDateString("da-DK", {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                        })}`}
                    />
                <FormControl style={{ marginTop: 20}} className={classes.formControl} size="small">
                    <InputLabel id="export-format">{t("ExportDialog.formatLabel")}</InputLabel>
                    <Select
                        labelId="export-format-label"
                        id="demo-simple-select-helper"
                        variant={"outlined"}
                        size="small"
                        value={format}
                        label="Sorting"
                        onChange={handleFormatChange}
                    >
                        <MenuItem value="Specified">{t("ExportDialog.simplified")}</MenuItem>
                        <MenuItem value="Raw">{t("ExportDialog.raw")}</MenuItem>
                    </Select>
                </FormControl>
                <FormControl style={{ marginTop: 20}} className={classes.formControl} size="small">
                    <InputLabel id="demo-simple-select-helper-label">{t("ExportDialog.sortingLabel")}</InputLabel>
                        <Select
                            labelId="demo-simple-select-helper-label"
                            id="demo-simple-select-helper"
                            variant={"outlined"}
                            disabled={format === "Raw"}
                            size="small"
                            value={datatypes}
                            label="Sorting"
                            onChange={handleDatatypesChange}
                        >
                            {options?.sortedBy.map((sort: string) => (
                                <MenuItem value={sort}>{sort}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                <Box display="flex" justifyContent="space-between" alignItems="center" style={{ gap: '16px' }}>
                    <KeyboardDatePicker
                        disableFuture
                        autoOk
                        allowKeyboardControl
                        views={['date']}
                        inputVariant="outlined"
                        format="dd/MM/yyyy"
                        margin="normal"
                        openTo='year'
                        id="start"
                        variant='inline'
                        size='small'
                        name="start"
                        label={t("moduleConfigs.start")}
                        value={startDate}
                        onChange={handleStartDateChange}
                        style={{ flexGrow: 1 }}
                        invalidDateMessage={t("moduleConfigs.invalidDateMessage")}
                        minDateMessage={t("moduleConfigs.minDateMessage")}
                        maxDateMessage={t("moduleConfigs.maxDateMessage")}
                    />
                    <KeyboardDatePicker
                        disableFuture
                        autoOk
                        allowKeyboardControl
                        views={['date']}
                        inputVariant="outlined"
                        format="dd/MM/yyyy"
                        margin="normal"
                        openTo='year'
                        id="end"
                        variant='inline'
                        size='small'
                        name="end"
                        label={t("moduleConfigs.end")}
                        value={endDate}
                        onChange={handleEndDateChange}
                        style={{ flexGrow: 1 }}
                        invalidDateMessage={t("moduleConfigs.invalidDateMessage")}
                        minDateMessage={t("moduleConfigs.minDateMessage")}
                        maxDateMessage={t("moduleConfigs.maxDateMessage")}
                    />
                </Box>
                <div
                        style={{
                            display: "flex",
                            marginTop: 20,
                        }}
                    >
                    <Typography style={{ paddingTop: 8, fontWeight: 600 }}>
                        {t("ExportDialog.exportAllData")}
                        </Typography>
                        <div style={{ marginLeft: "auto" }}>
                            <CustomSwitch checked={allData} onChange={handleSwitchChange}/>
                        </div>
                    </div>
                <FormControl style={{ marginTop: 20 }} className={classes.formControl} size="small">
                        <InputLabel id="datatypeslabel">
                            {allData ? t("ExportDialog.allSelected") : t("ExportDialog.dataTypesLabel")}
                        </InputLabel>
                        <Select
                            label={allData ? t("ExportDialog.allSelected") : t("ExportDialog.dataTypesLabel")}
                            disabled={allData}
                            labelId="datatypeslabel"
                            variant={"outlined"}
                            size="small"
                            value={filter}
                            onChange={handleTypesChange}
                        >
                            {options?.filter.map((filter: string) => (
                                <MenuItem key={filter} value={filter}>{filter}</MenuItem>                            ))}
                        </Select>
                    </FormControl>
                <FormControl style={{ marginTop: 20 }} className={classes.formControl} size="small">
                        <InputLabel id="fieldsLabel">
                            {allData ? t("ExportDialog.allSelected") : t("ExportDialog.columnsLabel")}
                        </InputLabel>
                        <Select
                            input={
                                <OutlinedInput
                                    label={
                                        allData ? "Alle valgte" : "Kolonner i din data eksport"
                                    }
                                />
                            }
                            labelId="fieldsLabel"
                            multiple
                            size="small"
                            disabled={allData || format === "Raw"}
                            onChange={handleFieldsChange}
                            value={fieldsObj}
                            renderValue={renderValue}
                        >
                            {options?.fields.map((field: string) => (
                                <CheckboxMenuItem name={field} id={field} tagsObj={fieldsObj} />
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </DialogContent>
            <Divider />
            <DialogActions>
                <ActionButton
                    variant="outlined"
                    onClick={handleClose}
                    style={{borderRadius: 52}}
                >
                    {t('ActionButtons.close')}
                </ActionButton>
                <ActionButton
                        size="small"
                        onClick={handleSubmit}
                        style={{borderRadius: 52, margin: 10}}
                    >
                        {t("ExportDialog.confirmButton")}
                    </ActionButton>
                </DialogActions>
        </BaseDialog>
    );
};
export default ExportDialog;
