import { Box, Button, CircularProgress, Container, LinearProgress, TextField, Typography } from "@material-ui/core";
import { Field, Form, Formik, FormikProps } from "formik";
import React, { useState } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { EntryBatch, FieldChoice, FieldEntry, SurveyField } from "../../models/Survey";
import clamp from "../../lib/math/clamp";
import ArrowRightLineIcon from "remixicon-react/ArrowRightLineIcon";
import SendPlaneFillIcon from "remixicon-react/SendPlaneFillIcon";
import CheckFillIcon from "remixicon-react/CheckFillIcon";
import CheckboxBlankLineIcon from "remixicon-react/CheckboxBlankLineIcon";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import SurveyCode from "../../models/codes/SurveyCode";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import { Guid } from "../../lib/Guid";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { useAuth } from "../../providers/authProvider";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(({ spacing, breakpoints, palette }) => ({
    linearProgress: {
        width: '100vw',
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        margin: 'auto'
    },
    qStepIndicator: {
        lineHeight: 1.6,
        display: 'block',
        textAlign: 'center',
        fontSize: 16,
        color: palette.primary.main,
        [breakpoints.down("sm")]: {
            margin: 'auto',
            zIndex: 100
        }
    },
    optionButton: {
        textAlign: 'left',
        fontSize: 16,
        marginBottom: 8,
        minWidth: 90,
        paddingRight: 16,
        display: 'flex',
        justifyContent: 'space-between'
    },
    actionButton: {
        [breakpoints.down("sm")]: {
            position: 'fixed',
            padding: 8,
            bottom: 0,
            left: 0,
            right: 0,
            margin: 'auto',
            textAlign: 'center',
            zIndex: 100
        }
    }
}));

interface AnswerSurveyViewProps {
    code: SurveyCode;
    fields: SurveyField[];
    onSubmit: (values: EntryBatch) => Promise<void>;
}

const AnswerSurveyView: React.FC<AnswerSurveyViewProps> = ({ code, fields, onSubmit }) => {
    const { t } = useTranslation();
    const initialValues: EntryBatch = {
        id: "",
        surveyId: code.surveys[0].id,
        projectId: code.projectId,
        patientId: code.patientId,
        score: 0,
        entries: [],
        createdAt: new Date(),
        answeredAt: new Date()
    };

    const validationList = fields.map((field: SurveyField) => {
        if (field.validation.required)
            return (value: FieldEntry) => {
                if (!value) return t("AnswerSurveyView.fieldRequired")
                return undefined
            }
        return (_: any) => undefined
    });

    return (
        <Formik<EntryBatch>
            initialValues={initialValues}
            onSubmit={onSubmit}
            validate={(values => {
                return {
                    ...validationList.reduce((
                        prev: { [key: string]: string }, currFn: (value: any) => undefined | string, i) => {
                        const error = currFn(values.entries?.[i])
                        if (!error) return prev
                        prev[i] = error
                        return prev
                    }, {} as { [key: string]: string })
                }
            })}
            validateOnMount
        >
            {(formik) =>
                (<SurveyForm fields={fields} {...formik} onSubmit={onSubmit} />)}
        </Formik>
    )
}

interface SurveyFormProps extends FormikProps<EntryBatch> {
    fields: SurveyField[];
    onSubmit: (values: EntryBatch) => Promise<void>;
}

const SurveyForm: React.FC<SurveyFormProps> =
    ({ fields, values, errors, setFieldValue, isSubmitting, isValid, onSubmit }) => {
        const auth = useAuth();
        const classes = useStyles();
        const fieldCount = fields.length;
        const questionsIndexLength = fieldCount - 1;
        const [step, setStep] = useState<number>(0)
        const { t } = useTranslation();

        const canGoNext = fields[step].isNonMandatory
            || (fields[step].validation.required
                ? Array.isArray(values.entries[step])
                    ? values.entries[step].length > 0
                    : !!values.entries[step]?.choiceId
                : true);
        const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

        const handlePickChoice = (parentId: string, choice: FieldChoice) => () => {
            const field = fields.find(f => f.id === parentId);
            if (field) {
                if (field.isMultipleChoices) {
                    setSelectedChoices(prev =>
                        prev.includes(choice.id)
                            ? prev.filter(id => id !== choice.id)
                            : [...prev, choice.id]
                    );
                } else {
                    setSelectedChoices([choice.id]);
                }

                const newEntry = {
                    id: choice.id,
                    parentId: parentId,
                    fieldId: field.id,
                    fieldText: field.text,
                    choiceId: choice.id,
                    choiceText: choice.text,
                    createdAt: new Date(),
                    value: choice.value,
                    text: choice.text,
                    index: choice.index,
                    fieldIndex: step,
                    score: choice.value
                };

                const newEntries = [...values.entries];
                newEntries[step] = newEntry;
                setFieldValue('entries', newEntries);
            }
        };

        const handleSetText = (parentId: string) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            const field = fields.find(f => f.id === parentId);
            if (field) {
                const newEntry = {
                    id: Guid.create().toString(),
                    parentId: parentId,
                    createdAt: new Date(),
                    text: e.target.value,
                    fieldId: field.id,
                    fieldText: field.text,
                    fieldIndex: step,
                    score: 0,
                    value: 0,
                    choiceId: "",
                    choiceText: "",
                    index: 0
                };

                const newEntries = [...values.entries];
                newEntries[step] = newEntry;
                setFieldValue('entries', newEntries);
            }
        }

        const calcProgress = () => (values.entries.length / fields.length) * 100

        const handleStep = (s: number) => (e: React.MouseEvent) => {
            e.preventDefault();
            setStep(clamp(step + s, 0, fields.length));
        }
        const convertStringToHTML = (html: string) => {
            return { __html: html }
        }
        return (
            <Form style={{ width: '100%' }}>
                <LinearProgress
                    variant="determinate"
                    className={classes.linearProgress}
                    value={calcProgress()}
                />
                <Container maxWidth='md' style={{ minHeight: 500 }}>

                    <Box
                        pt={2}
                        display='flex'
                        alignItems='center'
                        justifyContent='space-between'
                        style={{ userSelect: 'none' }}
                    >
                        <Button
                            size='large'
                            color="primary"
                            disabled={step === 0}
                            onClick={handleStep(-1)}>
                            <ArrowLeftLineIcon />
                        </Button>
                        <span className={classes.qStepIndicator}>{step + 1}/{fieldCount}</span>
                        <Button
                            size='large'
                            color="primary"
                            style={{
                                opacity: step !== questionsIndexLength ? 1 : 0,
                                pointerEvents: step !== questionsIndexLength ? "auto" : "none"
                            }}
                            disabled={!canGoNext || step === questionsIndexLength}
                            onClick={handleStep(1)}
                        >
                            <ArrowRightLineIcon />
                        </Button>
                    </Box>

                    <Box p={1} mb={5} mt={2}>
                        <Box display='flex'
                            position='relative'
                            mb={6}
                            style={{ userSelect: 'none' }}
                        >
                            <span style={{
                                fontSize: '1.9em',
                                fontFamily: "Inter",
                                fontWeight: 500,
                                margin: 0,
                                lineHeight: 1.3
                            }}>
                                {fields[step].text}{fields[step].validation.required ? "*" : ""}
                            </span>
                        </Box>
                        <Box mb={1}>
                            <Box flexDirection='column' maxWidth='100%'>
                                {fields[step].type === "text" && (
                                    <TextField
                                        value={values.entries[step]?.text ?? ""}
                                        onChange={handleSetText(fields[step]?.id)}
                                        variant="filled"
                                        minRows={6}
                                        fullWidth={true}
                                        multiline={true}
                                        label={t("AnswerSurveyView.writeYourAnswerHere")}
                                    />
                                )}

                                {(fields[step].type === "choice" || fields[step].type === "likert") &&
                                    <>
                                        {fields[step]?.choices.map((c) => {
                                            const isSelected = selectedChoices.includes(c.id);
                                            return (
                                                <Button
                                                    fullWidth
                                                    key={c.id}
                                                    style={{
                                                        boxShadow: 'none',
                                                        color: isSelected ? '#fff' : 'inherit',
                                                        backgroundColor: isSelected ? '#048673' : '#FDF7EC'
                                                    }}
                                                    size='large'
                                                    variant='contained'
                                                    className={classes.optionButton}
                                                    onClick={handlePickChoice(fields[step].id, c)}
                                                >
                                                    <span>{c.text}</span>
                                                    <Box ml={3} width={24} height={24}>
                                                        {isSelected ? (
                                                            <CheckFillIcon />
                                                        ) : fields[step].isMultipleChoices ? (
                                                            <CheckboxBlankLineIcon />  // Show square outline for multiple choice
                                                        ) : (
                                                            <CheckboxBlankCircleLineIcon />  // Show circle outline for single choice
                                                        )}
                                                    </Box>
                                                </Button>
                                            )
                                        })}
                                    </>
                                }
                                {fields[step].type === "skiller" && (
                                    <div style={{ width: "90%", margin: "0 auto" }}>
                                        <Typography variant={"body2"}>
                                            <div dangerouslySetInnerHTML={convertStringToHTML(fields[step].choices[0].text ?? '')} />
                                        </Typography>
                                    </div>
                                )}
                                <div style={{ paddingTop: 16 }} />

                                {step !== questionsIndexLength &&
                                    <Button
                                        size='large'
                                        fullWidth
                                        className={classes.actionButton}
                                        variant="contained"
                                        color="primary"
                                        disabled={!canGoNext || step === questionsIndexLength}
                                        onClick={handleStep(1)}
                                    >
                                        {fields[step].isNonMandatory ? t("AnswerSurveyView.skip") : t("AnswerSurveyView.next")}
                                    </Button>
                                }

                                {step === questionsIndexLength && (
                                    <>
                                        <Button
                                            type='submit'
                                            size='large'
                                            fullWidth
                                            className={classes.actionButton}
                                            variant="contained"
                                            color="primary"
                                            disabled={!isValid}
                                            endIcon={isSubmitting ?
                                                <CircularProgress color="inherit" style={{ width: 17, height: 17 }} /> :
                                                <SendPlaneFillIcon size={17} />
                                            }
                                        >
                                            {t("AnswerSurveyView.answer")}
                                        </Button>
                                        {auth.permissions.find((x) => x == "Permissions.Admin.All") && window.location.hostname.split('.')[0] != "app" ?
                                            <Button
                                                onClick={() => onSubmit({} as EntryBatch)}
                                                size='large'
                                                fullWidth
                                                className={classes.actionButton}
                                                variant="contained"
                                                color="primary"
                                                disabled={!isValid}
                                                endIcon={isSubmitting ?
                                                    <CircularProgress color="inherit" style={{ width: 17, height: 17 }} /> :
                                                    <SendPlaneFillIcon size={17} />
                                                }
                                            >
                                                fail
                                            </Button>
                                            :
                                            <></>
                                        }
                                    </>
                                )}
                                {step === questionsIndexLength && auth.value?.authenticated && (
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
                                        id="answeredAt"
                                        variant='inline'
                                        name="answeredAt"
                                        label={t("AnswerSurveyView.answered")}
                                        // value={end}
                                        onChange={(date: Date) => {
                                            if (date) {
                                                date.setHours(12, 0, 0, 0);
                                                setFieldValue("answeredAt", date);
                                            }
                                        }}
                                        style={{ margin: 0, marginTop: 16 }}
                                    />
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Form >
        )
    }

export default AnswerSurveyView;
