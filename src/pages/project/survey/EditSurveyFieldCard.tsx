import { Survey, SurveyField, FieldChoice } from "../../../models/Survey";
import { Field, FieldArray, FormikProps, FormikErrors } from "formik";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Box,
  Card,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Switch,
  TextField,
  Theme,
  Typography,
  useTheme,
} from "@material-ui/core";
import IconItem from "./IconItem";
import DeleteButton from "../../../components/buttons/DeleteButton";
import FileCopyLineIcon from "remixicon-react/FileCopyLineIcon";
import { ListItemButton } from "@mui/material";
import {
  RiArrowDropUpLine,
  RiArrowDropDownLine
} from "react-icons/ri";
import {
  DropResult,
} from "react-beautiful-dnd";
import { Reorder } from "../../../components/DragDrop/DraggableHelper";
import { DragableItem } from "../../../models/DragableItem";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DraggableList from "../../../components/DragDrop/DraggableList";
import DraggableListItem from "../../../components/DragDrop/DraggableListItem";
import ActionButton from "../../../components/buttons/ActionButton";
import ReactQuill from "react-quill";
import CustomTypography from "../../../components/CustomTypography";
import { Guid } from "../../../lib/Guid";
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

interface EditableSurveyFieldCardProps {
  field: SurveyField;
  fi: number;
  formik: FormikProps<Survey>;
  t: any;
  projLang: string;
  isInUse: boolean;
}

const EditableSurveyFieldCard: React.FC<EditableSurveyFieldCardProps> = ({
  field,
  fi,
  formik,
  isInUse,
  t,
  projLang,
  ...props
}) => {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const useStyles = makeStyles((theme: Theme) => ({
    switchBase: {
      '&.Mui-checked': {
        color: `${theme.palette.primary.main} !important`,
      },
      '&.Mui-checked + .MuiSwitch-track': {
        backgroundColor: `${theme.palette.primary.main} !important`,
      },
    },
  }));
  const classes = useStyles();
  const isGUID = (id: any) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
  
  const fieldIndex = formik.values.fields.findIndex(f => f.index === field.index);
  const choiceIdsRef = useRef<string[]>([]); 

  const mappedDragableItems = useMemo(() => 
    field?.choices
      .sort((a, b) => a.index - b.index)
      .map((item) => 
        new DragableItem(
          item.id,
          item.index,
          item.text,
          item.value.toString()
        )
      ),
    [field?.choices]
  );

  const getLikertLabel = useCallback((amount: number, category: string, index: number, t: any): string => {
    const scaleOptions = t(`SurveyBuilder.scales.Likert.${amount}.${category}`, {
      returnObjects: true,
      lng: projLang
    });
    return scaleOptions[index];
  }, [projLang]);

  const generateLikertScaleChoices = useCallback((amount: number, category: string, skipIndex?: number) => {
    const requiredLength = amount + (skipIndex !== undefined ? 1 : 0);

    // Generate new IDs only if the number of choices has changed
    if (choiceIdsRef.current.length !== requiredLength) {
      choiceIdsRef.current = Array.from({ length: requiredLength }, () => Guid.create().toString());
    }

    return choiceIdsRef.current.map((id: any, index: any) => {
      const adjustedIndex = skipIndex !== undefined && index >= skipIndex ? index - 1 : index;

      if (skipIndex !== undefined && index === skipIndex) {
        return null; // Skip the choice at skipIndex
      }

      // Calculate the value as the opposite of the adjusted index
      const value = (amount - 1) - adjustedIndex;

      return {
        id,
        parentId: `likert_${field.index}`,
        index: adjustedIndex,
        text: getLikertLabel(amount, category, adjustedIndex, t),
        value: value + 1,  // Set the value as the opposite of the adjusted index
      };
    }).filter(choice => choice !== null);
  }, [getLikertLabel, t, field]);

  useEffect(() => {
    if (field?.type === "likert") {
      // Find the correct field index based on field.index
      const fieldIndex = formik.values.fields.findIndex(f => f.index === field.index);
      if (fieldIndex === -1) return; // Guard against field not found
      
      const category = formik.values.fields[fieldIndex].scaleCategory || 'agreement';
      const likertScaleChoiceAmount = formik.values.fields[fieldIndex].likertScaleChoiceAmount || 2;
      const skipNeutral = formik.values.fields[fieldIndex].skipNeutral;

      let adjustedAmount = likertScaleChoiceAmount;
      let skipIndex: number | undefined;

      if ([3, 5, 7].includes(likertScaleChoiceAmount)) {
        skipIndex = !skipNeutral ? Math.floor(likertScaleChoiceAmount / 2) : undefined;
        adjustedAmount = !skipNeutral ? likertScaleChoiceAmount : likertScaleChoiceAmount - 1;
      }

      const newChoices = generateLikertScaleChoices(adjustedAmount, category, skipIndex);

      if (JSON.stringify(field.choices) !== JSON.stringify(newChoices)) {
        formik.setFieldValue(`fields[${fieldIndex}].choices`, newChoices);
      }
    }
  }, [field?.type, field?.index, formik.values.fields, formik.values.fields[fieldIndex]?.scaleCategory, formik.values.fields[fieldIndex]?.likertScaleChoiceAmount, formik.values.fields[fieldIndex]?.skipNeutral]);

  if (fieldIndex === -1) return null;

  const onDeleteQuestion = () => {
    const fields = [...formik.values.fields];
    fields.splice(fieldIndex, 1);
    formik.setFieldValue("fields", fields);
  };

  const onDeleteChoice = (itemIndex: number) => {
    // Filter out the deleted choice
    const choices = field.choices.filter(
      (choice) => choice.index !== itemIndex
    );

    // Reassign indices and values after deletion
    const updatedChoices = choices.map((choice, index) => ({
      ...choice,
      index: index,       // Reset index
      value: index + 1,   // Reset value to be index + 1
    }));

    // Update formik state and component state with the updated choices
    formik.setFieldValue(`fields[${fieldIndex}].choices`, updatedChoices);
  };

  const CopyItem = () => (
    <IconItem>
      <IconButton
        style={{ marginLeft: 50, padding: "15px" }}
        size="medium"
        onClick={() => {
          const timestamp = new Date().getTime();
          const newFieldId = field.id + "T" + timestamp.toString();
          const newField = {
            ...field,
            text: field.text + "-Copy",
            index: formik.values.fields.length,
            fieldIndex: formik.values.fields.length,
            id: newFieldId,
            choices: field.choices.map((c) => ({ ...c, id: c.id + "T" + timestamp.toString(), parentId: newFieldId })),
            type: field.type,
            isNonMandatory: field.isNonMandatory,
            isMultipleChoices: field.isMultipleChoices
          };
          const fields = [...formik.values.fields, newField];
          formik.setFieldValue("fields", fields);
        }}
      >
        <FileCopyLineIcon />
      </IconButton>
    </IconItem>
  );

  const onDragEnd = ({ destination, source }: DropResult) => {
    // Check if the item was dropped outside the list
    if (!destination) return;

    // Reorder the list based on the drag and drop action
    const newItems = Reorder(field.choices, source.index, destination.index);

    // Reassign the indices and values correctly after reordering
    const updatedItems = newItems.map((item, index) => {
      return {
        ...item,
        index: index,         // Update index to reflect the new position
        value: index + 1,     // Reset value to be index + 1
      };
    });

    // Update the formik state and component state with the reordered items
    formik.setFieldValue(`fields[${fieldIndex}].choices`, updatedItems);
  };

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <Card {...props} style={{ flex: 1, marginBottom: '10px', overflow: "unset" }}>
        <div
          style={{
            borderLeft: "1px solid #D5D4DA",
            borderRight: "1px solid #D5D4DA",
          }}
        >
          <ListItemButton
            style={{
              backgroundColor: open ? "#F1F0F6" : "#FFFFFF",
              borderBottom: "1px solid #D5D4DA",
            }}
            onClick={handleClick}
          >
            <DragIndicatorIcon
              color="disabled"
              fontSize="large"
              style={{ paddingBottom: 3, marginRight: 20 }}
            />
            <ListItemText
              disableTypography
              primary={
                <Typography style={{ fontWeight: 600 }} variant="h3">
                  {" " + field?.text}
                </Typography>
              }
            />
            <CopyItem />
            <IconButton
              style={{ marginLeft: 5, padding: "15px" }}
              color="secondary"
              size="small"
            >
              {open ? (
                <RiArrowDropUpLine size="26" color="#503E8E" />
              ) : (
                <RiArrowDropDownLine size="26" color="#503E8E" />
              )}
            </IconButton>
          </ListItemButton>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Grid
              container
              style={{
                padding: "16px 32px",
                justifyContent: "space-between",
                paddingRight: 29
              }}
            >
              {(field?.type !== "skiller" && field?.type !== "text") && (
                <Grid container item xs={12} spacing={1} style={{ marginBottom: 16 }}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.fields[fieldIndex]?.isNonMandatory ?? false}
                          onChange={(e) => formik.setFieldValue(`fields[${fieldIndex}].isNonMandatory`, e.target.checked)}
                          name={`fields[${fieldIndex}].isNonMandatory`}
                          classes={{ switchBase: classes.switchBase }}
                        />
                      }
                      label={t("SurveyBuilder.nonMandatory")}
                      labelPlacement="start"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.fields[fieldIndex]?.isMultipleChoices ?? false}
                          onChange={(e) => formik.setFieldValue(`fields[${fieldIndex}].isMultipleChoices`, e.target.checked)}
                          name={`fields[${fieldIndex}].isMultipleChoices`}
                          classes={{ switchBase: classes.switchBase }}
                        />
                      }
                      label={t("SurveyBuilder.multipleChoices")}
                      labelPlacement="start"
                    />
                  </Grid>
                </Grid>
              )}
              <Grid item xs={11}>
                <Field
                  multiline
                  as={TextField}
                  name={`fields[${fieldIndex}].text`}
                  label={field?.type === "skiller" ? t("SurveyBuilder.separator") : t("SurveyBuilder.question")}
                  variant="outlined"
                  fullWidth
                  validate={(value: string) =>
                    !value && "Du skal indtaste en værdi"
                  }
                  error={
                    !!(formik.errors?.fields?.[fieldIndex] as FormikErrors<SurveyField>)
                      ?.text
                  }
                  helperText={
                    (formik.errors?.fields?.[fieldIndex] as FormikErrors<SurveyField>)
                      ?.text
                  }
                />
              </Grid>
              <Grid
                item
                xs={1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DeleteButton
                  title={t("SurveyBuilder.deletedQuestion")}
                  size={24}
                  message={isInUse ? [t('SurveyBuilder.deleteFieldDialogMessage'), t('SurveyBuilder.deleteDialogMessage2'), t('CrudDialog.enterElementName')] : t("SurveyBuilder.deletedQuestionMsg")}
                  secure={isInUse}
                  securityText={formik.values.fields[fieldIndex]?.text}
                  onConfirm={onDeleteQuestion}
                />
              </Grid>
              {field?.type === "likert" ?
                <FormHelperText style={{ color: theme.palette.info.light, fontSize: '0.75rem' }}>
                  {t('SurveyBuilder.likertLanguageNotice', { lang: t(`keywords.${projLang}`) })}
                </FormHelperText> : null
              }
            </Grid>
            {field?.type === "choice" && (
              <FieldArray
                name={`fields[${fieldIndex}].choices`}
                render={() => (
                  <Grid direction="column" container item xs={12}>

                    <DraggableList
                      title={"Udvalgte spørgeskemaer"}
                      items={[...mappedDragableItems]}
                      onDragEnd={onDragEnd}

                    >
                     {mappedDragableItems.map((item, index) => (

                        <Grid
                          container
                          item
                          xs={12}
                          style={{
                            justifyContent: "space-between",
                          }}
                        >

                          <DraggableListItem
                            item={item}
                            index={index}
                            key={item.id}
                          >

                            <Grid
                              container
                              item
                              xs={10}
                              style={{
                                justifyContent: "flex-end",
                                alignItems: "center"
                              }}
                            >
                              <Grid item xs={11}>
                                <Box style={{ width: "100%", display: "inline-flex", alignItems: "center" }}>
                                  <DragIndicatorIcon
                                    color="disabled"
                                    fontSize="large"
                                    style={{ paddingBottom: 3 }}
                                  />
                                  <Field
                                    multiline
                                    as={TextField}
                                    style={{ padding: "8px 16px" }}
                                    name={`fields[${fieldIndex}].choices[${index}].text`}
                                    variant="outlined"
                                    fullWidth
                                    validate={(value: string) =>
                                      !value && "Du skal indtaste en værdi"
                                    }
                                    error={
                                      !!(
                                        (
                                          formik.errors?.fields?.[
                                          fieldIndex
                                          ] as FormikErrors<SurveyField>
                                        )?.choices?.[index] as FormikErrors<FieldChoice>
                                      )?.text
                                    }
                                    helperText={
                                      (
                                        (
                                          formik.errors?.fields?.[
                                          fieldIndex
                                          ] as FormikErrors<SurveyField>
                                        )?.choices?.[index] as FormikErrors<FieldChoice>
                                      )?.text
                                    }
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={1} justifyContent="flex-end">
                                <ListItemIcon
                                  style={{ flexGrow: 1, justifyContent: "end" }}
                                >
                                  {field.choices.length > 1 && (
                                    <DeleteButton
                                      title={t("SurveyBuilder.deletedOption")}
                                      size={24}
                                      message={isInUse ? [t('SurveyBuilder.deleteFieldDialogMessage'), t('SurveyBuilder.deleteDialogMessage2'), t('CrudDialog.enterElementName')] : t("SurveyBuilder.deletedQuestionMsg")}
                                      secure={isInUse}
                                      securityText={formik.values.fields[fieldIndex]?.text}
                                      onConfirm={() => onDeleteChoice(item.index as number)}
                                    />
                                  )}
                                </ListItemIcon>
                              </Grid>
                            </Grid>
                          </DraggableListItem>
                        </Grid>
                      ))}
                    </DraggableList>

                    <Grid
                      container
                      item
                      xs={12}
                      style={{ borderTop: "solid 1px #D5D4DA" }}
                    >
                      <Grid item xs={12}>
                        <ActionButton
                          style={{ backgroundColor: "#503E8E", margin: "15px 25px" }}
                          onClick={() => {
                            const num = field.choices.length + 1;
                            const index = field.index + 1;
                            const id = Guid.create().toString() + "new-" + num;
                            const text = t("SurveyBuilder.options", { number: num });
                            const choices = [
                              ...field.choices,
                              {
                                id: id.toString(),
                                parentId: id + "q" + field.index,
                                index: index,
                                text: text,
                                value: num,
                              },
                            ];
                            formik.setFieldValue(
                              `fields[${fieldIndex}].choices`,
                              choices
                            );
                          }}
                        >
                          {t("SurveyBuilder.addOption")}
                        </ActionButton>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              />
            )}
            {field?.type === "likert" && (
              <FieldArray
                name={`fields[${fieldIndex}].likert`}
                render={() => (
                  <Grid direction="column" container item xs={12}>
                    <Grid container
                      item
                      spacing={2}
                      xs={12}
                      style={{
                        justifyContent: "space-between",
                        padding: "16px 29px 16px 32px"
                      }}>
                      <Grid item xs={3}>
                        <FormControl variant="outlined" size="small" fullWidth>
                          <InputLabel>{t("SurveyBuilder.scaleCategory.label")}</InputLabel>
                          <Field
                            as={Select}
                            name={`fields[${fieldIndex}].scaleCategory`}
                            label={t("SurveyBuilder.scaleCategory.label")}
                            variant="outlined"
                            size="small"
                            defaultValue="agreement"
                            disabled={isGUID(field?.id)}
                          >
                            <MenuItem value="agreement">{i18n.t("SurveyBuilder.scaleCategory.menuItems.0", { lng: projLang })}</MenuItem>
                            <MenuItem value="satisfaction">{i18n.t("SurveyBuilder.scaleCategory.menuItems.1", { lng: projLang })}</MenuItem>
                            <MenuItem value="frequency">{i18n.t("SurveyBuilder.scaleCategory.menuItems.2", { lng: projLang })}</MenuItem>
                            <MenuItem value="importance">{i18n.t("SurveyBuilder.scaleCategory.menuItems.3", { lng: projLang })}</MenuItem>
                            <MenuItem value="degree">{i18n.t("SurveyBuilder.scaleCategory.menuItems.4", { lng: projLang })}</MenuItem>
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs={2}>
                        <FormControl variant="outlined" size="small" fullWidth>
                          <InputLabel id="likert-scale-label">{t("SurveyBuilder.likertScaleChoiceAmount")}</InputLabel>
                          <Field
                            as={Select}
                            name={`fields[${fieldIndex}].likertScaleChoiceAmount`}
                            variant="outlined"
                            size="small"
                            label={t("SurveyBuilder.likertScaleChoiceAmount")}
                            labelId="likert-scale-label"
                            defaultValue={2}
                            disabled={isGUID(field?.id)}
                          >
                            {[2, 3, 4, 5, 6, 7].map((scale) => (
                              <MenuItem key={scale} value={scale}>{scale}</MenuItem>
                            ))}
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs={7} style={{ display: 'flex', alignItems: 'center' }}>
                        <CustomTypography
                          fontFamily={"'Inter', sans-serif"}
                          variant="caption"
                          fontWeight={400}
                          size={14}
                          style={{
                            verticalAlign: "middle",
                            padding: '0 4px',
                            color: "rgba(0, 0, 0, 0.87)",
                            ...((![3, 5, 7].includes(formik.values.fields[fieldIndex].likertScaleChoiceAmount as number) || isGUID(field?.id)) && { color: 'rgba(0, 0, 0, 0.38)' })
                          }}
                        >
                          {t("SurveyBuilder.isNeutralLabel")}
                        </CustomTypography>
                        <Checkbox
                          checked={formik.values.fields[fieldIndex].skipNeutral}
                          onChange={(event) => {
                            const isChecked = event.target.checked;
                            formik.setFieldValue(`fields[${fieldIndex}].skipNeutral`, isChecked);

                            const category = formik.values.fields[fieldIndex].scaleCategory || 'agreement';
                            const likertScaleChoiceAmount = formik.values.fields[fieldIndex].likertScaleChoiceAmount || 2;

                            // Calculate adjusted amount and index to skip
                            let adjustedAmount = likertScaleChoiceAmount;
                            let skipIndex: number | undefined;

                            if ([3, 5, 7].includes(likertScaleChoiceAmount)) {
                              // Adjust for skipNeutral
                              if (isChecked) {
                                // Add neutral option
                                const adjustment = Math.floor(likertScaleChoiceAmount / 2);
                                skipIndex = adjustment;
                                adjustedAmount = likertScaleChoiceAmount;
                              } else {
                                // Remove neutral option
                                const adjustment = Math.floor(likertScaleChoiceAmount / 2);
                                skipIndex = adjustment;
                                adjustedAmount = likertScaleChoiceAmount - 1;
                              }
                            } else {
                              skipIndex = undefined; // No skip needed for other scale amounts
                            }

                            const newChoices = generateLikertScaleChoices(adjustedAmount, category, skipIndex);

                            // Update Formik and local state
                            formik.setFieldValue(`fields[${fieldIndex}].choices`, newChoices);
                          }}
                          name={`fields[${fieldIndex}].skipNeutral`}
                          color="primary"
                          disabled={!([3, 5, 7].includes(formik.values.fields[fieldIndex].likertScaleChoiceAmount as number)) || isGUID(field?.id)}
                        />

                      </Grid>
                    </Grid>
                    {mappedDragableItems.map((item, index) => (
                      <Grid
                        container
                        item
                        xs={12}
                        style={{
                          justifyContent: "space-between",
                        }}
                      >
                        <Box style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          <Grid item xs={10}>
                            <Field
                              disabled
                              multiline
                              as={TextField}
                              style={{ padding: "8px 16px" }}
                              name={`fields[${fieldIndex}].choices[${index}].text`}
                              variant="outlined"
                              fullWidth
                              validate={(value: string) => !value && "Du skal indtaste en værdi"}
                              error={
                                !!((formik.errors?.fields?.[fieldIndex] as FormikErrors<SurveyField>)?.choices?.[index] as FormikErrors<FieldChoice>)?.text
                              }
                              helperText={
                                ((formik.errors?.fields?.[fieldIndex] as FormikErrors<SurveyField>)?.choices?.[index] as FormikErrors<FieldChoice>)?.text
                              }
                            />
                          </Grid>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              />
            )}
            {field?.type === "skiller" && (
              <ReactQuill
                value={formik.values.fields[fieldIndex].choices[0].text}
                theme="snow"
                style={{ padding: "8px 16px" }}
                modules={{
                  clipboard: {
                    matchVisual: false
                  }
                }}
                placeholder={t("SurveyBuilder.newSurveySeparator")}
                onChange={(e) => {
                  return formik.setFieldValue(`fields[${fieldIndex}].choices[0].text`, e);
                }}
              />
            )}
          </Collapse>
        </div>
      </Card>
    </>
  );
};

export default EditableSurveyFieldCard;
