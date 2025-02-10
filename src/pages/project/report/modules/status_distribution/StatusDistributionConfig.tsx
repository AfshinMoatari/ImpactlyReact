import { ReportModuleConfig } from "../../../../../models/Report";
import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Divider, Grid, InputLabel, makeStyles, MenuItem, Select, TextField, Theme, Typography } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import FormControl from "@material-ui/core/FormControl";
import StatusDistributionView from "./StatusDistributionView";
import { useAuth } from "../../../../../providers/authProvider";
import { ConfigModuleProps, moduleTypes } from "../index";
import AutocompleteTags from "../../../../../components/inputs/AutocompleteTags";
import ProjectTag from "../../../../../models/ProjectTag";
import TagChip from "../../../../../components/TagChip";
import { useProjectCrudListQuery } from "../../../../../hooks/useProjectQuery";
import Strategy, { PStatusRegistration } from "../../../../../models/Strategy";
import ConfigContainer from "../ConfigContainer";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { IconButton } from "@material-ui/core";
import DeleteIcon from "remixicon-react/DeleteBinLineIcon";
import { useTranslation } from "react-i18next";
import { areStatusDatesValid } from "../../../../../lib/date/dateValidation";
import { FormControlLabel, Switch, ToggleButton, ToggleButtonGroup } from "@mui/material";
import BarChart2FillIcon from "remixicon-react/BarChart2FillIcon";
import Number1Icon from "remixicon-react/Number1Icon";
import PercentFillIcon from "remixicon-react/PercentFillIcon";
import PieChart2FillIcon from "remixicon-react/PieChart2FillIcon";
import NiceDivider from "../../../../../components/visual/NiceDivider";
import { NEW_CHART_COLORS } from "../../../../../constants/ChartColors";


export const StatusDistributionConfig: React.FC<ConfigModuleProps> = ({ onSubmit, submitRef, editModuleConfig, setDateRangesValid }) => {
    const [prevName, setPrevName] = React.useState("")
    const [prevReg, setPrevReg] = React.useState("")
    const project = useAuth().currentProject;
    const projectId = project?.id as string;
    const strategiesQuery = useProjectCrudListQuery(service => service.projectStrategies)
    const { t } = useTranslation();

    const initialTimeSeries = [new Date()]

    const [endDates, setEndDates] = useState<(Date | null)[]>(editModuleConfig?.endDates ? editModuleConfig.endDates : initialTimeSeries);

    const initialSlantedLabel = false;
    const initialIsEmpty = true;
    const [slantedLabel, setSlantedLabel] = useState<boolean>(false);

    const [chartType, setChartType] = useState(editModuleConfig ? editModuleConfig.graphType?.toString() : "1");
    const [pointType, setPointType] = useState(editModuleConfig ? editModuleConfig.pointSystemType : "Point");
    const [loadingChart, setLoading] = useState(false);

    const handleFieldChange = useCallback(async (name, value, wrappedSetFieldValue) => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1)); // Simulate async operation
            wrappedSetFieldValue(name, value);
        } finally {
            setLoading(false);
        }
    }, []);

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
        if (editModuleConfig?.slantedLabel !== undefined) {
            setSlantedLabel(editModuleConfig.slantedLabel);
        } else {
            setSlantedLabel(false);
        }
    }, [editModuleConfig?.slantedLabel]);

    const [labelOnInside, setlabelOnInside] = React.useState<boolean>(true);

    useEffect(() => {
        if (editModuleConfig?.labelOnInside !== undefined) {
            setlabelOnInside(editModuleConfig.labelOnInside);
        } else {
            setlabelOnInside(true);
        }
    }, [editModuleConfig?.slantedLabel]);
    //Hiding the toggle Empty data points functuinality for now due to a sorting issue #585
    // const [isEmpty, setIsEmpty] = React.useState<boolean>(editModuleConfig?.isEmpty ? !editModuleConfig?.isEmpty : initialIsEmpty);

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

    // const initialTimeSeries = [new Date()]

    // const [endDates, setEndDates] = useState<(Date | null)[]>(editModuleConfig?.endDates ? editModuleConfig.endDates : initialTimeSeries);

    useEffect(() => {
        const isValid = areStatusDatesValid(endDates);
        setDateRangesValid(isValid);
    }, [endDates]);

    if (strategiesQuery.query.isLoading) return <ConfigContainer loading />

    const strategies = strategiesQuery.query.data ?? [];
    if (strategies === undefined || strategies.length === 0) return <ConfigContainer message={t("moduleConfigs.noStrategies")} />


    const initialStrategy = strategies.find(s => s.effects.find(e => e.type === "status"));
    if (initialStrategy === undefined) return <ConfigContainer message={t("moduleConfigs.noStrategyWithStatus")} />
    const initialReg = initialStrategy.effects.filter(e => e.type === "status")[0] as PStatusRegistration;

    const themeColors = project?.theme && Object.keys(project.theme).length > 0 ? project.theme : NEW_CHART_COLORS;

    const initialValues: Partial<ReportModuleConfig> = {
        type: moduleTypes.statusDistribution,
        projectId: projectId,
        strategyId: initialStrategy.id,
        category: initialReg.category,
        graphType: 1,
        tags: [],
        endDates: initialTimeSeries,
        name: initialReg.category,
        effects: initialStrategy.effects,
        isEmpty: !initialIsEmpty,
        pointSystemType: "Point",
        labelOnInside: true,
        slantedLabel: initialSlantedLabel,
        customGuideLabel: { 0: '' },
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
                    const statusEffects = strategy.effects.filter(e => e.type === "status") as PStatusRegistration[];
                    const categories = Object.values(statusEffects.reduce((p, c) => {
                        p[c.category] = c.category;
                        return p;
                    }, {} as { [p: string]: string }))
                    const handleChange = (tags: ProjectTag[]) => wrappedSetFieldValue("tags", tags);
                    const handleDelete = (tag: ProjectTag) => () => handleChange(tags.filter(t => t.id !== tag.id));

                    const handleDateChange = (date: Date, index: number, wrappedSetFieldValue: (field: string, value: any) => void) => {
                        if (date) {
                            // Set the time to 12:00 PM (noon)
                            date.setHours(12, 0, 0, 0);
                        }

                        // Update the dates array with the new date
                        const newEndDates = endDates.map((currentDate, currentIndex) => {
                            return currentIndex === index ? date : currentDate;
                        });

                        setEndDates(newEndDates);
                        wrappedSetFieldValue('endDates', newEndDates);
                    };

                    const handleCustomGuideLabelToggle = (
                        index: number,
                        wrappedSetFieldValue: (field: string, value: any) => void,
                        values: Partial<ReportModuleConfig>
                    ) => {
                        const updatedCustomGuideLabel = { ...values.customGuideLabel };

                        if (updatedCustomGuideLabel[index]) {
                            delete updatedCustomGuideLabel[index];
                        } else {
                            updatedCustomGuideLabel[index] = ' ';
                        }

                        wrappedSetFieldValue('customGuideLabel', updatedCustomGuideLabel);
                    };

                    const handleLabelCustomGuideLabel = (e: React.ChangeEvent<HTMLInputElement>, index: number, wrappedSetFieldValue: (field: string, value: any) => void) => {
                        const { value } = e.target;
                        wrappedSetFieldValue(`customGuideLabel.${index}`, value);
                    };

                    const handleAddTimeseries = (
                        wrappedSetFieldValue: (field: string, value: any) => void,
                        endDates: Date[] = [],
                        customGuideLabel: { [key: number]: string } = {}
                    ) => {
                        const newIndex = endDates.length;
                        const newEndDate = new Date();

                        // Add the new date range to the list
                        const updatedEndDates = [...endDates, newEndDate];

                        // Initialize the new customGuideLabel entry
                        const updatedCustomGuideLabel = { ...customGuideLabel, [newIndex]: "" };

                        // Update Formik values
                        setEndDates(prevState => [...prevState, null]);
                        wrappedSetFieldValue('endDates', updatedEndDates);
                        wrappedSetFieldValue('customGuideLabel', updatedCustomGuideLabel);
                    };

                    const handleDeleteTimeseries = (
                        index: number,
                        wrappedSetFieldValue: (field: string, value: any) => void,
                        endDates: Date[] = [],
                        customGuideLabel: { [key: number]: string } = {}
                    ) => {
                        // Remove the date range at the specified index
                        const newEndDates = endDates.filter((_, i) => i !== index);

                        // Create a new customGuideLabel object with updated indices
                        const updatedCustomGuideLabel: { [key: number]: string } = {};
                        newEndDates.forEach((_, i) => {
                            // Map existing labels to their new indices
                            if (customGuideLabel[i + (i >= index ? 1 : 0)] !== undefined) {
                                updatedCustomGuideLabel[i] = customGuideLabel[i + (i >= index ? 1 : 0)];
                            }
                        });

                        // Update the form values with the new arrays
                        setEndDates(prevState => prevState.filter((_, i) => i !== index));
                        wrappedSetFieldValue('endDates', newEndDates);
                        wrappedSetFieldValue('customGuideLabel', updatedCustomGuideLabel);
                    };


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
                                                <InputLabel id="category-label">{t("moduleConfigs.chooseStatus")}</InputLabel>
                                                <Field
                                                    as={Select}
                                                    id="category"
                                                    name="category"
                                                    labelId="category-label"
                                                    label={t("moduleConfigs.chooseStatus")}
                                                    type="select"
                                                    disabled={categories.length === 0}
                                                    onChange={(e: React.ChangeEvent<{ name?: string; value: string }>) => {
                                                        if (e.target.value !== values.category) {
                                                            wrappedSetFieldValue("category", e.target.value);
                                                        }
                                                        if (categories.find((name) => name == values.name) || values.name === "" || initialValues.name === values.name || prevReg === prevName) {
                                                            setPrevReg(categories.find((cat) => cat === e.target.value) ?? "")
                                                            setPrevName(categories.find((cat) => cat === e.target.value) ?? "")
                                                            wrappedSetFieldValue("name", categories.find((cat) => cat === e.target.value));
                                                        }
                                                    }}
                                                >
                                                    {categories.map(cat =>
                                                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                                    )}
                                                </Field>
                                            </FormControl>
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
                                        <Grid item style={{ margin: "12px 0" }}>
                                            <NiceDivider style={{ backgroundColor: "#0A08121F", margin: 0, height: 1 }} />
                                        </Grid>
                                        <Grid item>
                                            {endDates.map((date, index) => (
                                                <Box style={{ margin: "22px 0" }}>
                                                    <Grid container item xs={12} style={{ paddingRight: 10 }}>
                                                        <span style={{ fontWeight: 'bold' }}>{t("moduleConfigs.timeInterval", { count: index + 1 })}</span>
                                                        {endDates.length > 1 && <IconButton
                                                            aria-label="delete"
                                                            onClick={() => { handleDeleteTimeseries(index, wrappedSetFieldValue, endDates as Date[], values.customGuideLabel); }}
                                                            style={{ width: 20, padding: 0, marginRight: 15, float: "right" }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>}
                                                        <Field
                                                            as={KeyboardDatePicker}
                                                            allowKeyboardControl
                                                            fullWidth
                                                            autoOk
                                                            size='small'
                                                            views={['date']}
                                                            inputVariant="outlined"
                                                            format="dd/MM/yyyy"
                                                            openTo='year'
                                                            id={`end-${index}`}
                                                            variant='inline'
                                                            name={`end-${index}`}
                                                            label={t("moduleConfigs.pointInTime")}
                                                            value={date}
                                                            onChange={(date: Date) => handleDateChange(date, index, wrappedSetFieldValue)}
                                                            style={{ margin: 0, marginTop: 10 }}
                                                            emptyLabel={t("moduleConfigs.chooseDate")}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={!!values.customGuideLabel?.[index]}
                                                                    onChange={() => handleCustomGuideLabelToggle(index, wrappedSetFieldValue, values)}
                                                                    name={`customGuideLabel.${index}`}
                                                                    color="primary"
                                                                />
                                                            }
                                                            label={t("moduleConfigs.customGuideLabelSwitch")}
                                                            labelPlacement="end"
                                                        />
                                                        {!!values.customGuideLabel?.[index] && (
                                                            <Field
                                                                as={TextField}
                                                                id={`customGuideLabel.${index}`}
                                                                name={`customGuideLabel.${index}`}
                                                                size="small"
                                                                label={t("moduleConfigs.customGuideLabel")}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLabelCustomGuideLabel(e, index, wrappedSetFieldValue)}
                                                                value={values.customGuideLabel[index] || ""}
                                                                variant="outlined"
                                                                fullWidth
                                                                margin="normal"
                                                                error={false}
                                                            />
                                                        )}
                                                    </Grid>
                                                </Box>
                                            ))}
                                            <Button
                                                onClick={() => handleAddTimeseries(wrappedSetFieldValue, values.endDates as Date[], values.customGuideLabel)}
                                                style={{ fontWeight: 600, color: "#ED4C2F" }}>
                                                {t('moduleConfigs.addTimeInterval')}
                                            </Button>
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
                                        {loadingChart ? (
                                            null
                                        ) : (
                                            <StatusDistributionView config={values as ReportModuleConfig} mode="review" />
                                        )}
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
                                                        <PieChart2FillIcon />
                                                    </ToggleButton>
                                                </ToggleButtonGroup>
                                            </Grid>
                                            <Grid
                                                style={{ paddingLeft: 18 }}
                                                item>
                                                <ToggleButtonGroup
                                                    orientation="horizontal"
                                                    exclusive
                                                    value={pointType}
                                                    onChange={(e, value: string) => {
                                                        if (value !== null) {
                                                            setPointType(value);
                                                            wrappedSetFieldValue("pointSystemType", value);
                                                        }
                                                    }}
                                                >
                                                    <ToggleButton value="Point" classes={{ root: classes.toggleButton }}>
                                                        <Number1Icon />
                                                    </ToggleButton>
                                                    <ToggleButton value="Percentage" classes={{ root: classes.toggleButton }}>
                                                        <PercentFillIcon />
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

export default StatusDistributionConfig;