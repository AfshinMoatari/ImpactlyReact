import React, { useState } from "react";
import { SendoutfrequencyToFrequencyExpression } from "../../../../lib/cron";
import {
    BatchSendoutData,
    CalendarUnit,
    EndType,
    FrequencyFormValues,
    defaultFrequency
} from "../../../../models/cron/Frequency";
import { Box, Chip, Grid, makeStyles, MenuItem, TextField } from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import DirectionalButton from "../../../../components/buttons/NextButton";
import LabeledSelect from "../../../../components/inputs/LabeledSelect";
import local_calender from "../../../../constants/Local";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(() => ({
    chip: {
        cursor: 'pointer',
        width: 42,
        height: 42,
        marginRight: 4,
        marginBottom: 4,
        borderRadius: '100%',
        overflow: 'hidden',
        "& > span": {
            overflow: 'visible'
        }
    },
    err: {
        padding: '2px 8px',
        color: '#ED4A2F',
        fontSize: '12px'
    }
}))

interface FrequencyTypeProp {
    batchSendoutData: BatchSendoutData;
    copyOfBatchSendoutData: BatchSendoutData
    setBatchSendoutData: (data: any) => void;
    activeStep: number,
    setActiveState: (data: number) => void;
    toggleConfirmationDialog: (data: boolean) => void;
    edit: boolean;

}

const FrequencyTypeView: React.FC<FrequencyTypeProp> = ({
    batchSendoutData,
    copyOfBatchSendoutData,
    setBatchSendoutData,
    activeStep,
    setActiveState,
    toggleConfirmationDialog,
    edit
}) => {

    const classes = useStyles();
    const local = local_calender.da;
    const { t } = useTranslation();

    const FrequencyFormSchema = Yup.object().shape({
        expression: Yup.object().shape({
            count: Yup.number().min(1, t('CommunicationFlowPage.FrequencyTypeView.invalidInterval')).required(t('CommunicationFlowPage.FrequencyTypeView.invalidInterval')),
            hour: Yup.number().min(0, t('CommunicationFlowPage.FrequencyTypeView.invalidHour')).max(23, t('CommunicationFlowPage.FrequencyTypeView.invalidHour')).required(t('CommunicationFlowPage.FrequencyTypeView.invalidHour')),
            minute: Yup.number().min(0, t('CommunicationFlowPage.FrequencyTypeView.invalidMinute')).max(59, t('CommunicationFlowPage.FrequencyTypeView.invalidMinute')).required(t('CommunicationFlowPage.FrequencyTypeView.invalidMinute')),
            unit: Yup.number(),
            weekDays: Yup.array().when("unit", {
                is: CalendarUnit.WEEKLY,
                then: Yup.array().of(Yup.number()).min(1, t('CommunicationFlowPage.FrequencyTypeView.chooseWeekdays'))
            }),
            monthDays: Yup.array().when("unit", {
                is: CalendarUnit.MONTHLY,
                then: Yup.array().of(Yup.number()).min(1, t('CommunicationFlowPage.FrequencyTypeView.chooseDays'))
            })
        }),
        end: Yup.object().shape({
            occurrences: Yup.number().min(1, t('CommunicationFlowPage.FrequencyTypeView.invalidOccurrences')).required(t('CommunicationFlowPage.FrequencyTypeView.invalidOccurrences'))
        })
    });


    const handlePickWeekDays = (key: number, value: number[], setFieldValue: (s: string, v: number[]) => void) =>
        () => setFieldValue('expression.weekDays', handleArrayItemSet(key, value))
    const handlePickMonthDays = (key: number, value: number[], setFieldValue: (s: string, v: number[]) => void) =>
        () => setFieldValue('expression.monthDays', handleArrayItemSet(key, value))
    const handleArrayItemSet = (key: number, value: number[]) => {
        if (value.includes(key)) return value.filter(e => e !== key);
        return [...value, key]
    }

    const [enableReset, toggleEnableReset] = useState(true);

    const [lastElement, setLastElement] = useState<FrequencyFormValues>(
        {
            id: "",
            expression: SendoutfrequencyToFrequencyExpression(defaultFrequency),
            end: defaultFrequency.end,
        }
    )

    const handlePrev = async () => {
        setActiveState(activeStep -= 1)
    };

    const handleSubmit = (values: FrequencyFormValues) => {
        setLastElement(values);
        toggleConfirmationDialog(true);
    }

    return (
        <Formik<FrequencyFormValues>
            initialValues={batchSendoutData.frequencyFormValues ?? {} as FrequencyFormValues}
            validationSchema={FrequencyFormSchema}
            onSubmit={handleSubmit}
            validateOnMount
            validateOnChange
            enableReinitialize
        >
            {formik => {
                const { values, errors, touched, isValid, setFieldValue } = formik;
                const expression = values.expression ?? lastElement?.expression;
                const end = values.end ?? lastElement?.id;
                const saveBatchSendoutData = () => {
                    setBatchSendoutData({
                        ...batchSendoutData,
                        frequencyFormValues: values
                    });
                };

                const handleReset = async () => {
                    formik.resetForm();
                    setBatchSendoutData({
                        ...batchSendoutData,
                        frequencyFormValues: copyOfBatchSendoutData.frequencyFormValues
                    });
                    toggleEnableReset(true);
                };

                return (
                    <Form
                        onChange={() => toggleEnableReset(false)}>
                        <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            xs={12}
                            style={{ gap: 10, width: '700px' }}>
                            <Grid item justifyContent="flex-start" xs={12}>
                                <p>{t('CommunicationFlowPage.FrequencyTypeView.selectTimes')}</p>
                            </Grid>

                            <Grid container item direction="column" justifyContent="flex-start" xs={12}
                                style={{ gap: 10 }}>
                                <Grid item>
                                    <span style={{ fontWeight: 600 }}>{t('CommunicationFlowPage.FrequencyTypeView.sendEvery')}</span>
                                </Grid>
                                <Grid container item direction="row" style={{
                                    justifyContent: 'center',
                                    placeContent: 'space-between'
                                }}>
                                    <Grid container item direction="row" style={{
                                        justifyContent: 'center',
                                        placeContent: 'space-between'
                                    }}>
                                        <Box>
                                            <Field
                                                as={TextField}
                                                name="expression.count"
                                                type="number"
                                                autocomplete="off"
                                                variant='outlined'
                                                value={expression.count ?? 1}
                                                style={{ width: '340px' }}
                                                error={errors.expression?.count && touched.expression?.count}
                                            />
                                        </Box>
                                        <Box style={{
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <Field
                                                as={LabeledSelect}
                                                name="expression.unit"
                                                type="select"
                                                variant='outlined'
                                                value={expression.unit}
                                                style={{ width: '340px' }}
                                                onClick={() => toggleEnableReset(false)}
                                            >
                                                <MenuItem value={CalendarUnit.DAILY}>{t('CommunicationFlowPage.FrequencyTypeView.daily')}</MenuItem>
                                                <MenuItem value={CalendarUnit.WEEKLY}>{t('CommunicationFlowPage.FrequencyTypeView.weekly')}</MenuItem>
                                                <MenuItem value={CalendarUnit.MONTHLY}>{t('CommunicationFlowPage.FrequencyTypeView.monthly')}</MenuItem>
                                            </Field>
                                        </Box>
                                    </Grid>
                                    <Box>
                                        <span
                                            className={classes.err}>{formik.errors.expression?.count?.toString()}</span>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Grid item direction="row" justifyContent="center" xs={12} style={{ gap: 10, marginTop: 20 }}>
                                {expression.unit === CalendarUnit.WEEKLY && (
                                    <Box pb={2}>
                                        <Box pb={0.5}>
                                            {local.weekDaysOrderedList.map((d: number) =>
                                                <Chip
                                                    key={d}
                                                    color={expression.weekDays.includes(d) ? "primary" : "default"}
                                                    onClick={() => {
                                                        handlePickWeekDays(d, expression.weekDays, setFieldValue)();
                                                        toggleEnableReset(false);
                                                    }}
                                                    className={classes.chip}
                                                    label={local.altWeekDays[d]}
                                                />)}
                                        </Box>
                                        <Box>
                                            <span
                                                className={classes.err}>{formik.errors.expression?.weekDays?.toString()}</span>
                                        </Box>
                                    </Box>
                                )}

                                {expression.unit === CalendarUnit.MONTHLY && (
                                    <Box pb={2}>
                                        <Box pb={0.5}>
                                            {local.monthDays.map((d: number) =>
                                                <Chip
                                                    key={d}
                                                    color={expression.monthDays.includes(d) ? "primary" : "default"}
                                                    onClick={() => {
                                                        handlePickMonthDays(d, expression.monthDays, setFieldValue)();
                                                        toggleEnableReset(false);
                                                    }}
                                                    className={classes.chip}
                                                    label={d}
                                                />
                                            )}
                                        </Box>
                                        <Box>
                                            <span
                                                className={classes.err}>{formik.errors.expression?.monthDays?.toString()}</span>
                                        </Box>
                                    </Box>
                                )}
                            </Grid>

                            <Grid container item direction="column" justifyContent="flex-start" xs={12}
                                style={{ gap: 10 }}>
                                <Grid item>
                                    <span style={{ fontWeight: 600 }}>{t('CommunicationFlowPage.FrequencyTypeView.time')}</span>
                                </Grid>
                                <Grid container item direction="column">
                                    <Grid item direction="row" style={{
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        alignItems: 'center'
                                    }}>
                                        <Field
                                            as={TextField}
                                            name="expression.hour"
                                            type="number"
                                            value={expression.hour}
                                            size='small'
                                            variant='outlined'
                                            style={{ width: 65 }}
                                            error={errors.expression?.hour && touched.expression?.hour}
                                        />
                                        <div style={{ marginRight: 4, marginLeft: 4 }}>
                                            :
                                        </div>
                                        <Field
                                            as={TextField}
                                            name="expression.minute"
                                            type="number"
                                            value={expression.minute}
                                            variant='outlined'
                                            size='small'
                                            style={{ width: 65 }}
                                            error={errors.expression?.minute && touched.expression?.minute}
                                        />
                                    </Grid>
                                    <Box>
                                        <span
                                            className={classes.err}>{formik.errors.expression?.hour?.toString()}</span>
                                        <span
                                            className={classes.err}>{formik.errors.expression?.minute?.toString()}</span>
                                    </Box>

                                </Grid>
                            </Grid>

                            <Grid container item direction="column" justifyContent="flex-start" xs={12}
                                style={{ gap: 10, marginTop: 20 }}>
                                <Grid item>
                                    <span style={{ fontWeight: 600 }}>{t('CommunicationFlowPage.FrequencyTypeView.endsAfter')}</span>
                                </Grid>
                                <Grid container item direction="row" style={{
                                    justifyContent: 'center',
                                    placeContent: 'space-between'
                                }}>
                                    <Box>
                                        <Field
                                            as={LabeledSelect}
                                            name="end.type"
                                            type="select"
                                            variant='outlined'
                                            value={end.type}
                                            style={{ width: '340px' }}
                                            onClick={() => toggleEnableReset(false)}
                                        >
                                            <MenuItem value={EndType.NEVER}>{t('CommunicationFlowPage.FrequencyTypeView.whenRunsOut')}</MenuItem>
                                            <MenuItem value={EndType.OCCUR}>{t('CommunicationFlowPage.FrequencyTypeView.occurrences')}</MenuItem>
                                        </Field>
                                    </Box>
                                    <Box style={{
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <Field
                                            label={t('CommunicationFlowPage.FrequencyTypeView.sendouts')}
                                            as={TextField}
                                            name="end.occurrences"
                                            type="number"
                                            autocomplete="off"
                                            variant='outlined'
                                            value={end.occurrences}
                                            style={{ width: '340px' }}
                                            error={errors.end?.occurrences && touched.end?.occurrences}
                                            disabled={EndType.OCCUR !== end.type}
                                        />
                                        <span
                                            className={classes.err}>{EndType.OCCUR === end.type ? formik.errors.end?.occurrences?.toString() : null}</span>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Grid item direction="row" xs={12} style={{ margin: '25px 0 0 0' }}>
                                <Box style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between'
                                }}>
                                    <Box style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'left'
                                    }}>
                                        <Box>
                                            {edit && (
                                                <DirectionalButton
                                                    disabled={enableReset}
                                                    onClick={handleReset}
                                                    text={t('CommunicationFlowPage.FrequencyTypeView.reset')}
                                                    variant="text"
                                                ></DirectionalButton>
                                            )}
                                        </Box>
                                    </Box>


                                    <Box style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'right'
                                    }}>
                                        <Box>
                                            <DirectionalButton
                                                onClick={() => {
                                                    handleReset()
                                                    handlePrev();
                                                }}
                                                text={t('CommunicationFlowPage.FrequencyTypeView.back')}
                                                variant="outlined"
                                            ></DirectionalButton>
                                        </Box>
                                        <Box style={{
                                            marginLeft: 10,
                                        }}>
                                            <DirectionalButton
                                                type="submit"
                                                onClick={() => {
                                                    toggleConfirmationDialog(formik.isValid)
                                                    saveBatchSendoutData();
                                                }}
                                                disabled={!isValid}
                                                text={t('CommunicationFlowPage.FrequencyTypeView.execute')}
                                                aria-label="submit"
                                                variant="contained"
                                            >
                                            </DirectionalButton>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default FrequencyTypeView;
