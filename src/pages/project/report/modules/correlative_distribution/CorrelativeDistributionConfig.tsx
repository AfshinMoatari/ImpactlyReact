import { ReportModuleConfig } from "../../../../../models/Report";
import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Divider, FormControlLabel, Grid, IconButton, InputLabel, makeStyles, MenuItem, Select, Switch, TextField, Theme, Typography } from "@material-ui/core";
import { Field, FieldArray, Form, Formik } from "formik";
import FormControl from "@material-ui/core/FormControl";
import { useAuth } from "../../../../../providers/authProvider";
import { ConfigModuleProps, moduleTypes } from "../index";
import AutocompleteTags from "../../../../../components/inputs/AutocompleteTags";
import ProjectTag from "../../../../../models/ProjectTag";
import TagChip from "../../../../../components/TagChip";
import { useProjectSurveys } from "../../../../../hooks/useSurveys";
import { useAppServices } from "../../../../../providers/appServiceProvider";
import { SurveyField } from "../../../../../models/Survey";
import ConfigContainer from "../ConfigContainer";
import { useProjectCrudListQuery } from "../../../../../hooks/useProjectQuery";
import Strategy from "../../../../../models/Strategy";
import BarChart2FillIcon from "remixicon-react/BarChart2FillIcon";
import BarChartHorizontalFillIcon from "remixicon-react/BarChartHorizontalFillIcon";
import PercentFillIcon from "remixicon-react/PercentFillIcon";
import Number1Icon from "remixicon-react/Number1Icon";
import DeleteIcon from "remixicon-react/DeleteBinLineIcon";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { DateRange } from "../../../../../models/Report";
import { useTranslation } from "react-i18next";
import { isSurveyDateRangeValid } from "../../../../../lib/date/dateValidation"
import NiceDivider from "../../../../../components/visual/NiceDivider";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import CorrelativeDistributionView from "./CorrelativeDistributionView";
import { NEW_CHART_COLORS } from "../../../../../constants/ChartColors";
import { Tab, Tabs } from "@mui/material";


export const CorrelativeDistributionConfig: React.FC<ConfigModuleProps> = ({
    onSubmit,
    submitRef,
    editModuleConfig,
    setDateRangesValid
}) => {
    const [prevName, setPrevName] = React.useState("")
    const [prevReg, setPrevReg] = React.useState("")
    const project = useAuth().currentProject;
    const projectId = project?.id as string;
    const strategiesQuery = useProjectCrudListQuery(service => service.projectStrategies)
    const [viewType, setViewType] = useState(
        editModuleConfig?.viewType === 'table' ? 'table' : 'chart'
    );
    const [chartType, setChartType] = useState(editModuleConfig ? editModuleConfig.graphType?.toString() : "3");
    const [pointType, setPointType] = useState(editModuleConfig ? editModuleConfig.pointSystemType : "Point");
    const [selectedScale, setSelectedScale] = useState<number>(editModuleConfig?.likertScale || 0);

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

    const [labelOnInside, setlabelOnInside] = React.useState<boolean>(true);

    useEffect(() => {
        if (editModuleConfig?.labelOnInside !== undefined) {
            setlabelOnInside(editModuleConfig.labelOnInside);
        } else {
            setlabelOnInside(true);
        }
    }, [editModuleConfig?.labelOnInside]);

    useEffect(() => {
        if (editModuleConfig?.viewType !== undefined) {
            setViewType(editModuleConfig?.viewType);
        } else {
            setViewType('chart');
        }
    }, [editModuleConfig?.viewType]);


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

    const strategies = strategiesQuery.query.data ?? [];
    const strategiesWithCustomSurveys = strategies.filter(strategy => strategy.surveys.some(survey => survey.validated === false));
    if (strategies === undefined || strategies.length === 0) return <ConfigContainer message={t("moduleConfigs.noStrategies")} />
    const initialStrategy = editModuleConfig?.strategyId
        ? strategiesWithCustomSurveys.find(s => s.id === editModuleConfig.strategyId)
        : strategiesWithCustomSurveys[0];
    if (initialStrategy === undefined) return <ConfigContainer message={t("moduleConfigs.noStrategyWithCustom")} />

    // Determine initialSurvey
    const initialSurvey = editModuleConfig?.surveyId
        ? initialStrategy.surveys.find(s => s.id === editModuleConfig.surveyId)
        : initialStrategy.surveys.sort((a, b) => a.name.localeCompare(b.name))[0];

    // Check if initialSurvey is defined before proceeding
    if (!initialSurvey) {
        // Handle the case when initialSurvey is undefined
        console.error('Initial survey is not available');
        // Optionally, provide a default value or exit
        return;
    }

    // Determine initialQuestion
    const initialQuestion = initialSurvey.fields.find(q => q.type === "choice" || q.type === 'likert') as SurveyField;

    // Safely access initialSurvey's properties
    const surveyId = initialSurvey.id;
    const questionType = "choice";

    // Find the corresponding survey from surveys
    const survey = surveys?.find(s => s.id === surveyId);

    // Check if survey is defined before proceeding
    if (!survey) {
        // Handle the case when survey is undefined
        console.error('Survey not found');
        // Optionally, provide a default value or exit
        return;
    }

    // Filter questions based on type
    const questions = survey.fields.filter(q => q.type === 'choice' || q.type === 'likert');


    // Function to filter questions based on selected questionType and return their IDs
    const getFilteredQuestionIds = (questionType: string, questions: SurveyField[], scale?: number) => {
        const filteredIds = questions
            .filter(q => {
                if (questionType === 'choice') {
                    return q.type === 'choice';
                } else if (questionType === 'likert') {
                    return q.type === 'likert' &&
                        (!scale || q.likertScaleChoiceAmount === scale);
                }
                return true;
            })
            .map(q => q.id);

        return filteredIds.reduce<{ [key: number]: string }>((acc, id, index) => {
            acc[index] = id;
            return acc;
        }, {});
    };

    const themeColors = project?.theme && Object.keys(project.theme).length > 0 ? project.theme : NEW_CHART_COLORS;

    const initialValues: Partial<ReportModuleConfig> = {
        type: moduleTypes.correlativeDistribution,
        projectId: projectId,
        surveyId: surveyId,
        strategyId: initialStrategy.id,
        graphType: 3,
        tags: [],
        dateRanges: initialDateRange,
        name: initialQuestion?.text,
        isEmpty: !initialIsEmpty,
        pointSystemType: "Point",
        labelOnInside: true,
        isAverageScore: false,
        isExcludeOnlyOneAnswer: false,
        customGuideLabel: { 0: '' },
        multipleQuestionsIds: getFilteredQuestionIds(questionType, questions) ?? {},
        questionType: questionType,
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
                    const handleChange = (tags: ProjectTag[]) => wrappedSetFieldValue("tags", tags);
                    const handleDelete = (tag: ProjectTag) => () => handleChange(tags.filter(t => t.id !== tag.id));

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

                    // Handle questionType change
                    const handleQuestionTypeChange = (e: any) => {
                        const newQuestionType = e.target.value;

                        if (newQuestionType === 'likert' && questionCounts.scales.length > 0) {
                            const firstScale = questionCounts.scales[0];
                            setSelectedScale(firstScale);
                            wrappedSetFieldValue('likertScale', firstScale);
                            wrappedSetFieldValue('scale', firstScale);
                            const filteredQuestionIds = getFilteredQuestionIds(newQuestionType, questions, firstScale);
                            wrappedSetFieldValue("multipleQuestionsIds", filteredQuestionIds);
                        } else {
                            const filteredQuestionIds = getFilteredQuestionIds(newQuestionType, questions);
                            wrappedSetFieldValue("multipleQuestionsIds", filteredQuestionIds);
                            wrappedSetFieldValue('likertScale', undefined);
                        }

                        wrappedSetFieldValue("questionType", newQuestionType);
                    };

                    const handleScaleChange = (newScale: number) => {
                        const filteredQuestionIds = getFilteredQuestionIds(values.questionType || 'likert', questions, newScale);
                        wrappedSetFieldValue("multipleQuestionsIds", filteredQuestionIds);
                        wrappedSetFieldValue("likertScale", newScale);
                        setSelectedScale(newScale);
                    };

                    const survey = curStrategy?.surveys.find((s) => s.id === values.surveyId);

                    // Filter questions based on the selected type
                    // Filter questions based on type
                    const filteredQuestions = survey?.fields.filter(q => {
                        if (values.questionType === 'choice') {
                            return q.type === 'choice';
                        } else if (values.questionType === 'likert') {
                            return q.type === 'likert' &&
                                (!selectedScale || q.likertScaleChoiceAmount === selectedScale);
                        }
                        return true;
                    }) ?? [];

                    // Find the next available question that isn't already selected
                    const availableQuestions = filteredQuestions
                        .filter(q => !Object.values(values.multipleQuestionsIds ?? {}).includes(q.id))
                        .map(q => q.id);

                    // Function to count the number of questions for each type
                    const countQuestionsByType = (questions: SurveyField[]) => {
                        const counts = {
                            choice: 0,
                            likert: 0,
                            scales: [] as number[]
                        };

                        survey?.fields.forEach(q => {
                            if (q.type === 'choice') {
                                counts.choice += 1;
                            } else if (q.type === 'likert') {
                                counts.likert += 1;
                                // Add scale if it doesn't exist in the array
                                if (q.likertScaleChoiceAmount && !counts.scales.includes(q.likertScaleChoiceAmount)) {
                                    counts.scales.push(q.likertScaleChoiceAmount);
                                }
                            }
                        });

                        // Optional: Sort scales for consistency
                        counts.scales.sort((a, b) => a - b);

                        return counts;
                    };

                    // Determine if the "Add Question" button should be disabled
                    const allQuestionsSelected = Object.keys(values.multipleQuestionsIds ?? {}).length >= filteredQuestions.length;
                    const noQuestionsAvailable = availableQuestions.length === 0;
                    const questionCounts = countQuestionsByType(questions);

                    // Handle adding a new question
                    const handleAddQuestion = () => {
                        if (availableQuestions.length > 0) {
                            // Automatically select the next available question
                            const nextQuestionId = availableQuestions[0];
                            // Get the current multipleQuestionsIds or default to an empty object
                            const updatedQuestionsIds = { ...(values.multipleQuestionsIds ?? {}) };
                            // Find the next available index for the new question
                            const nextIndex = Object.keys(updatedQuestionsIds).length;
                            // Add the new question with the next available index
                            updatedQuestionsIds[nextIndex] = nextQuestionId;
                            // Update the field value
                            wrappedSetFieldValue('multipleQuestionsIds', updatedQuestionsIds);
                        }
                    };

                    // Function to get the most common field type from an array of fields
                    const getMostCommonType = (fields?: SurveyField[]): string => {
                        let likertCount = 0;
                        let choiceCount = 0;

                        // Count occurrences of 'likert' and 'choice'
                        fields?.forEach(field => {
                            if (field.type === 'likert') {
                                likertCount++;
                            } else if (field.type === 'choice') {
                                choiceCount++;
                            }
                        });

                        // Determine the most common type
                        if (likertCount > choiceCount) {
                            return 'likert';
                        } else if (choiceCount > likertCount) {
                            return 'choice';
                        } else {
                            // Default to 'likert' if neither type is present
                            return 'likert';
                        }
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

                                                            // Find the current survey that is not validated
                                                            const curSurvey = strategies.find((strategy) => strategy.id === e.target.value)?.surveys.find((survey) => survey.validated === false) ?? null;

                                                            // Set the surveyId if curSurvey exists
                                                            wrappedSetFieldValue("surveyId", curSurvey?.id || "");

                                                            // Filter questions that are either 'choice' or 'likert' type
                                                            const curQuestions = curSurvey?.fields?.filter(q => q.type === 'choice' || q.type === 'likert') ?? [];

                                                            // Handle the case when curQuestions is not empty
                                                            if (curQuestions.length > 0) {
                                                                const curQuestion = curQuestions[0];

                                                                // Set the name field if it's empty or unchanged from the initial values
                                                                if (values.name === "" || initialValues.name === values.name || prevReg === prevName) {
                                                                    wrappedSetFieldValue("name", curQuestion?.text);
                                                                }

                                                                // Determine the most common question type
                                                                const mostCommonType = getMostCommonType(curQuestions);
                                                                wrappedSetFieldValue("questionType", mostCommonType);

                                                                // Get the filtered question IDs based on the most common type
                                                                const filteredQuestionIds = getFilteredQuestionIds(mostCommonType, curQuestions);
                                                                wrappedSetFieldValue("multipleQuestionsIds", filteredQuestionIds);
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
                                                        const selectedSurveyId = e.target.value;

                                                        if (selectedSurveyId !== values.surveyId) {
                                                            wrappedSetFieldValue("surveyId", selectedSurveyId);

                                                            // Find the selected survey
                                                            const newSurvey = curStrategy?.surveys.find((s) => s.id === selectedSurveyId);
                                                            const newQuestions = newSurvey?.fields
                                                                .filter(q => (q.type === 'choice' || q.type === 'likert')) ?? []

                                                            // Update multipleQuestionsIds with all question IDs from the selected survey
                                                            const filteredQuestionIds =
                                                                newQuestions
                                                                    .filter(q => q.type === values.questionType)
                                                                    .map(q => q.id);

                                                            wrappedSetFieldValue("multipleQuestionsIds", filteredQuestionIds);

                                                            // Update name field if necessary
                                                            if (values.name === "" || initialValues.name === values.name || prevReg === prevName) {
                                                                const currFieldText = newSurvey?.fields[0];
                                                                setPrevReg(currFieldText?.text ?? "");
                                                                setPrevName(currFieldText?.text ?? "");
                                                                wrappedSetFieldValue("name", currFieldText?.text ?? "");
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {curStrategy?.surveys.sort((a, b) => a.name.localeCompare(b.name)).map(s => {
                                                        if (!s.validated) {
                                                            return <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                                        }
                                                        return null;
                                                    })}
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
                            <Grid item xs={6} style={{ display: "flex", flexDirection: "column", height: '100%' }}>
                                <Grid
                                    item
                                    direction="column"
                                    xs={12}
                                    container
                                    justifyContent="space-evenly"
                                    alignItems="stretch"
                                    style={{ height: 'fit-content' }}
                                >
                                    <Grid item xs style={{
                                        border: '1px solid #0A08121F',
                                        marginBottom: 18,
                                        height: '450px',
                                        flexBasis: 'initial'
                                    }}>
                                        <Box>
                                            <Tabs
                                                value={viewType}
                                                onChange={(e, value) => {
                                                    setViewType(value);
                                                    wrappedSetFieldValue("viewType", value);
                                                }}
                                                aria-label="tabs"
                                                sx={{
                                                    float: 'right',
                                                    '& .MuiTab-root': {
                                                        minWidth: 70,
                                                        minHeight: 30,
                                                        fontSize: '0.675rem',
                                                        padding: 1,
                                                    },
                                                    '& .Mui-selected': {
                                                        backgroundColor: '#ED4C2F',
                                                        color: '#fff !important',
                                                        fontWeight: 'bold'
                                                    },
                                                    '& .MuiTabs-indicator': {
                                                        display: 'none',
                                                    },
                                                }}
                                            >
                                                <Tab label="Chart" value="chart" style={{}} />
                                                <Tab label="Table" value="table" />
                                            </Tabs>
                                            <Box >
                                                <Grid container>
                                                    <Grid item xs>
                                                        <Box
                                                            sx={{
                                                                border: 'none',
                                                                height: '400px',
                                                                overflow: 'auto',
                                                                borderRadius: 1,
                                                            }}
                                                        >
                                                            {loadingChart ? (
                                                                null
                                                            ) : (
                                                                <CorrelativeDistributionView
                                                                    config={values as ReportModuleConfig}
                                                                    mode="review"
                                                                />
                                                            )}
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Box>
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
                                                    <ToggleButton value="3" classes={{ root: classes.toggleButton }}>
                                                        <BarChartHorizontalFillIcon />
                                                    </ToggleButton>
                                                    <ToggleButton value="1" classes={{ root: classes.toggleButton }}>
                                                        <BarChart2FillIcon />
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
                                        <Grid container item>
                                            <Grid xs={12} style={{ margin: "6px 0" }}>
                                                <NiceDivider style={{ backgroundColor: "#0A08121F", margin: 0, height: 1 }} />
                                            </Grid>
                                            <Grid>
                                                <Typography variant='body1' style={{ paddingBottom: 10, paddingTop: 10 }}>
                                                    {t('moduleConfigs.multipleQuestionDescription')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
                                                <FieldArray name="multipleQuestionsIds">
                                                    {({ push, remove }) => (
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            style={{
                                                                height: 'fixed-height',
                                                                overflowY: 'hidden',
                                                                overflowX: 'hidden',
                                                                width: '100%'
                                                            }}
                                                        >
                                                            <Grid item xs={12} style={{ paddingBottom: 10 }}>
                                                                <Typography variant="h4" style={{ paddingBottom: 10 }}>{t('moduleConfigs.questionType')}</Typography>
                                                                <Grid container spacing={2}>
                                                                    <Grid item>
                                                                        <FormControl variant="outlined" size='small' style={{ width: '175px' }}>
                                                                            <InputLabel id="questionType-label">{t("moduleConfigs.selectQuestionType")}</InputLabel>
                                                                            <Field
                                                                                as={Select}
                                                                                id="questionType"
                                                                                name="questionType"
                                                                                labelId="questionType-label"
                                                                                label={t("moduleConfigs.selectQuestionType")}
                                                                                value={values.questionType}
                                                                                onChange={handleQuestionTypeChange}
                                                                            >
                                                                                <MenuItem value="choice" disabled={questionCounts.choice === 0}>
                                                                                    Choices ({questionCounts.choice})
                                                                                </MenuItem>
                                                                                <MenuItem value="likert" disabled={questionCounts.likert === 0}>
                                                                                    Likert ({questionCounts.likert})
                                                                                </MenuItem>
                                                                            </Field>
                                                                        </FormControl>
                                                                    </Grid>
                                                                    {values.questionType === 'likert' && questionCounts.likert !== 0 && (
                                                                        <Grid item>
                                                                            <FormControl variant="outlined" size='small' style={{ width: '175px' }}>
                                                                                <InputLabel id="scale-label">{t("moduleConfigs.selectScale")}</InputLabel>
                                                                                <Field
                                                                                    as={Select}
                                                                                    id="scale"
                                                                                    name="scale"
                                                                                    labelId="scale-label"
                                                                                    label={t("moduleConfigs.selectScale")}
                                                                                    value={selectedScale || ''}
                                                                                    onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                                                                                        setSelectedScale(e.target.value as number);
                                                                                        handleScaleChange(e.target.value as number);
                                                                                    }}
                                                                                >
                                                                                    {questionCounts.scales.map((scale) => (
                                                                                        <MenuItem
                                                                                            key={scale}
                                                                                            value={scale}
                                                                                            onClick={() => handleScaleChange(scale)}
                                                                                        >
                                                                                            {scale}
                                                                                        </MenuItem>
                                                                                    ))}
                                                                                </Field>
                                                                            </FormControl>
                                                                        </Grid>
                                                                    )}
                                                                </Grid>
                                                            </Grid>
                                                            {Object.entries(values.multipleQuestionsIds ?? {}).map(([index, questionId]: [string, string], idx: number) => (
                                                                <Grid
                                                                    item
                                                                    xs={12}
                                                                    key={`question-${idx}`}
                                                                    container
                                                                    alignItems="center"
                                                                    spacing={1}
                                                                    style={{ paddingBottom: 10, paddingTop: 10 }}
                                                                >
                                                                    <Grid
                                                                        item
                                                                        xs={Object.keys(values.multipleQuestionsIds ?? {}).length > 1 ? 10 : 12} // Adjust width based on delete button visibility
                                                                    >
                                                                        <FormControl variant="outlined" fullWidth size='small'>
                                                                            <InputLabel id={`questionId-label-${idx}`}>{t("moduleConfigs.selectQuestion")}</InputLabel>
                                                                            <Field
                                                                                as={Select}
                                                                                id={`questionId-${idx}`}
                                                                                name={`multipleQuestionsIds.${index}`}
                                                                                labelId={`questionId-label-${idx}`}
                                                                                label={t("moduleConfigs.selectQuestion")}
                                                                                value={questionId || ""}
                                                                                onChange={(e: React.ChangeEvent<{ value: unknown }>) => wrappedSetFieldValue(`multipleQuestionsIds.${index}`, e.target.value as string)}
                                                                            >
                                                                                {filteredQuestions.map(q => {
                                                                                    // Check if the current question ID is already selected elsewhere
                                                                                    const isDisabled = Object.values(values.multipleQuestionsIds ?? {}).includes(q.id) && q.id !== questionId;
                                                                                    return (
                                                                                        <MenuItem
                                                                                            key={q.id}
                                                                                            value={q.id}
                                                                                            disabled={isDisabled}
                                                                                        >
                                                                                            {q.text}
                                                                                        </MenuItem>
                                                                                    );
                                                                                })}
                                                                            </Field>
                                                                        </FormControl>
                                                                    </Grid>
                                                                    <Grid
                                                                        item
                                                                        xs={Object.keys(values.multipleQuestionsIds ?? {}).length > 1 ? 2 : false}
                                                                        style={{ display: Object.keys(values.multipleQuestionsIds ?? {}).length > 1 ? 'block' : 'none' }}
                                                                    >
                                                                        {/* Hide the "Delete" button if there is only one question */}
                                                                        {Object.keys(values.multipleQuestionsIds ?? {}).length > 1 && (
                                                                            <IconButton
                                                                                onClick={() => {
                                                                                    const updatedQuestions = { ...values.multipleQuestionsIds };
                                                                                    delete updatedQuestions[parseInt(index)]; // Delete the item based on the index

                                                                                    // Update the indices to ensure there are no gaps in the keys
                                                                                    const reorderedQuestions = Object.keys(updatedQuestions).reduce((acc: any, key: any, idx: any) => {
                                                                                        acc[idx] = updatedQuestions[key];
                                                                                        return acc;
                                                                                    }, {});

                                                                                    wrappedSetFieldValue('multipleQuestionsIds', reorderedQuestions);
                                                                                }}
                                                                            >
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        )}
                                                                    </Grid>
                                                                </Grid>
                                                            ))}
                                                            {!allQuestionsSelected && !noQuestionsAvailable && (
                                                                <Button
                                                                    style={{ fontWeight: 600, color: "#ED4C2F" }}
                                                                    onClick={handleAddQuestion}
                                                                    disabled={allQuestionsSelected} // Disable button if all questions are selected
                                                                >
                                                                    {t('moduleConfigs.addTimeQuestion')}
                                                                </Button>
                                                            )}
                                                        </Grid>
                                                    )}
                                                </FieldArray>
                                            </Grid>
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

export default CorrelativeDistributionConfig;