import React, {useState} from "react";
import {Grid} from "@material-ui/core";
import ProjectPatient from "../../../models/ProjectPatient";
import CreateDialog from "../../../components/dialogs/CreateDialog";
import {useProjectCrudListQuery, useProjectCrudQuery} from "../../../hooks/useProjectQuery";
import ProjectTag from "../../../models/ProjectTag";
import {FormikHelpers} from "formik/dist/types";
import ColoredIconButton from "../../../components/buttons/ColoredIconButton";
import AddFillIcon from "remixicon-react/AddFillIcon";
import {isErrorResponse,} from "../../../models/rest/RestResponse";
import TagChip from "../../../components/TagChip";
import ColorPicker, {COLORS} from "../../../components/pickers/ColorPicker";
import CreateButton from "../../../components/buttons/CreateButton";
import {ProjectPatientServiceType} from "../../../services/projectPatientService";
import {useQueryClient} from "react-query";
import {PATHS} from "../../../services/appServices";
import AutocompleteTags from "../../../components/inputs/AutocompleteTags";
import {useTranslation} from "react-i18next";

interface TagChipProps {
    patient: ProjectPatient;
}

interface PatientTagForm {
    value: string;
    tags: ProjectTag[];
    color: string;
}

const PatientTags: React.FC<TagChipProps> = ({patient}) => {
    const tagQuery = useProjectCrudListQuery(services => services.projectTags);
    const patientQuery = useProjectCrudQuery(patient.id, service => service.projectPatients);

    // TODO: mutate!!
    const patientsQuery = useProjectCrudListQuery(service => service.projectPatients);

    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);

    const handleClickNewTag = () => setOpen(true)
    const {t} = useTranslation();

    const handleSubmit = async (values: PatientTagForm, helpers: FormikHelpers<PatientTagForm>) => {
        await patientQuery.updateQuery<ProjectPatientServiceType>(service => service.addTags(patient.id, values.tags));
        await queryClient.invalidateQueries(PATHS.projectPatients(patient.parentId as string))
        helpers.resetForm();
    }

    const handleAddTag = (values: PatientTagForm, setFieldValue: FormikHelpers<PatientTagForm>["setFieldValue"]) => async () => {
        const res = await tagQuery.create({name: values.value, color: values.color});
        if (isErrorResponse(res)) return;

        const tag = res.next[0];
        setFieldValue("tags", [...values.tags, tag]);
        setFieldValue("value", "");
    }

    const handleRemoveTagFromPatient = (tag: ProjectTag) => async () => {
        await patientQuery.updateQuery<ProjectPatientServiceType>(service => service.archiveTag(patient.id, tag.id));
        // TODO: mutate!! Do not invalidate quick fix      
        patientsQuery.invalidate();
    }

    const title = t("CitizenPage.addTagsButton")

    return (
        <React.Fragment>
            <CreateButton
                text={title}
                onClick={handleClickNewTag}
                style={{marginRight: 8, height: 32}}
            />
            {patient.tags
                .map((tag) => (
                    <TagChip
                        key={tag.id}
                        tag={tag}
                        onDelete={handleRemoveTagFromPatient(tag)}
                        style={{marginTop: 0}}
                    />
                ))}
            <CreateDialog<PatientTagForm>
                open={open}
                onClose={() => setOpen(false)}
                initialValues={{value: "", tags: [], color: COLORS[0]}}
                onSubmit={handleSubmit}
                title={title}
            >
                {({values, setFieldValue}) => {
                    const handleChange = (tags: ProjectTag[]) => setFieldValue("tags", tags)
                    const handleInputChange = (v: string) => setFieldValue("value", v);

                    const filter = (tag: ProjectTag) => !patient.tags.map(t => t.projectTagId).includes(tag.id);

                    return (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                {values.tags.map(t => <TagChip tag={t}/>)}
                            </Grid>
                            <Grid item xs={7}>
                                <AutocompleteTags
                                    input={String(values.value)}
                                    onInputChange={handleInputChange}
                                    tags={values.tags}
                                    onChange={handleChange}
                                    filter={filter}
                                    label={t("CitizenPage.nameTags")}
                                />
                            </Grid>

                            <Grid item xs={2} style={{display: "flex"}}>
                                <ColorPicker color={values.color} onChange={(c) => setFieldValue("color", c)}/>
                            </Grid>
                            <Grid item xs={1} style={{display: "flex", alignItems: "end"}}>
                                <ColoredIconButton flat onClick={handleAddTag(values, setFieldValue)}
                                                   disabled={!values.value}>
                                    <AddFillIcon size={20}/>
                                </ColoredIconButton>
                            </Grid>
                        </Grid>
                    )
                }}
            </CreateDialog>
        </React.Fragment>
    )
}

export default PatientTags;
