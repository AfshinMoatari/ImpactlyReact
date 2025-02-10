import {Survey, SurveyField, FieldChoice} from "../../../models/Survey";
import {Field, FieldArray, FormikProps, FormikErrors} from "formik";
import React from "react";
import {
    Card,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import FileCopyLineIcon from "remixicon-react/FileCopyLineIcon";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import theme from "../../../constants/theme";
import IconItem from "./IconItem";
import {Guid} from "../../../lib/Guid";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
interface EditableSurveyFieldCardProps {
    field: SurveyField;
    fi: number;
    formik: FormikProps<Survey>;
    t: any;
}

const CreateSurveyFieldCard: React.FC<EditableSurveyFieldCardProps> = ({field, fi, formik, t}) => {

    const CopyItem = () => (
        <IconItem>
            <IconButton
                size="small"
                onClick={() => {
                    const newFieldId = field.id + "copy";
                    const newField = {
                        ...field,
                        id: newFieldId,
                        choices: field.choices.map(c => ({...c, parentId: newFieldId}))
                    };
                    const fields = [...formik.values.fields];
                    fields.splice(fi + 1, 0, newField);
                    formik.setFieldValue("fields", fields);
                }}
            >
                <FileCopyLineIcon/>
            </IconButton>
        </IconItem>
    )

    const DeleteItem = () => (
        <IconItem>
            <IconButton
                size="small"
                onClick={() => {
                    const fields = [...formik.values.fields];
                    fields.splice(fi, 1);
                    formik.setFieldValue("fields", fields);
                }}
            >
                <CloseLineIcon/>
            </IconButton>
        </IconItem>
    )

    return (
        <Card style={{padding: "16px 8px", marginBottom: 16}}>
            <Grid container spacing={3}>
                <Grid item xs={8} style={{display: "flex", alignItems: "center"}}>
                    <Typography variant="h3" style={{padding: "8px 16px"}}>
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
                <Grid item xs={3}>
                    <FormControl variant="outlined" style={{width: "100%"}}>
                        <InputLabel htmlFor="type">Type</InputLabel>
                        <Field
                            id="type"
                            as={Select}
                            name={`fields[${fi}].type`}
                            label="Type"
                            type="select"
                            variant='outlined'
                            size='small'
                        >
                            <MenuItem value="choice">Svarmuligheder</MenuItem>
                            <MenuItem value="text">Fritekst </MenuItem>
                            <MenuItem value="skiller">Skiller</MenuItem>
                        </Field>
                    </FormControl>
                </Grid>

                {field.type === "choice" && (
                    <FieldArray
                        name={`fields[${fi}].choices`}
                        render={() => (
                            <Grid container spacing={2} item xs={12}>
                                {field.type === "choice" && field.choices.map((choice, ci) => (
                                    <Grid key={choice.id} container item xs={12}>
                                        <IconItem>
                                            <CheckboxBlankCircleLineIcon/>
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
                                        <IconItem>
                                            <IconButton size="small" onClick={() => {
                                                const choices = field.choices.filter(c => c.id !== choice.id);
                                                formik.setFieldValue(`fields[${fi}].choices`, choices);
                                            }}>
                                                <CloseLineIcon/>
                                            </IconButton>
                                        </IconItem>
                                    </Grid>
                                ))}

                                <Grid container item xs={12}>
                                    <IconItem>
                                        <CheckboxBlankCircleLineIcon/>
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
                                                    id: Guid.create + "new-o" + num,
                                                    parentId: Guid.create + "q" + field.index,
                                                    index: num,
                                                    text: t("SurveyBuilder.options", {number: num + 1}),
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
                        <Grid item xs={1}/>
                        <Grid item xs={10}>
                            <TextField disabled fullWidth label="Fritekstfelt"/>
                        </Grid>
                    </Grid>
                )}
                {field.type === "skiller" && (
                    <ReactQuill theme="snow" style={{marginBottom: 20, marginLeft: 55, width: "84.5%"}} onChange={(e) => formik.setFieldValue(`fields[${fi}].choices[0].text`, e)}/>
                )}
                <Grid item xs={12} style={{display: "flex", justifyContent: "flex-start", marginTop: 16}}>
                    <DeleteItem/>
                    <CopyItem/>
                </Grid>

            </Grid>
        </Card>
    )
}

export default CreateSurveyFieldCard;