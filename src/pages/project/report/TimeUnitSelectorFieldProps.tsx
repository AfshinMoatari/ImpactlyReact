import FormControl from "@material-ui/core/FormControl";
import {InputLabel, MenuItem, Select} from "@material-ui/core";
import {Field} from "formik";
import {TimeUnitTemp} from "../../../lib/data/createTimeFormatter";
import React, {useState, useEffect} from "react";
import {ReportModuleConfig} from "../../../models/Report";
import {FormikHelpers} from "formik/dist/types";
import {useTranslation} from "react-i18next";


interface TimeUnitSelectorFieldProps {
    config: Partial<ReportModuleConfig>;
    setFieldChange: FormikHelpers<Partial<ReportModuleConfig>>["setFieldValue"];
}

const TimeUnitSelectorField: React.FC<TimeUnitSelectorFieldProps> = ({config, setFieldChange}) => {
    const [timeFrequencyOptions, setTimeFrequencyOptions] = useState(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually']);
    const { t, i18n: i18nInstance } = useTranslation();
    const timeUnitTemp = TimeUnitTemp(i18nInstance);

    useEffect(() => {
        const selectedPreset = config.timePreset;

        if (selectedPreset === 'ThisWeek') {
            setTimeFrequencyOptions(['Daily', 'Weekly']);
        } else if (selectedPreset === 'LastWeek') {
            setTimeFrequencyOptions(['Daily', 'Weekly']);
        } else if (selectedPreset === 'ThisMonth') {
            setTimeFrequencyOptions(['Daily', 'Weekly', 'Monthly']);
        } else if (selectedPreset === 'LastMonth') {
            setTimeFrequencyOptions(['Daily', 'Weekly', 'Monthly']);
        } else if (selectedPreset === 'ThisQuarter') {
            setTimeFrequencyOptions(['Daily', 'Weekly', 'Monthly', 'Quarterly']);
        } else if (selectedPreset === 'LastQuarter') {
            setTimeFrequencyOptions(['Daily', 'Weekly', 'Monthly', 'Quarterly']);
        } else if (selectedPreset === 'ThisYear') {
            setTimeFrequencyOptions(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual']);
        } else if (selectedPreset === 'LastYear') {
            setTimeFrequencyOptions(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual']);
        } else {
            setTimeFrequencyOptions(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual']);
        }
    }, [config.timePreset]);

    return (
        <FormControl variant="outlined" fullWidth style={{marginTop: 16}} size='small'>
            <InputLabel id="timeUnit-label">{t("moduleConfigs.chooseFrequency")}</InputLabel>
            <Field
                as={Select}
                id="timeUnit"
                name="timeUnit"
                labelId="timeUnit-label"
                label={t("moduleConfigs.chooseFrequency")}
                variant='outlined'
                fullWidth
                onChange={(e: any) => {
                    setFieldChange("timeUnit", e.target.value.toString());
                }}
                value={config?.timeUnit}
            >
                {timeFrequencyOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                        {timeUnitTemp[option]}
                    </MenuItem>
                ))}
            </Field>
        </FormControl>
    )
}

export default TimeUnitSelectorField;


