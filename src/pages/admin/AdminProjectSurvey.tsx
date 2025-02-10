import React from "react";
import { Link, useParams } from "react-router-dom";
import { useAdminProjectQuery } from "../../hooks/useAdminProjectQuery";
import { Box, Container } from "@material-ui/core";
import Routes from "../../constants/Routes";
import { Survey } from "../../models/Survey";
import { FormikHelpers } from "formik/dist/types";
import history from "../../history";
import SurveyBuilder from "./survey_builder/SurveyBuilder";
import { Guid } from "../../lib/Guid";

const AdminProjectSurvey: React.FC = () => {
    const { projectId, surveyId } = useParams<{ projectId: string, surveyId: string }>();
    const adminProjectQuery = useAdminProjectQuery(projectId);

    const isNew = surveyId === Guid.create + "new";

    const surveys = (adminProjectQuery.elements?.surveys ?? []).map(s => ({
        ...s,
        fields: s.fields.sort((a, b) => a.index - b.index)
    }));

    const initialSurvey: Survey = !isNew ? surveys.find(s => s.id === surveyId) as Survey : {
        id: surveyId,
        parentId: projectId,
        name: "Kort navn",
        longName: "Langt navn",
        description: "Beskrivelse",
        fields: [
            {
                id: Guid.create + "new-q0", parentId: Guid.create + "new", index: 0, text: "Unavngivet spørgsmål", type: "choice",validation: { required: false },
                choices: [{
                    id: Guid.create + "new-o0", parentId: Guid.create + "new-q0", index: 0, text: "Valgmulighed 1", value: 0
                }],
            }
        ],
        validated: false,
        max: 0,
        min: 0,
        threshold: [],
        isNegative: false,
    } as Survey;

    const handleSubmit = async (values: Survey, formikHelpers: FormikHelpers<Survey>) => {
        const fields = values.fields.map((field, fi) => ({
            ...field,
            id: typeof field.id === 'string' && field.id.includes("new") ? "" : field.id,
            index: fi,
            choices: field.choices.map((choice, ci) => ({
                ...choice,
                id: typeof choice.id === 'string' && choice.id.includes("new") ? "" : choice.id,
                index: ci,
            }))
        }));


        const survey = { ...values, fields, id: isNew ? "" : surveyId };

        const res = await adminProjectQuery.upsertProjectSurvey(survey);
        if (res?.success) {
            const route = Routes.adminProjectSurvey
                .replace(":projectId", projectId)
                .replace(":surveyId", res.value.id);
            history.push(route);
        }
    }

    const handleDelete = async () => {
        if (!isNew) {
            await adminProjectQuery.deleteProjectSurvey(surveyId);
            const route = Routes.adminProjectSurveys.replace(":projectId", projectId);
            history.push(route);
        }
    }

    return (
        <Container maxWidth="md">
            <Box pt={4} pb={4}>
                <Box>
                    <Link to={Routes.adminProjects}>
                        Projekter
                    </Link>
                    <span style={{ margin: "0 4px"}}>{" > "}</span>
                    <Link to={Routes.adminProjectSurveys.replace(":projectId", projectId)}>
                        {projectId}
                    </Link>
                </Box>

                <SurveyBuilder
                    survey={initialSurvey}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                />
            </Box>
        </Container>
    )
}

export default AdminProjectSurvey;
