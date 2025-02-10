import { ReportModuleConfig } from "../../../../../models/Report";
import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Divider, Grid, IconButton, InputLabel, makeStyles, MenuItem, Select, TextField, Theme, Typography } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import FormControl from "@material-ui/core/FormControl";
import MethodGraphView from "./MethodGraphView";
import { useAuth } from "../../../../../providers/authProvider";
import { ConfigModuleProps, moduleTypes } from "../index";
import AutocompleteTags from "../../../../../components/inputs/AutocompleteTags";
import ProjectTag from "../../../../../models/ProjectTag";
import TagChip from "../../../../../components/TagChip";
import ConfigContainer from "../ConfigContainer";
import { useTemplateSurveys } from "../../../../../hooks/useSurveys";
import { useAppServices } from "../../../../../providers/appServiceProvider";
import DeleteIcon from "remixicon-react/DeleteBinLineIcon";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { DateRange } from "../../../../../models/Report";
import { useProjectCrudListQuery } from "../../../../../hooks/useProjectQuery";
import Strategy from "../../../../../models/Strategy";
import { useTranslation } from "react-i18next";
import { isSurveyDateRangeValid } from "../../../../../lib/date/dateValidation";
import { FormControlLabel, Switch, ToggleButton, ToggleButtonGroup } from "@mui/material";
import BarChart2FillIcon from "remixicon-react/BarChart2FillIcon";
import LineChartFillIcon from "remixicon-react/LineChartFillIcon";
import NiceDivider from "../../../../../components/visual/NiceDivider";
import { NEW_CHART_COLORS } from "../../../../../constants/ChartColors";

export const MethodGraphConfig: React.FC<ConfigModuleProps> = ({ onSubmit, submitRef, editModuleConfig, setDateRangesValid }) => {
    const project = useAuth().currentProject;
    const projectId = project?.id as string;
    const services = useAppServices();
    const [surveys, loading] = useTemplateSurveys(projectId, services);
    const strategiesQuery = useProjectCrudListQuery(service => service.projectStrategies)
    const { t } = useTranslation();
    const [slantedLabel, setSlantedLabel] = useState<boolean>(false);
    const [isExcludeOnlyOneAnswer, setExcludeOnlyOneAnswer] = useState<boolean>(false);
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

    const [chartType, setChartType] = useState(editModuleConfig ? editModuleConfig.graphType?.toString() : "1");

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

    const [input, setInput] = useState("");
    const handleInput = (v: string) => setInput(v);

    const initialDateRange: DateRange[] = [{
        start: new Date(),
        end: new Date(),
    }];

    const [dateRanges, setDateRanges] = useState(
        editModuleConfig?.dateRanges?.map(range => ({
            start: range.start || new Date(),
            end: range.end || new Date()
        })) || initialDateRange
    );
    //this useEffect is to validate of the dateRanges are valid, if not it will disable the Add Module button
    useEffect(() => {
        const isValid = isSurveyDateRangeValid(dateRanges);
        setDateRangesValid(isValid);
    }, [dateRanges, setDateRangesValid]);

    if (loading || surveys.length === 0) return (
        <ConfigContainer
            loading
            error={surveys.length === 0}
            message={t("moduleConfigs.noSurveys")}
        />
    )

    const handleSubmit = (values: Partial<ReportModuleConfig>) => {
        // Reset labels object to be empty
        const modifiedValues = {
            ...values,
            labels: {}, // Reset labels
        };
        // Call onSubmit with modified values
        onSubmit(modifiedValues);
    };

    const strategies = strategiesQuery.query.data ?? [];
    const strategiesWithValidatedSurveys = strategies.filter(strategy => strategy.surveys.some(survey => survey.validated === true));
    if (strategies === undefined || strategies.length === 0) return <ConfigContainer message={t("moduleConfigs.noStrategies")} />
    const initialStrategy = strategiesWithValidatedSurveys[0];
    if (initialStrategy === undefined) return <ConfigContainer message={t("moduleConfigs.noStrategyWithValidated")} />

    const handleDateChange = (newDate: Date, index: number, isStartDate: any, wrappedSetFieldValue: any) => {
        if (newDate) {
            newDate.setHours(12, 0, 0, 0); // Set hours to avoid time issues
        }

        // Update Formik values
        const dateField = `dateRanges.${index}.${isStartDate ? 'start' : 'end'}`;

        wrappedSetFieldValue(dateField, newDate);

        // Update local state
        setDateRanges(prevDateRanges => {
            const updatedDateRanges = [...prevDateRanges];
            updatedDateRanges[index] = {
                ...updatedDateRanges[index],
                [isStartDate ? 'start' : 'end']: newDate
            };
            return updatedDateRanges;
        });
    };

    const themeColors = project?.theme && Object.keys(project.theme).length > 0 ? project.theme : NEW_CHART_COLORS;

    const initialSurveyId = surveys.sort((a, b) => a.name.localeCompare(b.name))[0]?.id;
    const initialValues = {
        type: moduleTypes.methodGraph,
        strategyId: initialStrategy.id,
        projectId: projectId,
        surveyId: initialSurveyId,
        tags: [],
        dateRanges: initialDateRange,
        name: surveys[0]?.name,
        pointSystemType: "Point",
        graphType: 1,
        labelOnInside: true,
        customGuideLabel: { 0: '' },
        colors: themeColors
    }

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

    const handleAddDateRange = (
        wrappedSetFieldValue: (field: string, value: any) => void,
        dateRanges: DateRange[] = [],
        customGuideLabel: { [key: number]: string } = {}
    ) => {
        const newIndex = dateRanges.length;
        const newDateRange = {
            start: null,
            end: null,
        };

        // Add the new date range to the list
        const updatedDateRanges = [...dateRanges, newDateRange];

        // Initialize the new customGuideLabel entry
        const updatedCustomGuideLabel = { ...customGuideLabel, [newIndex]: "" };

        // Update Formik values
        setDateRanges(prevState => [...prevState, { start: null, end: null }]);
        wrappedSetFieldValue('dateRanges', updatedDateRanges);
        wrappedSetFieldValue('customGuideLabel', updatedCustomGuideLabel);
    };

    const handleDeleteDateRange = (
        index: number,
        wrappedSetFieldValue: (field: string, value: any) => void,
        dateRanges: DateRange[] = [],
        customGuideLabel: { [key: number]: string } = {}
    ) => {
        // Remove the date range at the specified index
        const newDateRanges = dateRanges.filter((_, i) => i !== index);

        // Create a new customGuideLabel object with updated indices
        const updatedCustomGuideLabel: { [key: number]: string } = {};
        newDateRanges.forEach((_, i) => {
            // Map existing labels to their new indices
            if (customGuideLabel[i + (i >= index ? 1 : 0)] !== undefined) {
                updatedCustomGuideLabel[i] = customGuideLabel[i + (i >= index ? 1 : 0)];
            }
        });

        // Update the form values with the new arrays
        setDateRanges(prevState => prevState.filter((_, i) => i !== index));
        wrappedSetFieldValue('dateRanges', newDateRanges);
        wrappedSetFieldValue('customGuideLabel', updatedCustomGuideLabel);
    };

    return (
        <ConfigContainer>
            <Formik<Partial<ReportModuleConfig>>
                onSubmit={handleSubmit}
                initialValues={editModuleConfig ? editModuleConfig : initialValues}
            >
                {({ values, setFieldValue }) => {
                    const wrappedSetFieldValue = (name: any, value: any) => handleFieldChange(name, value, setFieldValue);


                    const tags = values.tags ?? [] as ProjectTag[];
                    const curStrategy: Strategy | undefined = strategies.find((strategy) => strategy.id === values.strategyId);
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
                                                    variant='outlined'
                                                    fullWidth
                                                    onChange={(e: React.ChangeEvent<{ name?: string; value: string }>) => {
                                                        if (e.target.value !== values.strategyId) {
                                                            wrappedSetFieldValue("strategyId", e.target.value);
                                                            const curSurvey = strategies.find((strategy) =>
                                                                strategy.id === e.target.value)?.surveys.find((survey) =>
                                                                    survey.validated === true) ?? null;
                                                            wrappedSetFieldValue("surveyId", curSurvey?.id);
                                                        }
                                                    }}
                                                >
                                                    {strategiesWithValidatedSurveys.map(s =>
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
                                                <InputLabel id="surveyId-label">{t("moduleConfigs.selectSurvey")}</InputLabel>
                                                <Field
                                                    as={Select}
                                                    id="survey"
                                                    name="surveyId"
                                                    labelId="survey-label"
                                                    label={t("moduleConfigs.selectSurvey")}
                                                    type="select"
                                                    variant='outlined'
                                                    onChange={(e: React.ChangeEvent<{ name?: string; value: string }>) => {
                                                        if (e.target.value !== values.surveyId) {
                                                            wrappedSetFieldValue("surveyId", e.target.value);
                                                        }
                                                    }}
                                                >
                                                    {curStrategy?.surveys.sort((a, b) => a.name.localeCompare(b.name)).map(s => {
                                                        if (s.validated) {
                                                            return <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                                        }
                                                    }
                                                    )}
                                                </Field>
                                            </FormControl>
                                            <Field
                                                as={TextField}
                                                id="name"
                                                name="name"
                                                labelId="name-label"
                                                label={t("moduleConfigs.name")}
                                                size='small'
                                                type="select"
                                                variant='outlined'
                                                fullWidth
                                                style={{ marginTop: 10 }}
                                            />

                                        </Grid>
                                        <Grid item style={{ margin: "12px 0" }}>
                                            <NiceDivider style={{ backgroundColor: "#0A08121F", margin: 0, height: 1 }} />
                                        </Grid>
                                        <Grid item>
                                            {values.dateRanges?.map((date, index) => (
                                                <Box style={{ margin: "22px 0" }}>
                                                    <span style={{ fontWeight: 'bold' }}>{t("moduleConfigs.timeInterval", { count: index + 1 })}</span>
                                                    {(values.dateRanges ?? []).length > 1 && <IconButton
                                                        aria-label="add"
                                                        onClick={() => handleDeleteDateRange(index, wrappedSetFieldValue, values.dateRanges, values.customGuideLabel)}
                                                        style={{ width: 20, padding: 0, marginRight: 15, float: "right" }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>}
                                                    <Grid container item xs={12} style={{ paddingRight: 10 }}>
                                                        <Grid item xs={6}>
                                                            <Field
                                                                as={KeyboardDatePicker}
                                                                autoOk
                                                                allowKeyboardControl
                                                                views={['date']}
                                                                inputVariant="outlined"
                                                                format="dd/MM/yyyy"
                                                                size='small'
                                                                margin="normal"
                                                                openTo='year'
                                                                id="start"
                                                                variant='inline'
                                                                name="start"
                                                                label={t("moduleConfigs.start")}
                                                                value={date.start}
                                                                validateOnChange={true}
                                                                onChange={(date: Date) => handleDateChange(date, index, true, wrappedSetFieldValue)}
                                                                style={{ margin: 0, marginTop: 16 }}
                                                                invalidDateMessage={t("moduleConfigs.invalidDateMessage")}
                                                                minDateMessage={t("moduleConfigs.minDateMessage")}
                                                                maxDateMessage={t("moduleConfigs.maxDateMessage")}
                                                                emptyLabel={t("moduleConfigs.chooseStartDate")}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6} style={{ paddingLeft: 10 }}>
                                                            <Field
                                                                as={KeyboardDatePicker}
                                                                allowKeyboardControl
                                                                views={['date']}
                                                                inputVariant="outlined"
                                                                format="dd/MM/yyyy"
                                                                size='small'
                                                                minDate={date.start}
                                                                margin="normal"
                                                                openTo='year'
                                                                id="end"
                                                                variant='inline'
                                                                name="end"
                                                                label={t("moduleConfigs.end")}
                                                                value={date.end}
                                                                validateOnChange={true}
                                                                onChange={(date: Date) => handleDateChange(date, index, false, wrappedSetFieldValue)}
                                                                style={{ margin: 0, marginTop: 16 }}
                                                                invalidDateMessage={t("moduleConfigs.invalidDateMessage")}
                                                                minDateMessage={t("moduleConfigs.minDateMessage")}
                                                                maxDateMessage={t("moduleConfigs.maxDateMessage")}
                                                                emptyLabel={t("moduleConfigs.chooseEndDate")}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={!!values.customGuideLabel?.[index]}
                                                                    onChange={() => handleCustomGuideLabelToggle(index, wrappedSetFieldValue, values)}
                                                                    name={`customGuideLabel.${index}`}
                                                                    color="primary"
                                                                    classes={{ switchBase: classes.switchBase }}
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
                                                onClick={() => handleAddDateRange(wrappedSetFieldValue, values.dateRanges, values.customGuideLabel)}
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
                                            <MethodGraphView config={{ ...values, tags } as ReportModuleConfig} mode="review" />
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
                                                        checked={isExcludeOnlyOneAnswer}
                                                        onChange={(event) => {
                                                            const isChecked = event.target.checked;
                                                            setExcludeOnlyOneAnswer(isChecked);
                                                            wrappedSetFieldValue("isExcludeOnlyOneAnswer", isChecked);
                                                        }}
                                                        name="isExcludeOnlyOneAnswer"
                                                        classes={{ switchBase: classes.switchBase }}
                                                    />
                                                }
                                                label={t("moduleConfigs.isExcludeOnlyOneAnswer")}
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

export default MethodGraphConfig;