import { Survey } from "../../../models/Survey";
import SubmitFreeForm from "../../../components/forms/SubmitFreeForm";
import {
    Box,
    Button,
    Card,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    Menu,
    MenuItem,
    TextField,
    styled,
} from "@mui/material";
import { Field, FieldArray, Formik } from "formik";
import theme from "../../../constants/theme";
import AddLineIcon from "remixicon-react/AddLineIcon";
import React, { useEffect, useState } from "react";
import { FormikHelpers, FormikProps } from "formik/dist/types";
import ViewSurveyFieldCard from "./ViewSurveyFieldCard";
import CreateSurveyFieldCard from "./CreateSurveyFieldCard";
import EditSurveyFieldCard from "./EditSurveyFieldCard";
import { Guid } from "../../../lib/Guid";
import CustomTypography from "../../../components/CustomTypography";
import NiceDivider from "../../../components/visual/NiceDivider";
import DraggableList from "../../../components/DragDrop/DraggableList";
import { DragableItem } from "../../../models/DragableItem";
import DraggableListItem from "../../../components/DragDrop/DraggableListItem";
import { Reorder } from "../../../components/DragDrop/DraggableHelper";
import { Draggable, DropResult } from "react-beautiful-dnd";
import { useAuth } from "../../../providers/authProvider";
import { mapLanguageCode } from "../../../utils/languageHelper";
import i18n from "../../../i18n";

enum options {
    seperator = "skiller",
    freetext = "text",
    choices = "choice",
    likert = "likert"
}
interface validation {
    required: boolean;
}
interface SurveyBuilderProps {
    survey: Survey;
    isNew: boolean;
    edit: boolean;
    onSubmit: (values: Survey, formikHelpers: FormikHelpers<Survey>) => void;
    formik: FormikProps<Survey>;
    t: any;
    isInUse: boolean;
}
interface surveyChoice {
    id: string;
    parentId: string;
    index: number;
    text: string;
    value: number;
}
interface surveyFields {
    type: string;
    choices: surveyChoice[];
    id: string;
    parentId: string;
    index: number;
    text: string;
    validation: validation;
    surveyIsNew: boolean;
}
const CssTextField = styled(TextField)({
    "& label.Mui-focused": {
        color: "#FFFFFF",
    },
    "& .MuiInputLabel-outlined": {
        color: "#FFFFFF",
    },
    "& .MuiOutlinedInput-input": {
        color: "#FFFFFF",
    },
});

const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
    survey,
    isNew,
    edit,
    onSubmit,
    formik,
    t,
    isInUse
}) => {
    const projLang = useAuth().currentProject?.textLanguage;
    const languageCode = mapLanguageCode(projLang as string)
    const mappedDragableItems = survey?.fields?.map(
        (item) => new DragableItem(item.id, item.index, item.text, item.type.toString())
    );
    const [dragableItems, setItems] = React.useState(mappedDragableItems);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedSurvey, setSelectedSurvey] = useState(survey);
    const [isEditting, setIsEditting] = useState(edit);
    const [surveyIsNew, setSurveyIsNew] = useState(isNew);
    useEffect(() => {
        survey = formik?.values;
        const sortedFields = [...(formik?.values?.fields || [])]
        .sort((a, b) => a.index - b.index)
        .map((item) => new DragableItem(
            item.id,
            item.index,
            item.text,
            item.type.toString()
        ));
    setItems(sortedFields);
}, [formik?.values?.fields])
 useEffect(() => {
        setSurveyIsNew(isNew);
    }, [isNew]);
    useEffect(() => {
        setIsEditting(edit);
    }, [edit]);
    useEffect(() => {
        setSelectedSurvey(survey);
    }, [survey]);
    useEffect(() => {
        setItems(mappedDragableItems);
    }, [survey])

    if (selectedSurvey === undefined) return null;
    const newOrEdit = surveyIsNew || isEditting;
    const generateNewField = (survey: Survey, option: options) => {
        const num = formik.values.fields?.length;
        const fieldId = Guid.create + "new-q" + num;
        handleClose();
        return {
            id: fieldId,
            parentId: formik.values.id,
            index: num,
            text: t("SurveyBuilder.newSurveyAnswer"),
            type: option.toString(),
            validation: { required: false },
            choices: [
                {
                    id: Guid.create().toString() + "new-1",
                    parentId: fieldId,
                    index: 0,
                    text: option === "skiller" ? null : t("SurveyBuilder.newSurveyAnswerOption"),
                    value: 1,
                },
            ],
            surveyIsNew: true,
            isNonMandatory: false,
            isMultipleChoices: false
        };
    };
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const onDragEnd = ({ destination, source }: DropResult) => {
        if (!destination) return;
    
        // First update the dragableItems order
        const newDragableItems = Array.from(dragableItems);
        const [reorderedDragableItem] = newDragableItems.splice(source.index, 1);
        newDragableItems.splice(destination.index, 0, reorderedDragableItem);
        setItems(newDragableItems);
    
        // Then update the fields array to match
        const updatedFields = newDragableItems.map((dragItem, idx) => {
            const field = formik.values.fields.find(f => f.id === dragItem.id);
            return {
                ...field,
                index: idx,
                fieldIndex: idx
            };
        });
    
        formik.setFieldValue('fields', updatedFields);
    };
    return (
        <SubmitFreeForm>
            <div
                style={{
                    width: "100%",
                    backgroundColor: "#503E8E",
                    minHeight: 89,
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <CustomTypography
                        fontFamily={"'Lora', sans-serif"}
                        variant="h5"
                        fontWeight={400}
                        size={24}
                        style={{
                            verticalAlign: "middle",
                            padding: '10px 16px',
                            color: "#FFFFFF",
                        }}
                    >
                        {formik.values.name ? formik.values.name : t("SurveyBuilder.name")}
                    </CustomTypography>
                    <CustomTypography
                        fontFamily={"'Inter', sans-serif"}
                        variant="caption"
                        fontWeight={400}
                        size={14}
                        style={{
                            verticalAlign: "middle",
                            padding: '10px 16px',
                            color: "#FFFFFF",
                        }}
                    >
                        {formik.values.description ? formik.values.description : t("SurveyBuilder.description")}
                    </CustomTypography>
                </div>
                {newOrEdit && (
                    <React.Fragment>
                        <IconButton
                            style={{
                                color: "white",
                                width: 56,
                                height: 56,
                                borderRadius: "50%",
                                alignSelf: "center",
                                marginRight: 10
                            }}
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                            onClick={handleClick}
                        >
                            <AddLineIcon style={{ fontSize: 20 }} />
                        </IconButton>
                        <Menu
                            keepMounted
                            id="simple-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem
                                key="seperator"
                                onClick={() => {
                                    const fields = [
                                        ...formik.values.fields,
                                        generateNewField(formik.values, options.seperator),
                                    ];
                                    formik.setFieldValue("fields", fields);
                                }}
                            >
                                {t("SurveyBuilder.separatorText")}
                            </MenuItem>
                            <MenuItem
                                key="freeText"
                                onClick={() => {
                                    const fields = [
                                        ...formik.values.fields,
                                        generateNewField(formik.values, options.freetext),
                                    ];
                                    formik.setFieldValue("fields", fields);
                                }}
                            >
                                {t("SurveyBuilder.freeText")}
                            </MenuItem>
                            <MenuItem
                                key="choices"
                                onClick={() => {
                                    const fields = [
                                        ...formik.values.fields,
                                        generateNewField(formik.values, options.choices),
                                    ];
                                    formik.setFieldValue("fields", fields);
                                }}
                            >
                                {t("SurveyBuilder.questionOptions")}
                            </MenuItem>
                            <MenuItem
                                key="likert"
                                onClick={() => {
                                    const fields = [
                                        ...formik.values.fields,
                                        generateNewField(formik.values, options.likert),
                                    ];
                                    formik.setFieldValue("fields", fields);
                                }}
                            >
                                {t("SurveyBuilder.likertOptions", { lang: mapLanguageCode(projLang as string).toUpperCase() })}
                            </MenuItem>
                        </Menu>
                    </React.Fragment>
                )}
            </div>
            {newOrEdit && (
                <Grid
                    container
                    spacing={1}
                    style={{ marginTop: 15, paddingLeft: 12, paddingRight: 12 }}
                >
                    <Grid container spacing={2} item xs={12}>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                id="name"
                                name="name"
                                label={t("SurveyBuilder.name")}
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled={!newOrEdit}
                                error={formik.touched.name && formik.errors.name}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                id="longName"
                                name="longName"
                                label={t("SurveyBuilder.longName")}
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled={!newOrEdit}
                                error={formik.touched.longName && formik.errors.longName}
                                helperText={formik.touched.longName && formik.errors.longName}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                id="description"
                                name="description"
                                label={t("SurveyBuilder.description")}
                                variant="outlined"
                                size="small"
                                fullWidth
                                multiline
                                disabled={!newOrEdit}
                                error={formik.touched.description && formik.errors.description}
                                helperText={formik.touched.description && formik.errors.description}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            )}
            {!surveyIsNew &&
                !isEditting &&
                [...formik.values.fields]
                    .sort((a, b) => a.index - b.index)
                    .map((field) => (
                        <ViewSurveyFieldCard key={field.id} field={field} fi={field.index} />
                    ))}
            {isEditting && (
                <DraggableList
                    title={"Udvalgte spørgeskemaer"}
                    items={[...dragableItems]}
                    onDragEnd={onDragEnd}
                >
                    {dragableItems.map((item, arrayIndex) => {
                        const field = formik.values.fields?.find(f => f.id === item.id);
                        if (!field) return null;
                        
                        return (
                            <DraggableListItem
                                item={item}
                                index={arrayIndex}  // Use array index instead of field.index
                                key={item.id}
                            >
                                <EditSurveyFieldCard
                                    key={item.id}
                                    field={field}
                                    fi={arrayIndex}  // Use array index here too
                                    formik={formik}
                                    t={t}
                                    projLang={languageCode}
                                    isInUse={isInUse}
                                />
                            </DraggableListItem>
                        );
                    })}
                </DraggableList>
            )}

            {surveyIsNew && (
                <FieldArray
                    name="fields"
                    render={() => (
                        <Box pt={5}>
                            {formik.values.fields?.map((field, fi) => {
                                <CreateSurveyFieldCard
                                    key={field.id}
                                    field={field}
                                    fi={fi}
                                    formik={formik}
                                    t={t}
                                />;
                            })}
                        </Box>
                    )}
                />
            )}
        </SubmitFreeForm>
    );
};

export default SurveyBuilder;
