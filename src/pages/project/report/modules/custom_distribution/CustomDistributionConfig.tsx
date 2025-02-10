import { ReportModuleConfig } from "../../../../../models/Report";
import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Divider, FormControlLabel, Grid, IconButton, InputLabel, makeStyles, MenuItem, Select, Switch, TextField, Theme, Typography } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import FormControl from "@material-ui/core/FormControl";
import CustomDistributionView from "./CustomDistributionView";
import { useAuth } from "../../../../../providers/authProvider";
import { ConfigModuleProps, moduleTypes } from "../index";
import AutocompleteTags from "../../../../../components/inputs/AutocompleteTags";
import ProjectTag from "../../../../../models/ProjectTag";
import TagChip from "../../../../../components/TagChip";
import { useProjectSurveys } from "../../../../../hooks/useSurveys";
import { useAppServices } from "../../../../../providers/appServiceProvider";
import { Survey, SurveyField } from "../../../../../models/Survey";
import ConfigContainer from "../ConfigContainer";
import { useProjectCrudListQuery } from "../../../../../hooks/useProjectQuery";
import Strategy from "../../../../../models/Strategy";
import BarChart2FillIcon from "remixicon-react/BarChart2FillIcon";
import PieChart2FillIcon from "remixicon-react/PieChart2FillIcon";
import PercentFillIcon from "remixicon-react/PercentFillIcon";
import Number1Icon from "remixicon-react/Number1Icon";
import DeleteIcon from "remixicon-react/DeleteBinLineIcon";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { DateRange } from "../../../../../models/Report";
import { useTranslation } from "react-i18next";
import { isSurveyDateRangeValid } from "../../../../../lib/date/dateValidation"
import NiceDivider from "../../../../../components/visual/NiceDivider";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import { NEW_CHART_COLORS } from "../../../../../constants/ChartColors";


export const CustomDistributionConfig: React.FC<ConfigModuleProps> = ({
    onSubmit,
    submitRef,
    editModuleConfig,
    setDateRangesValid
}) => {
    const [selectedScale, setSelectedScale] = useState<number>(editModuleConfig?.likertScale || 0);
    const [prevName, setPrevName] = React.useState("")
    const [prevReg, setPrevReg] = React.useState("")
    const project = useAuth().currentProject;
    const projectId = project?.id as string;
    const strategiesQuery = useProjectCrudListQuery(service => service.projectStrategies)
    const [slantedLabel, setSlantedLabel] = useState<boolean>(false);
    const [chartType, setChartType] = useState(editModuleConfig ? editModuleConfig.graphType?.toString() : "1");
    const [pointType, setPointType] = useState(editModuleConfig ? editModuleConfig.pointSystemType : "Point");
    const [isAverageScore, setIsAverageScore] = useState(editModuleConfig ? editModuleConfig.isAverageScore : false);
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
    }, [editModuleConfig?.labelOnInside]);

    const initialIsEmpty = true
    //Hiding the toggle Empty data points functuinality for now due to a sorting issue #585
    // const [isEmpty, setIsEmpty] = React.useState<boolean>(editModuleConfig?.isEmpty ? !editModuleConfig?.isEmpty : initialIsEmpty);

    const services = useAppServices();
    const projectSurveyQuery = useProjectSurveys(projectId, services);
    const loading = projectSurveyQuery.query.isLoading;
    const surveys = projectSurveyQuery.surveys;
    const [input, setInput] = useState("");
    const handleInput = (v: string) => setInput(v);
    const { t } = useTranslation();

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

    const [isExcludeOnlyOneAnswer, setExcludeOnlyOneAnswer] = useState(editModuleConfig ? editModuleConfig.isExcludeOnlyOneAnswer : false);

    if (loading) return <ConfigContainer loading />
    if (surveys?.length === 0) return <ConfigContainer error message={t("moduleConfigs.noCustomSurveys")} />

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
    const strategiesWithCustomSurveys = strategies.filter(strategy => strategy.surveys.some(survey => survey.validated === false));
    if (strategies === undefined || strategies.length === 0) return <ConfigContainer message={t("moduleConfigs.noStrategies")} />
    const initialStrategy = strategiesWithCustomSurveys[0];
    if (initialStrategy === undefined) return <ConfigContainer message={t("moduleConfigs.noStrategyWithCustom")} />

    const initialSurvey = initialStrategy.surveys.sort((a, b) => a.name.localeCompare(b.name))[0];
    const initialQuestion = initialSurvey.fields.find(q => q.type === "choice" || q.type === 'likert') as SurveyField;
    const themeColors = project?.theme && Object.keys(project.theme).length > 0 ? project.theme : NEW_CHART_COLORS;

    const initialValues: Partial<ReportModuleConfig> = {
        type: moduleTypes.customDistribution,
        projectId: projectId,
        surveyId: initialSurvey.id,
        strategyId: initialStrategy.id,
        graphType: 1,
        fieldId: initialQuestion?.id ?? "",
        tags: [],
        dateRanges: initialDateRange,
        name: initialQuestion?.text,
        isEmpty: !initialIsEmpty,
        pointSystemType: "Point",
        labelOnInside: true,
        isAverageScore: false,
        isExcludeOnlyOneAnswer: false,
        customGuideLabel: { 0: '' },
        xAxisDataType: 'choices',
        colors: themeColors,
        likertScale: selectedScale || 0
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
                    const curStrategy: Strategy | undefined = strategies.find((strategy) => strategy.id === values.strategyId);
                    const survey = surveys?.find(s => s.id === values.surveyId) as Survey;
                    const questions = survey?.fields.filter(q => q.type === "choice" || q.type === 'likert');
                    const handleChange = (tags: ProjectTag[]) => wrappedSetFieldValue("tags", tags);
                    const handleDelete = (tag: ProjectTag) => () => handleChange(tags.filter(t => t.id !== tag.id));

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
                                                            const curSurvey = strategies.find((strategy) => strategy.id === e.target.value)?.surveys.find((survey) => survey.validated === false) ?? null;
                                                            wrappedSetFieldValue("surveyId", curSurvey?.id);
                                                            const curQuestions = curSurvey?.fields.filter(q => q.type === "choice" || q.type === 'likert')[0];
                                                            wrappedSetFieldValue("fieldId", curQuestions?.id);
                                                            if (values.name === "" || initialValues.name === values.name || prevReg === prevName) {
                                                                wrappedSetFieldValue("name", curQuestions?.text)
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {strategiesWithCustomSurveys.map(s =>
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
                                                    id="surveyId"
                                                    name="surveyId"
                                                    labelId="survey-label"
                                                    label={t("moduleConfigs.selectSurvey")}
                                                    type="select"
                                                    onChange={(e: React.ChangeEvent<{ name?: string; value: string }>) => {
                                                        if (e.target.value !== values.surveyId) {
                                                            wrappedSetFieldValue("surveyId", e.target.value);
                                                            const newSurvey = curStrategy?.surveys.find((s) => s.id === e.target.value)
                                                            const newQuestionId = newSurvey?.fields.find(q => q.type === "choice" || q.type === 'likert')?.id;
                                                            wrappedSetFieldValue("fieldId", newQuestionId);
                                                            if (values.name === "" || initialValues.name === values.name || prevReg === prevName) {
                                                                const currFieldText = curStrategy?.surveys.find(s => s.id === newSurvey?.id)?.fields[0]
                                                                setPrevReg(currFieldText?.text ?? "")
                                                                setPrevName(currFieldText?.text ?? "")
                                                                wrappedSetFieldValue("name", currFieldText?.text ?? "");
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {curStrategy?.surveys.sort((a, b) => a.name.localeCompare(b.name)).map(s => {
                                                        if (!s.validated) {
                                                            return <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                                        }
                                                    }
                                                    )}
                                                </Field>
                                            </FormControl>
                                            <FormControl variant="outlined" fullWidth style={{ marginBottom: 10 }} size="small">
                                                <InputLabel id="xAxisDataType-label">{t("moduleConfigs.chooseXaxis")}</InputLabel>
                                                <Field
                                                    as={Select}
                                                    id="xAxisDataType"
                                                    name="xAxisDataType"
                                                    labelId="xAxisDataType-label"
                                                    label={t("moduleConfigs.chooseXaxis")}
                                                    type="select"
                                                    onChange={(e: any) => {
                                                        const value = e.target.value || "choices"; // Default to "choices" if value is null or undefined
                                                        if (value !== values.xAxisDataType) {
                                                            wrappedSetFieldValue("xAxisDataType", value);
                                                            if (value === "periods") {
                                                                wrappedSetFieldValue("name", "Periodic Distribution Score");
                                                            } else {
                                                                const selectedSurvey = curStrategy?.surveys.find((survey) => survey.id === values.surveyId);
                                                                if (selectedSurvey) {
                                                                    wrappedSetFieldValue("name", selectedSurvey.fields[0]?.text || "");
                                                                }
                                                                wrappedSetFieldValue("isAverageScore", false);
                                                                setIsAverageScore(false);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="choices">{t("moduleConfigs.choices")}</MenuItem>
                                                    <MenuItem value="periods">{t("moduleConfigs.periods")}</MenuItem>
                                                </Field>
                                            </FormControl>
                                            <FormControl
                                                variant="outlined"
                                                fullWidth
                                                style={{ marginBottom: 10 }}
                                                size="small"
                                            >
                                                <InputLabel id="fieldId-label">{t("moduleConfigs.chooseQuestion")}</InputLabel>
                                                <Field
                                                    as={Select}
                                                    id="fieldId"
                                                    name="fieldId"
                                                    labelId="fieldId-label"
                                                    label={t("moduleConfigs.chooseQuestion")}
                                                    type="select"
                                                    onChange={(e: React.ChangeEvent<{ name?: string; value: string }>) => {
                                                        if (e.target.value !== values.fieldId) {
                                                            wrappedSetFieldValue("fieldId", e.target.value);
                                                        }
                                                        if (values.name === "" || initialValues.name === values.name || prevReg === prevName) {
                                                            const currFieldText = curStrategy?.surveys.find((survey) => survey.fields.find((field) => field.id === e.target.value))?.fields.find((field) => field.id === e.target.value);
                                                            setPrevReg(currFieldText?.text ?? "");
                                                            setPrevName(currFieldText?.text ?? "");
                                                            wrappedSetFieldValue("name", currFieldText?.text ?? "");
                                                        }
                                                    }}
                                                    fullWidth
                                                >
                                                    {questions?.map((q) => (
                                                        <MenuItem
                                                            key={q.id}
                                                            value={q.id}
                                                            onClick={() => {
                                                                if (q.type === 'likert') {
                                                                    const scale = q.likertScaleChoiceAmount || 0;
                                                                    setSelectedScale(scale);
                                                                    wrappedSetFieldValue("likertScale", scale);
                                                                    wrappedSetFieldValue("questionType", scale > 0 ? 'likert' : 'choices');
                                                                }
                                                            }}
                                                        >
                                                            {q.text}
                                                        </MenuItem>
                                                    ))}
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
                                            <CustomDistributionView
                                                config={values as ReportModuleConfig}
                                                mode="review"
                                            />
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
                                                    <ToggleButton value="Percentage" disabled={values.isAverageScore} classes={{ root: classes.toggleButton }}>
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
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        disabled={values.xAxisDataType === "choices"}
                                                        checked={values.isAverageScore ?? false}
                                                        onChange={(event) => {
                                                            const isChecked = event.target.checked;
                                                            wrappedSetFieldValue("isAverageScore", isChecked);
                                                            const pointSystemType = isChecked ? "Point" : "Percentage";
                                                            wrappedSetFieldValue("pointSystemType", pointSystemType);
                                                            setPointType(pointSystemType);
                                                        }}
                                                        name="isAverageScore"
                                                        classes={{ switchBase: classes.switchBase }}
                                                    />
                                                }
                                                label={t("moduleConfigs.isAverageScore")}
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
        </ConfigContainer >
    )
}

export default CustomDistributionConfig;