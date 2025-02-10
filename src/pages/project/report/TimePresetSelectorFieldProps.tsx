import FormControl from "@material-ui/core/FormControl";
import { Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import { Field } from "formik";
import React, { useEffect } from "react";
import fromPreset, { customTime, timePresets } from "../../../lib/date/fromPreset";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { ReportModuleConfig } from "../../../models/Report";
import { FormikHelpers } from "formik/dist/types";
import { useTranslation } from "react-i18next";
import { isRegDateRangeValid } from "../../../lib/date/dateValidation";

interface TimePresetSelectorFieldProps {
    config: Partial<ReportModuleConfig>;
    setFieldChange: FormikHelpers<Partial<ReportModuleConfig>>["setFieldValue"];
    datesValidity?: (valid: boolean) => void;
}

const TimePresetSelectorField: React.FC<TimePresetSelectorFieldProps> = ({ config, setFieldChange, datesValidity }) => {
    const timeRangePresets = [...timePresets(), customTime()];
    const { t } = useTranslation();
    const { timePreset, start, end } = config;

    //this useEffect is to validate of the dates are valid, if not it will disable the Add Module button
    useEffect(() => {
        const isValid = isRegDateRangeValid(config);

        if (datesValidity) {
            datesValidity(isValid);
        }
    }, [config, datesValidity]);

    const handleDateChange = (date: Date, fieldName: string) => {
        if (date) {
            date.setHours(12, 0, 0, 0);
        }
        setFieldChange(fieldName, date);
    };

    return (
        <>
            <FormControl variant="outlined" fullWidth style={{ marginTop: 10, marginBottom: 10 }} size='small'>
                <InputLabel id="time-label">{t("moduleConfigs.chooseTimePeriod")}</InputLabel>
                <Field
                    as={Select}
                    id="timePreset"
                    name="timePreset"
                    labelId="time-label"
                    label={t("moduleConfigs.chooseTimePeriod")}
                    size='small'
                    type="select"
                    variant='outlined'
                    fullWidth
                    onChange={({ target: { value: presetId } }: { target: { value: string } }) => {
                        if (presetId === customTime().id) {
                            const presetDates = config.timePreset && fromPreset(config.timePreset);
                            if (presetDates && presetDates.start && presetDates.end) {
                                handleDateChange(presetDates.start, "start");
                                handleDateChange(presetDates.end, "end");
                            }
                        }
                        setFieldChange("timePreset", presetId);
                    }}
                >
                    {timeRangePresets.map(p =>
                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    )}
                </Field>
            </FormControl>
            {timePreset === customTime().id && (
                <Grid container xs={12} >
                    <Grid item xs={6}>
                        <Field
                            as={KeyboardDatePicker}
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
                            value={start}
                            onChange={(date: Date) => handleDateChange(date, "start")}
                            style={{ margin: 0, marginRight: 8 }}
                            invalidDateMessage={t("moduleConfigs.invalidDateMessage")}
                            minDateMessage={t("moduleConfigs.minDateMessage")}
                            maxDateMessage={t("moduleConfigs.maxDateMessage")}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Field
                            as={KeyboardDatePicker}
                            allowKeyboardControl
                            views={['date']}
                            inputVariant="outlined"
                            format="dd/MM/yyyy"
                            margin="normal"
                            openTo='year'
                            id="end"
                            size='small'
                            variant='inline'
                            name="end"
                            label={t("moduleConfigs.end")}
                            value={end}
                            onChange={(date: Date) => handleDateChange(date, "end")}
                            style={{ margin: 0, marginLeft: 8 }}
                            invalidDateMessage={t("moduleConfigs.invalidDateMessage")}
                            minDateMessage={t("moduleConfigs.minDateMessage")}
                            maxDateMessage={t("moduleConfigs.maxDateMessage")}
                        />
                    </Grid>
                </Grid>
            )}
        </>
    )
}

export default TimePresetSelectorField;
