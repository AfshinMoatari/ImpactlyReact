import {Survey} from "../../../models/Survey";
import SubmitFreeForm from "../../../components/forms/SubmitFreeForm";
import {
    Box, Button,
    Card,
    Grid,
    TextField,
} from "@material-ui/core";
import {PrimaryIconButton} from "../../../components/buttons/BlueButton";
import SaveLineIcon from "remixicon-react/SaveLineIcon";
import DeleteButton from "../../../components/buttons/DeleteButton";
import {Field, FieldArray, Formik} from "formik";
import theme from "../../../constants/theme";
import AddLineIcon from "remixicon-react/AddLineIcon";
import React, {useState} from "react";
import {FormikHelpers} from "formik/dist/types";
import ViewSurveyFieldCard from "./ViewSurveyFieldCard";
import CreateSurveyFieldCard from "./CreateSurveyFieldCard";
import EditSurveyFieldCard from "./EditSurveyFieldCard";
import EditButton from "../../../components/buttons/EditButton";
import { Guid } from "../../../lib/Guid";

interface SurveyBuilderProps {
    survey: Survey;
    onSubmit: (values: Survey, formikHelpers: FormikHelpers<Survey>) => void;
    onDelete: () => Promise<void>;
}

const SurveyBuilder: React.FC<SurveyBuilderProps> = ({survey, onSubmit, onDelete}) => {

    const [selected, setSelected] = useState(0);
    const handleSelect = (index: number) => setSelected(index);
    const [edit, setEdit] = useState(false);

    if (survey === undefined) return null;

    const isNew = survey.id === Guid.create +"new";
    const newOrEdit = isNew || edit;

    const generateNewField = (survey: Survey) => {
        const num = survey.fields.length;
        const fieldId = Guid.create + "new-q" + num;
        return {
            id: fieldId, parentId: survey.id, index: num, text: "Unavngivet spørgsmål", type: "choice",
            validation: { required: false },
            choices: [{
                id: Guid.create + "new-o0", parentId: fieldId, index: 0, text: "Valgmulighed 1", value: 0
            }],
            isNew: true,
        }
    }

    const handleSubmit = (values: Survey, formikHelpers: FormikHelpers<Survey>) => {
        if(values.fields.some((f) => !f.text || f.choices?.some(c => !c.text))) return;
        setEdit(false);
        onSubmit(values, formikHelpers);
    }

    return (
        <Formik<Survey>
            onSubmit={handleSubmit}
            // validationSchema={validationSchema}
            initialValues={survey}
            validateOnMount={false}
            enableReinitialize={false}
        >
            {(formik) => {
                return (
                    <SubmitFreeForm>
                        <Box display="flex" justifyContent="flex-end" pb={2}>
                            {newOrEdit && (
                                <PrimaryIconButton
                                    onClick={formik.submitForm}
                                    icon={SaveLineIcon}
                                    size="small"
                                    style={{marginRight: 8, minWidth: 78}}
                                >
                                    Gem
                                </PrimaryIconButton>
                            )}
                            {!isNew && !edit && <EditButton onClick={() => setEdit(true)} />}
                            {!isNew && <DeleteButton onConfirm={onDelete}/>}
                        </Box>

                        <Card style={{padding: "32px 16px", marginBottom: 32 }}>
                            <Grid container spacing={1}>
                                <Grid container spacing={2} item xs={12}>
                                    <Grid item xs={4}>
                                        <Field
                                            as={TextField}
                                            id="name"
                                            name="name"
                                            label="Navn"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            disabled={!newOrEdit}
                                        />
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Field
                                            as={TextField}
                                            id="longName"
                                            name="longName"
                                            label="Langt navn"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            disabled={!newOrEdit}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            id="description"
                                            name="description"
                                            label="Beskrivelse"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            multiline
                                            rows={2}
                                            disabled={!newOrEdit}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Card>

                        {!isNew && !edit && formik.values.fields.map((field, fi) => (
                            <ViewSurveyFieldCard
                                key={field.id}
                                field={field}
                                fi={fi}
                            />
                        ))}

                        {edit && (
                            <FieldArray
                                name="fields"
                                render={() => (
                                    <Box pt={5}>
                                        {formik.values.fields.map((field, fi) => {
                                            if (selected === fi && !field.isNew) return (
                                                <EditSurveyFieldCard
                                                    key={field.id}
                                                    field={field}
                                                    fi={fi}
                                                    formik={formik}
                                                    onSelect={handleSelect}
                                                />
                                            )

                                            if (selected === fi && field.isNew) return (
                                                <CreateSurveyFieldCard
                                                    key={field.id}
                                                    field={field}
                                                    fi={fi}
                                                    formik={formik}
                                                    onSelect={handleSelect}
                                                />
                                            )

                                            return (
                                                <ViewSurveyFieldCard
                                                    key={field.id}
                                                    field={field}
                                                    fi={fi}
                                                    onClick={() => setSelected(fi)}
                                                />
                                            )
                                        })}
                                    </Box>
                                )}
                            />
                        )}

                        {isNew && (
                            <FieldArray
                                name="fields"
                                render={() => (
                                    <Box pt={5}>
                                        {formik.values.fields.map((field, fi) => {
                                            if (selected === fi) return (
                                                <CreateSurveyFieldCard
                                                    key={field.id}
                                                    field={field}
                                                    fi={fi}
                                                    formik={formik}
                                                    onSelect={handleSelect}
                                                />
                                            )

                                            return (
                                                <ViewSurveyFieldCard
                                                    key={field.id}
                                                    field={field}
                                                    fi={fi}
                                                    onClick={() => setSelected(fi)}
                                                />
                                            )
                                        })}
                                    </Box>
                                )}
                            />
                        )}

                        {newOrEdit && (
                            <Card>
                                <Box display="flex"  justifyContent="center" alignItems="center">
                                    <Button
                                        fullWidth
                                        style={{
                                            padding: 16,
                                            opacity: 0.75,
                                            color: theme.palette.secondary.light
                                        }}
                                        onClick={() => {
                                            const fields = [...formik.values.fields, generateNewField(formik.values)];
                                            formik.setFieldValue("fields", fields);
                                        }}
                                    >
                                        <AddLineIcon />
                                    </Button>
                                </Box>
                            </Card>
                        )}
                    </SubmitFreeForm>
                )
            }}
        </Formik>
    )
}







export default SurveyBuilder;