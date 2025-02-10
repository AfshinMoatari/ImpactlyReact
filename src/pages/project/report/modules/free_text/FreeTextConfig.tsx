import { ReportModuleConfig } from "../../../../../models/Report";
import React from "react";
import { Field, Form, Formik } from "formik";
import { useAuth } from "../../../../../providers/authProvider";
import { ConfigModuleProps, moduleTypes } from "../index";
import ConfigContainer from "../ConfigContainer";
import FormControl from "@material-ui/core/FormControl";
import { Grid, TextField } from "@material-ui/core";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTranslation } from "react-i18next";
import { NEW_CHART_COLORS } from "../../../../../constants/ChartColors";
export const FreeTextConfig: React.FC<ConfigModuleProps> = ({ onSubmit, submitRef, editModuleConfig }) => {
    const project = useAuth().currentProject;
    const projectId = project?.id as string;
    const handleSubmit = (values: Partial<ReportModuleConfig>) => onSubmit(values);
    const { t } = useTranslation();

    const themeColors = project?.theme && Object.keys(project.theme).length > 0 ? project.theme : NEW_CHART_COLORS;

    const initialValues: Partial<ReportModuleConfig> = {
        type: moduleTypes.freeText,
        name: "",
        freeTextContents: "",
        projectId: projectId,
        colors: themeColors
    }

    return (
        <ConfigContainer>
            <Formik<Partial<ReportModuleConfig>>
                onSubmit={handleSubmit}
                initialValues={editModuleConfig ? editModuleConfig : initialValues}
            >
                {({ values, setFieldValue }) => {
                    return (
                        <Grid item xs={12} container justifyContent="center"
                            style={{ padding: 8 }}
                            alignItems="center"
                        >
                            <Form>
                                <FormControl variant="outlined" fullWidth style={{ marginBottom: 8 }}>
                                    <Field
                                        as={TextField}
                                        id="title"
                                        name="name"
                                        label={t("moduleConfigs.title")}
                                        variant='outlined'
                                        fullWidth
                                        onChange={(e: React.ChangeEvent<{ name?: string; value: string }>) => {
                                            setFieldValue("name", e.target.value);
                                        }}
                                        style={{ marginTop: 16 }}
                                    />
                                </FormControl>
                                <ReactQuill value={values.freeTextContents} theme="snow" onChange={(e) => setFieldValue("freeTextContents", e)} />
                                <button aria-label="submit" type="submit" style={{ display: 'none' }}
                                    ref={submitRef} />
                            </Form>
                        </Grid>
                    )
                }}
            </Formik>
        </ConfigContainer>
    )
}

export default FreeTextConfig;