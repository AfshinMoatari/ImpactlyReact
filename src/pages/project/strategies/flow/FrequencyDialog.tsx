import {Field} from "formik";
import {
    Box,
    Chip,
    FormControlLabel,
    MenuItem,
    Radio,
    RadioGroup,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from "@material-ui/core";
import React, {useState} from "react";
import LabeledSelect from "../../../../components/inputs/LabeledSelect";
import {
    CalendarUnit,
    defaultFrequency,
    End,
    EndType,
    FrequencyExpression
} from "../../../../models/cron/Frequency";
import local_calender from "../../../../constants/Local";
import makeStyles from "@material-ui/core/styles/makeStyles";
import * as Yup from "yup";
import {FormikHelpers} from "formik/dist/types";
import NiceDivider from "../../../../components/visual/NiceDivider";
import {Survey} from "../../../../models/Survey";
import NiceOutliner from "../../../../components/containers/NiceOutliner";
import InformationLineIcon from "remixicon-react/InformationLineIcon";
import AddCircleFillIcon from "remixicon-react/AddCircleFillIcon";
import CloseCircleFillIcon from "remixicon-react/CloseCircleFillIcon";
import ArrowUpCircleLineIcon from "remixicon-react/ArrowUpCircleLineIcon";
import ArrowDownCircleLineIcon from "remixicon-react/ArrowDownCircleLineIcon";
import {SendoutfrequencyToFrequencyExpression} from "../../../../lib/cron";
import CrudDialog from "../../../../components/dialogs/CrudCialog";
import Identifiable from "../../../../models/Identifyable";

const useStyles = makeStyles(() => ({
    chip: {
        cursor: 'pointer',
        width: 35,
        height: 35,
        marginRight: 2,
        marginBottom: 4,
        borderRadius: '100%',
        overflow: 'hidden',
        "& > span": {
            overflow: 'visible'
        }
    }
}))

export interface SurveyFrequencyFormValues extends Identifiable {
    expression: FrequencyExpression,
    surveys: Survey[],
    patientsId: string[],
    end: End
}

interface SurveyDialogProps {
    onSubmit: (values: SurveyFrequencyFormValues) => void;
    element?: SurveyFrequencyFormValues;
    onClose: VoidFunction;
    onRemove: (f: string) => void;
    surveys: Survey[];
}

const SurveyFrequencySchema = Yup.object().shape({
    surveys: Yup.array().min(1, "Vælg minimum ét spørgeskema").required(),
    expression: Yup.object().shape({
        count: Yup.number().min(1, "Ugyldigt antal intervaller").required("Ugyldigt antal intervaller"),
        hour: Yup.number().min(0, "Ugyldigt time tal").max(23, "Ugyldigt time tal").required("Ugyldigt time tal"),
        minute: Yup.number().min(0, "Ugyldigt minut tal").max(59, "Ugyldigt minut tal").required("Ugyldigt minut tal"),
        unit: Yup.number(),
        weekDays: Yup.array().when("unit", {
            is: CalendarUnit.WEEKLY,
            then: Yup.array().of(Yup.number()).min(1, "Du skal vælge én eller flere ugedage"),
        }),
        monthDays: Yup.array().when("unit", {
            is: CalendarUnit.MONTHLY,
            then: Yup.array().of(Yup.number()).min(1, "Du skal vælge én eller flere dage")
        }),
    }),
    end: Yup.object().shape({
        occurrences: Yup.number().min(0, "Ugyldigt antal udsendelser").required("Ugyldigt antal udsendelser")
    })
});

const FrequencyDialog: React.FC<SurveyDialogProps> = ({onSubmit, onClose, surveys: availableSurveys, onRemove, element}) => {
    const local = local_calender.da;
    const classes = useStyles();
    const theme = useTheme();

    // TODO FIND A BETTER WAY FOR THIS HACK
    // PUT IT INSIDE THE component
    // TODO CRETE A DEFUALT CASE AND A SET CASE TODO TODO TODO
    const [lastElement, setLastElement] = useState<SurveyFrequencyFormValues>(
        {
            id: "",
            expression: SendoutfrequencyToFrequencyExpression(defaultFrequency),
            surveys: [],
            patientsId: [],
            end: defaultFrequency.end,
        }
    )



    const handleClose = () => onClose()

    const handlePickWeekDays = (key: number, value: number[], setFieldValue: (s: string, v: number[]) => void) =>
        () => setFieldValue('expression.weekDays', handleArrayItemSet(key, value))

    const handlePickMonthDays = (key: number, value: number[], setFieldValue: (s: string, v: number[]) => void) =>
        () => setFieldValue('expression.monthDays', handleArrayItemSet(key, value))

    const handleArrayItemSet = (key: number, value: number[]) => {
        if (value.includes(key)) return value.filter(e => e !== key);
        return [...value, key]
    }

    const handleSubmit = (values: SurveyFrequencyFormValues, formikHelpers: FormikHelpers<SurveyFrequencyFormValues>) => {
        setLastElement(values)
        onSubmit(values)
        formikHelpers.resetForm();
    }

    return (
        <CrudDialog<SurveyFrequencyFormValues>
            onSubmit={handleSubmit}
            element={element}
            title={element?.id ? "Rediger udsendelse" : "Opret udsendelse"}
            maxWidth='md'
            validationSchema={SurveyFrequencySchema}
            onCancel={handleClose}
            onDelete={element?.id ? onRemove : undefined}
            enableReinitialize
            validateOnMount
        >
            {({values, setFieldValue, errors, touched}) => {
                const surveys = values.surveys ?? lastElement?.surveys;
                const expression = values.expression ?? lastElement?.expression;
                const end = values.end ?? lastElement?.id;

                const sortedAvailable = availableSurveys
                    .filter(a => !surveys.find(b => a.id === b.id))
                    .sort((a, b) => a.name < b.name ? -1 : (a.name > b.name) ? 1 : 0);
                const handlePickSurvey = (picked: Survey) => () =>
                    setFieldValue("surveys", [...surveys, picked]);
                const handleRemoveChosenSurvey = (toBeRemoved: Survey) => () =>
                    setFieldValue("surveys", surveys.filter(s => s.id !== toBeRemoved.id));

                const handleUpSurvey = (survey: Survey, index: number) => () => {
                    if (index === 0) return;
                    const tmp = [...surveys];
                    tmp[index] = tmp[index - 1];
                    tmp[index - 1] = survey;
                    setFieldValue("surveys", tmp)
                }
                const handleDownSurvey = (survey: Survey, index: number) => () => {
                    if (index === surveys.length - 1) return;
                    const tmp = [...surveys];
                    tmp[index] = tmp[index + 1];
                    tmp[index + 1] = survey;
                    setFieldValue("surveys", tmp)
                }

                return (
                    <Box display="flex">
                        <Box width="50%" p={1} pr={2}>
                            <Box pb={2}>
                                <Typography variant="h3">Valgte spørgeskemaer</Typography>

                                {errors.surveys ? (
                                    <Typography variant="subtitle2" color="error">
                                        {errors.surveys}
                                    </Typography>
                                ) : (
                                    <Typography variant="subtitle2">
                                        {surveys.length === 0 ? "Ingen valgte" : "Spørgeskemaerne vil blive sendt ud sammen i denne rækkefølge"}
                                    </Typography>
                                )}

                                {surveys.map((s, i) => (
                                    <NiceOutliner
                                        key={s.id}
                                        style={{paddingBottom: 4, display: "flex"}}
                                        innerStyle={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "8px 12px"
                                        }}
                                    >
                                        <Tooltip title={s.description}>
                                        <span style={{display: "flex", alignItems: "center"}}>
                                            <span style={{paddingRight: 8}}>{i + 1}.</span>
                                            {s.name}
                                        </span>
                                        </Tooltip>

                                        <span>
                                        <ArrowUpCircleLineIcon
                                            size={20}
                                            color={theme.palette.secondary.light}
                                            style={{cursor: "pointer", paddingRight: 4}}
                                            onClick={handleUpSurvey(s, i)}
                                        />
                                        <ArrowDownCircleLineIcon
                                            size={20}
                                            color={theme.palette.secondary.light}
                                            style={{cursor: "pointer", paddingRight: 16}}
                                            onClick={handleDownSurvey(s, i)}
                                        />
                                        <CloseCircleFillIcon
                                            size={20}
                                            color={theme.palette.primary.dark}
                                            style={{cursor: "pointer"}}
                                            onClick={handleRemoveChosenSurvey(s)}
                                        />
                                    </span>
                                    </NiceOutliner>
                                ))}
                            </Box>
                            <Box>
                                <Typography variant="h3">Mulige spørgeskemaer</Typography>
                                <Typography variant="subtitle2">Vælg spørgeskemaer fra listen nedenfor</Typography>
                                {sortedAvailable.map(s => (
                                    <NiceOutliner
                                        key={s.id}
                                        onClick={handlePickSurvey(s)}
                                        style={{paddingBottom: 4, display: "flex"}}
                                        innerStyle={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "8px 12px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <Tooltip title={s.description}>
                                        <span style={{display: "flex", alignItems: "center"}}>
                                            <InformationLineIcon size={20} style={{paddingRight: 8}}/>
                                            {s.name}
                                        </span>
                                        </Tooltip>
                                        <AddCircleFillIcon size={20} color={theme.palette.secondary.light}/>
                                    </NiceOutliner>
                                ))}
                            </Box>
                        </Box>

                        <NiceDivider style={{width: 2, height: "auto", margin: 0}}/>

                        <Box width="50%" p={1} pl={2}>
                            <Box
                                pb={2}
                                display="flex"
                                alignItems="center"
                                justifyContent="spacing-between"
                            >
                                <span style={{marginRight: 8}}>Udsend hver </span>
                                <Field
                                    as={TextField}
                                    name="expression.count"
                                    type="number"
                                    autocomplete="off"
                                    variant='filled'
                                    value={expression.count}
                                    InputProps={{
                                        inputProps: { 
                                            min: 0 
                                        }
                                    }}
                                    size='small'
                                    style={{width: 72, marginRight: 8}}
                                    error={errors.expression?.count && touched.expression?.count}
                                />
                                <Field
                                    as={LabeledSelect}
                                    name="expression.unit"
                                    type="select"
                                    variant='filled'
                                    size='small'
                                    value={expression.unit}
                                    InputProps={{
                                        inputProps: { 
                                            min: 0 
                                        }
                                    }}
                                >
                                    <MenuItem value={CalendarUnit.DAILY}>dag</MenuItem>
                                    <MenuItem value={CalendarUnit.WEEKLY}>uge </MenuItem>
                                    <MenuItem value={CalendarUnit.MONTHLY}>måned</MenuItem>
                                </Field>
                            </Box>

                            {expression.unit === CalendarUnit.WEEKLY && (
                                <Box pb={2.5}>
                                    <div style={{paddingBottom: 8}}>Send om</div>
                                    {local.weekDaysOrderedList.map((d: number) =>
                                        <Chip
                                            key={d}
                                            color={expression.weekDays.includes(d) ? "primary" : "default"}
                                            onClick={handlePickWeekDays(d, expression.weekDays, setFieldValue)}
                                            className={classes.chip}
                                            label={local.altWeekDays[d]}
                                        />)
                                    }
                                </Box>
                            )}

                            {expression.unit === CalendarUnit.MONTHLY && (
                                <Box pb={2.5}>
                                    <div style={{paddingBottom: 8}}>Send den</div>
                                    {local.monthDays.map((d: number) =>
                                        <Chip
                                            key={d}
                                            color={expression.monthDays.includes(d) ? "primary" : "default"}
                                            onClick={handlePickMonthDays(d, expression.monthDays, setFieldValue)}
                                            className={classes.chip}
                                            label={d}
                                        />
                                    )}
                                </Box>
                            )}

                            <Box pb={3}>
                                <div style={{paddingBottom: 8}}>Klokken</div>
                                <Box
                                    display='inline-flex'
                                    alignItems='center'
                                >
                                    <Field
                                        as={TextField}
                                        name="expression.hour"
                                        type="number"
                                        value={expression.hour}
                                        InputProps={{
                                            inputProps: { 
                                                min: 0 
                                            }
                                        }}
                                        size='small'
                                        variant='filled'
                                        style={{width: 72}}
                                        error={errors.expression?.hour && touched.expression?.hour}
                                    />
                                    <div style={{marginRight: 4, marginLeft: 4}}>
                                        :
                                    </div>
                                    <Field
                                        as={TextField}
                                        name="expression.minute"
                                        type="number"
                                        value={expression.minute}
                                        InputProps={{
                                            inputProps: { 
                                                min: 0 
                                            }
                                        }}
                                        size='small'
                                        variant='filled'
                                        style={{width: 72}}
                                        error={errors.expression?.minute && touched.expression?.minute}
                                    />
                                </Box>
                            </Box>

                            <Box>
                                <div>Slutter</div>
                                <div>
                                    <RadioGroup
                                        value={end.type}
                                        onChange={(e, value) => setFieldValue("end.type", Number(value))}
                                    >
                                        <FormControlLabel
                                            value={EndType.NEVER}
                                            control={<Radio/>}
                                            label="Forløb afsluttes"
                                            style={{height: 55}}
                                        />
                                        <FormControlLabel
                                            value={EndType.OCCUR}
                                            control={<Radio/>}
                                            style={{height: 55}}
                                            label={
                                                <Box
                                                    display='flex'
                                                    alignItems='center'
                                                >
                                                    <span style={{paddingRight: 32}}>Efter</span>
                                                    <Field
                                                        disabled={EndType.OCCUR !== end.type}
                                                        as={TextField}
                                                        name="end.occurrences"
                                                        type="number"
                                                        variant='filled'
                                                        InputProps={{
                                                            endAdornment: <div>Udsendelser</div>,
                                                            inputProps: { 
                                                                min: 0 
                                                            }
                                                        }}
                                                        size='small'
                                                        style={{maxWidth: 160}}
                                                        error={errors.end?.occurrences && touched.end?.occurrences}
                                                    />
                                                </Box>
                                            }
                                        />
                                    </RadioGroup>
                                </div>
                            </Box>
                        </Box>
                    </Box>
                )
            }}
        </CrudDialog>
    )
}

export default FrequencyDialog;
