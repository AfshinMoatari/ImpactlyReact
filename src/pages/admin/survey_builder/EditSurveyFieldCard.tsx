import { Survey, SurveyField, FieldChoice } from "../../../models/Survey";
import { Field, FieldArray, FormikProps, FormikErrors } from "formik";
import React from "react";
import {
    Card,
    Grid, IconButton,
    TextField,
    Typography
} from "@material-ui/core";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import theme from "../../../constants/theme";
import IconItem from "./IconItem";
import MoveArrows from "./MoveArrows";
import DeleteButton from "../../../components/buttons/DeleteButton";
import { Guid } from "../../../lib/Guid";
import ReactQuill from "react-quill";
import FileCopyLineIcon from "remixicon-react/FileCopyLineIcon";

interface EditableSurveyFieldCardProps {
    field: SurveyField;
    fi: number;
    formik: FormikProps<Survey>;
    onSelect: (index: number) => void;
}

const CreateSurveyFieldCard: React.FC<EditableSurveyFieldCardProps> = ({ field, fi, formik, onSelect }) => {
    const onDelete = () => {
        const fields = [...formik.values.fields];
        fields.splice(fi, 1);
        formik.setFieldValue("fields", fields);
    };
    const CopyItem = () => (
        <IconItem>
            <IconButton
                size="small"
                onClick={() => {
                    const timestamp = new Date().getTime()
                    const newFieldId = field.id + "T" + timestamp.toString();
                    const newField = {
                        ...field,
                        id: newFieldId,
                        choices: field.choices.map(c => ({
                            ...c,
                            parentId: newFieldId,
                            id: c.id + "T" + timestamp.toString() // Temp fix for the copy functionality of fields
                        }))
                    };
                    const fields = [...formik.values.fields];
                    fields.splice(fi + 1, 0, newField);
                    formik.setFieldValue("fields", fields);
                }}
            >
                <FileCopyLineIcon />
            </IconButton>
        </IconItem>
    )
    return (
        <Card style={{ padding: "16px 8px", marginBottom: 16 }}>
            <Grid container spacing={3}>
                <Grid item xs={8} style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h3" style={{ padding: "8px 16px" }}>
                        {fi + 1}.
                    </Typography>
                    <Field
                        as={TextField}
                        name={`fields[${fi}].text`}
                        label="Spørgsmål"
                        variant="outlined"
                        size="small"
                        fullWidth
                        validate={(value: string) => !value && "Du skal indtaste en værdi"}
                        error={!!(formik.errors?.fields?.[fi] as FormikErrors<SurveyField>)?.text}
                        helperText={(formik.errors?.fields?.[fi] as FormikErrors<SurveyField>)?.text}
                    />
                </Grid>
                <Grid item xs={4} style={{ display: "flex", alignItems: "center", justifyContent: "right" }}>
                    <MoveArrows field={field} fi={fi} formik={formik} onSelect={onSelect} />
                    <DeleteButton title="Slet spørgsmål" message="Er du sikker på at du vil slette spørgsmålet?" onConfirm={onDelete} />
                    <CopyItem />
                </Grid>
                {field.type === "choice" && (
                    <FieldArray
                        name={`fields[${fi}].choices`}
                        render={() => (
                            <Grid container spacing={2} item xs={12}>
                                {field.type === "choice" && field.choices.map((choice, ci) => (
                                    <Grid key={choice.id} container item xs={12}>
                                        <IconItem>
                                            <CheckboxBlankCircleLineIcon />
                                        </IconItem>
                                        <Grid item xs={10}>
                                            <Field
                                                as={TextField}
                                                name={`fields[${fi}].choices[${ci}].text`}
                                                variant="standard"
                                                fullWidth
                                                validate={(value: string) => !value && "Du skal indtaste en værdi"}
                                                error={!!((formik.errors?.fields?.[fi] as FormikErrors<SurveyField>)?.choices?.[ci] as FormikErrors<FieldChoice>)?.text}
                                                helperText={((formik.errors?.fields?.[fi] as FormikErrors<SurveyField>)?.choices?.[ci] as FormikErrors<FieldChoice>)?.text}
                                            />
                                        </Grid>
                                    </Grid>
                                ))}

                                <Grid container item xs={12}>
                                    <IconItem>
                                        <CheckboxBlankCircleLineIcon />
                                    </IconItem>
                                    <Grid item xs={10}>
                                        <div
                                            style={{
                                                fontSize: "0.9285714285714286rem",
                                                textDecoration: "underline",
                                                cursor: "pointer",
                                                color: theme.palette.secondary.light,
                                                display: "flex",
                                                alignItems: "center",
                                                height: "100%",
                                            }}
                                            onClick={() => {
                                                const num = field.choices.length;
                                                const choices = [...field.choices, {
                                                    id: Guid.create + "new",
                                                    parentId: Guid.create + "q" + field.index,
                                                    index: num,
                                                    text: "Valgmulighed " + (num + 1),
                                                    value: num
                                                }]
                                                formik.setFieldValue(`fields[${fi}].choices`, choices);
                                            }}
                                        >
                                            Tilføj +
                                        </div>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                    />
                )}
                {field.type === "text" && (
                    <Grid container item xs={12}>
                        <Grid item xs={1} />
                        <Grid item xs={10}>
                            <TextField disabled fullWidth label="Fritekstfelt" />
                        </Grid>
                    </Grid>
                )}
                {field.type === "skiller" && (
                    <ReactQuill value={formik.values.fields[fi].choices[0].text} theme="snow" style={{ marginBottom: 50, marginLeft: 55, width: "84.5%" }} onChange={(e) => formik.setFieldValue(`fields[${fi}].choices[0].text`, e)} />
                )}
            </Grid>
        </Card>
    )
}

export default CreateSurveyFieldCard;