import { ReportModuleConfig } from "../../../../../models/Report";
import React, { useCallback, useEffect, useState } from "react";
import { Box, Divider, FormControlLabel, Grid, InputLabel, makeStyles, MenuItem, Select, Switch, TextField, Theme, Typography } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import FormControl from "@material-ui/core/FormControl";
import AggregatedCountView from "./AggregatedCountView";
import { useAuth } from "../../../../../providers/authProvider";
import { ConfigModuleProps, moduleTypes } from "../index";
import AutocompleteTags from "../../../../../components/inputs/AutocompleteTags";
import ProjectTag from "../../../../../models/ProjectTag";
import TagChip from "../../../../../components/TagChip";
import TimePresetSelectorField from "../../TimePresetSelectorFieldProps";
import { useProjectCrudListQuery } from "../../../../../hooks/useProjectQuery";
import Strategy, { PStatusRegistration } from "../../../../../models/Strategy";
import ConfigContainer from "../ConfigContainer";
import TimeUnitSelectorField from "../../TimeUnitSelectorFieldProps";
import { useTranslation } from "react-i18next";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import BarChart2FillIcon from "remixicon-react/BarChart2FillIcon";
import LineChartFillIcon from "remixicon-react/LineChartFillIcon";
import NiceDivider from "../../../../../components/visual/NiceDivider";
import { NEW_CHART_COLORS } from "../../../../../constants/ChartColors";

export const AggregatedCountConfig: React.FC<ConfigModuleProps> = ({ onSubmit, submitRef, editModuleConfig, setDateRangesValid }) => {
    const [slantedLabel, setSlantedLabel] = useState<boolean>(false);
    const [loadingChart, setLoading] = useState(false);

    const handleFieldChange = useCallback(async (name, value, setFieldValue) => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1)); // Simulate async operation
            setFieldValue(name, value);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (editModuleConfig?.slantedLabel !== undefined) {
            setSlantedLabel(editModuleConfig.slantedLabel);
        } else {
            setSlantedLabel(false);
        }
    }, [editModuleConfig?.slantedLabel]);

    const [labelOnInside, setlabelOnInside] = React.useState<boolean>(true);

    const [chartType, setChartType] = useState(editModuleConfig ? editModuleConfig.graphType?.toString() : "1");
    const useStyles = makeStyles((theme: Theme) => ({
        toggleButton: {
            '&.Mui-selected': {
                color: `${theme.palette.primary.main} !important`,
            },
        },
        switchBase: {
            '&.Mui-checked': {
                color: `${theme.palette.primary.main} !important`,
            },
            '&.Mui-checked + .MuiSwitch-track': {
                backgroundColor: `${theme.palette.primary.main} !important`,
            },
        },
    }));
    const classes = useStyles();

    useEffect(() => {
        if (editModuleConfig?.labelOnInside !== undefined) {
            setlabelOnInside(editModuleConfig.labelOnInside);
        } else {
            setlabelOnInside(true);
        }
    }, [editModuleConfig?.slantedLabel]);

    const [prevName, setPrevName] = React.useState("")
    const [prevReg, setPrevReg] = React.useState("")
    const project = useAuth().currentProject;
    const projectId = project?.id;
    const strategiesQuery = useProjectCrudListQuery(service => service.projectStrategies)

    const initialIsEmpty = true
    const [isEmpty, setIsEmpty] = React.useState<boolean>(editModuleConfig?.isEmpty ? !editModuleConfig?.isEmpty : initialIsEmpty);
    const { t } = useTranslation();
    const [input, setInput] = useState("");
    const handleInput = (v: string) => setInput(v);
    const handleSubmit = (values: Partial<ReportModuleConfig>) => {
        // Reset labels object to be empty
        const modifiedValues = {
            ...values,
            labels: {}, // Reset labels
        };
        // Call onSubmit with modified values
        onSubmit(modifiedValues);
    };
    if (strategiesQuery.query.isLoading) return <ConfigContainer loading />

    const strategies = strategiesQuery.query.data ?? [];
    if (strategies === undefined || strategies.length === 0) return <ConfigContainer message={t("moduleConfigs.noStrategies")} />

    const initialStrategy = strategies.find(s => s.effects.find(e => e.type === "count"));
    if (initialStrategy === undefined) return <ConfigContainer message={t("moduleConfigs.noCountStrategies")} />
    const initialReg = initialStrategy.effects.filter(e => e.type === "count")[0];

    const themeColors = project?.theme && Object.keys(project.theme).length > 0 ? project.theme : NEW_CHART_COLORS;

    const initialValues: Partial<ReportModuleConfig> = {
        type: moduleTypes.aggregatedCount,
        projectId: projectId,
        strategyId: initialStrategy.id,
        effectId: initialReg.id,
        tags: [],
        timePreset: "ThisMonth",
        name: initialReg.name,
        timeUnit: "Weekly",
        isEmpty: !initialIsEmpty,
        labelOnInside: true,
        graphType: 1,
        colors: themeColors
    }

    return (
        <ConfigContainer>
            <Formik<Partial<ReportModuleConfig>>
                onSubmit={handleSubmit}
                initialValues={editModuleConfig ? editModuleConfig : initialValues}
            >
                {({ values, setFieldValue }) => {
                    const wrappedSetFieldValue = (name: any, value: any) => handleFieldChange(name, value, setFieldValue);


                    const tags = values.tags as ProjectTag[];
                    const strategy = strategies.find(s => s.id === values.strategyId) as Strategy;
                    const registrations = strategy?.effects?.filter(e => e.type === "count");

                    const handleChange = (tags: ProjectTag[]) => wrappedSetFieldValue("tags", tags);
                    const handleDelete = (tag: ProjectTag) => () => handleChange(tags.filter(t => t.id !== tag.id));
                    return (
                        <Grid container xs={12} style={{ padding: "8px 0" }}>
                            <Grid item xs={5}>
                                <Typography variant='h4' style={{ paddingBottom: 10 }}>
                                    {t('moduleConfigs.generalTitle')}
                                </Typography>
                                <Form>
                                    <Grid direction="column" container xs={12}>
                                        <Grid item style={{ width: "100%" }}>
                                            <FormControl variant="outlined" fullWidth style={{ marginBottom: 10 }} size='small'>
                                                <InputLabel id="strategyId-label">{t("moduleConfigs.selectStrategy")}</InputLabel>
                                                <Field
                                                    as={Select}
                                                    id="strategyId"
                                                    name="strategyId"
                                                    labelId="strategyId-label"
                                                    label={t("moduleConfigs.selectStrategy")}
                                                    type="select"
                                                    onChange={(e: React.ChangeEvent<{ name?: string; value: string }>) => {
                                                        if (e.target.value !== values.strategyId) {
                                                            wrappedSetFieldValue("strategyId", e.target.value);
                                                            const newStrategy = strategies.find(s => s.id === e.target.value) as Strategy;
                                                            const newEffect = newStrategy.effects.filter(e => e.type === "status")[0] as PStatusRegistration;
                                                            wrappedSetFieldValue("category", newEffect?.category)
                                                            wrappedSetFieldValue("effectId", newEffect?.id);
                                                            const newName = newEffect && newEffect.category ? newEffect.category : '';
                                                            wrappedSetFieldValue("name", newName);
                                                            setPrevReg(newName);
                                                            setPrevName(newName);
                                                        }
                                                    }}
                                                >
                                                    {strategies.map(s =>
                                                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                                    )}
                                                </Field>
                                            </FormControl>
                                            <Box style={{ marginBottom: 10 }}>
                                                <AutocompleteTags
                                                    input={input}
                                                    onInputChange={handleInput}
                                                    tags={tags}
                                                    onChange={handleChange}
                                                    label={t("RegistrationFlowPage.ChooseCitizens.filterByTags")}
                                                    variant="outlined"
                                                />
                                                <Box style={{
                                                    marginTop: 10,
                                                }}>
                                                    {tags && tags.map(tag => <TagChip tag={tag} onDelete={handleDelete(tag)} />)}
                                                </Box>
                                            </Box>
                                            <FormControl variant="outlined" fullWidth style={{ marginBottom: 10 }} size='small'>
                                                <InputLabel id="effectId-label">{t("moduleConfigs.selectRegistration")}</InputLabel>
                                                <Field
                                                    as={Select}
                                                    id="effectId"
                                                    name="effectId"
                                                    labelId="effectId-label"
                                                    label={t("moduleConfigs.selectRegistration")}
                                                    type="select"
                                                    variant='outlined'
                                                    fullWidth
                                                    disabled={registrations?.length === 0}
                                                    onChange={(e: React.ChangeEvent<{ name?: string; value: string }>) => {
                                                        if (e.target.value !== values.effectId) {
                                                            wrappedSetFieldValue("effectId", e.target.value);
                                                        }
                                                        if (registrations.find((reg) => reg.name === values.name) || values.name === "" || initialValues.name === values.name || prevReg === prevName) {
                                                            setPrevReg(registrations.find((reg) => reg.id === e.target.value)?.name ?? "")
                                                            setPrevName(registrations.find((reg) => reg.id === e.target.value)?.name ?? "")
                                                            wrappedSetFieldValue("name", registrations.find((reg) => reg.id === e.target.value)?.name);
                                                        }
                                                    }}
                                                >
                                                    {registrations?.map(r =>
                                                        <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                                                    )}
                                                </Field>
                                            </FormControl>

                                            <Box>
                                                <TimePresetSelectorField
                                                    config={values}
                                                    setFieldChange={wrappedSetFieldValue}
                                                    datesValidity={setDateRangesValid}
                                                />
                                            </Box>
                                            <Box style={{ marginBottom: 10 }}>
                                                <TimeUnitSelectorField
                                                    config={values}
                                                    setFieldChange={wrappedSetFieldValue}
                                                />
                                            </Box>
                                            <Field
                                                as={TextField}
                                                id="name"
                                                name="name"
                                                size='small'
                                                labelId="name-label"
                                                label={t("moduleConfigs.name")}
                                                type="select"
                                                variant='outlined'
                                                fullWidth
                                                onChange={(e: React.ChangeEvent<{ name?: string; value: string }>) => {
                                                    setPrevName(e.target.value)
                                                    wrappedSetFieldValue("name", e.target.value);
                                                }}
                                                style={{ marginBottom: 10 }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <button aria-label="submit" type="submit" style={{ display: 'none' }}
                                        ref={submitRef} />
                                </Form>
                            </Grid>
                            <Grid item xs={1} style={{ display: "flex", justifyContent: "center" }}>
                                <Divider orientation="vertical" />
                            </Grid>
                            <Grid item xs={6} style={{ display: "flex", flexDirection: "column", height: '120%' }}>
                                <Grid
                                    item
                                    direction="column"
                                    xs={12}
                                    container
                                    justifyContent="space-evenly"
                                    alignItems="stretch"
                                    style={{ height: '100%' }}
                                >
                                    <Grid item xs style={{
                                        flex: 1,
                                        border: '1px solid #0A08121F',
                                        marginBottom: 18
                                    }}>
                                        <AggregatedCountView config={values as ReportModuleConfig} mode="review" />
                                    </Grid>
                                    <Grid alignContent="flex-start" container item xs style={{ flex: 1 }}>
                                        <Grid>
                                            <Typography variant='h4' style={{ paddingBottom: 10 }}>
                                                {t('moduleConfigs.customization')}
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            item
                                            container
                                            alignItems="center"
                                            justifyContent="flex-start"
                                            style={{ paddingBottom: 8 }}
                                        >
                                            <Grid item>
                                                <ToggleButtonGroup
                                                    orientation="horizontal"
                                                    exclusive
                                                    value={chartType}
                                                    onChange={(e, value) => {
                                                        if (value !== null) {
                                                            setChartType(value);
                                                            wrappedSetFieldValue("graphType", parseInt(value, 10));
                                                        }
                                                    }}
                                                >
                                                    <ToggleButton value="1" classes={{ root: classes.toggleButton }}>
                                                        <BarChart2FillIcon />
                                                    </ToggleButton>
                                                    <ToggleButton value="2" classes={{ root: classes.toggleButton }}>
                                                        <LineChartFillIcon />
                                                    </ToggleButton>
                                                </ToggleButtonGroup>
                                            </Grid>
                                        </Grid>
                                        <Grid xs={12} style={{ margin: "6px 0" }}>
                                            <NiceDivider style={{ backgroundColor: "#0A08121F", margin: 0, height: 1 }} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={labelOnInside}
                                                        onChange={(event) => {
                                                            const isChecked = event.target.checked;
                                                            setlabelOnInside(isChecked);
                                                            wrappedSetFieldValue("labelOnInside", isChecked);
                                                        }}
                                                        name="labelOnInside"
                                                        classes={{ switchBase: classes.switchBase }}
                                                    />
                                                }
                                                label={t("moduleConfigs.labelLocation")}
                                                labelPlacement="end"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={slantedLabel}
                                                        onChange={(event) => {
                                                            const isChecked = event.target.checked;
                                                            setSlantedLabel(isChecked);
                                                            wrappedSetFieldValue("slantedLabel", isChecked);
                                                        }}
                                                        name="slantedLabel"
                                                        classes={{ switchBase: classes.switchBase }}
                                                    />
                                                }
                                                label={t("moduleConfigs.slantedLabel")}
                                                labelPlacement="end"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={isEmpty}
                                                        onChange={(event) => {
                                                            const isChecked = !event.target.checked;
                                                            setIsEmpty(!isChecked);
                                                            wrappedSetFieldValue("isEmpty", isChecked);
                                                        }}
                                                        name="isEmpty"
                                                        classes={{ switchBase: classes.switchBase }}
                                                    />}
                                                label={isEmpty ? t("moduleConfigs.doNotShowEmptyDataPoints") : t("moduleConfigs.showEmptyDataPoints")}
                                                labelPlacement="end"
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                }}
            </Formik>
        </ConfigContainer>
    )
}

export default AggregatedCountConfig;