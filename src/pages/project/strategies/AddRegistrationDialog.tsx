import {
    ProjectRegistration,
    PStatusRegistration,
    RegistrationType,
    RegistrationTypeMap
} from "../../../models/Strategy";
import { Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { Field } from "formik";
import React, { ChangeEvent } from "react";
import { Autocomplete } from "@material-ui/lab";
import { AutocompleteRenderInputParams } from "@material-ui/lab/Autocomplete/Autocomplete";
import NiceOutliner from "../../../components/containers/NiceOutliner";
import IconButton from "@material-ui/core/IconButton";
import CloseCircleFillIcon from "remixicon-react/CloseCircleFillIcon";
import theme from "../../../constants/theme";
import AddCircleFillIcon from "remixicon-react/AddCircleFillIcon";
import CreateDialog from "../../../components/dialogs/CreateDialog";
import * as Yup from "yup";
import { Validators } from "../../../lib/Validators";
import { FormikHelpers } from "formik/dist/types";
import { Guid } from "../../../lib/Guid";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

interface RegisterForm {
    type: RegistrationType;
    name: string;
    category: string;
    names: string[];
}

const RegisterEffectSchema = Yup.object().shape({
    type: Yup.string(),
    name: Yup.string().when("type", {
        is: (type: string) => type !== "status",
        then: Validators.required(),
    }),
    names: Yup.array().when("type", {
        is: (type: string) => type === "status",
        then: Yup.array()
            .min(1, t("StrategyBatchRegistrations.validation.minOneRegistration"))
            .test("unique", t("StrategyBatchRegistrations.validation.duplicateNotAllowed"), function (value) {
                return value ? new Set(value).size === value.length : true;
            })
    }),
    category: Yup.string().when("type", {
        is: (type: string) => type === "status",
        then: Validators.required(),
    })
});

interface AddRegistrationDialogProps {
    effects: ProjectRegistration[];
    open: boolean;
    onClose: VoidFunction;
    onChange: (effects: ProjectRegistration[]) => void;
}

const AddRegistrationDialog: React.FC<AddRegistrationDialogProps> = ({ effects, open, onClose, onChange }) => {
    const { t } = useTranslation();
    const registrationTypeMap = RegistrationTypeMap(t);
    const registrationTypes = Object.keys(registrationTypeMap);
    const categories = effects.reduce((prev, curr) => {
        if (curr.type !== "status") return prev;
        const category = (curr as PStatusRegistration).category;

        return prev.includes(category) ? prev : [...prev, category];
    }, [] as string[])

    const handleSubmit = (values: RegisterForm, formikHelpers: FormikHelpers<RegisterForm>) => {
        if (values.type !== "status") {
            const effect = {
                id: Guid.create().toString(),
                name: values.name,
                type: values.type
            } as Partial<ProjectRegistration>;
            onChange([...effects, effect as ProjectRegistration])
        } else {
            let i = 0;
            const statusEffects = values.names.map(name => ({ ...values, name, index: i++ })) as Partial<ProjectRegistration>[];
            onChange([...effects, ...statusEffects as ProjectRegistration[]])
        }

        onClose();
        formikHelpers.resetForm();
    }

    return (
        <CreateDialog<RegisterForm>
            onSubmit={handleSubmit}
            initialValues={{
                type: registrationTypes[0] as RegistrationType,
                names: [],
                name: "",
                category: "",
            }}
            title={t("StrategyBatchRegistrations.createRegistration")}
            open={open}
            validationSchema={RegisterEffectSchema}
            onClose={onClose}
            validateOnMount
        >
            {({ values, errors, touched, setFieldValue, validateForm, validateField }) => (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2">
                            {t("StrategyBatchRegistrations.selectTypeAndName")}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel id="type-label">{t("StrategyBatchRegistrations.selectTypeLabel")}</InputLabel>
                            <Field
                                as={Select}
                                id="type"
                                name="type"
                                labelId="type-label"
                                label={t("StrategyBatchRegistrations.selectTypeLabel")}
                                type="select"
                                variant='filled'
                                fullWidth
                                required
                                onChange={(e: React.ChangeEvent<{ name?: string; value: string }>) => {
                                    setFieldValue("type", e.target.value);
                                }}
                            >
                                {registrationTypes.map(k => (
                                    <MenuItem key={k} value={k}>
                                        {RegistrationTypeMap(t)[k as keyof typeof RegistrationTypeMap]}
                                    </MenuItem>
                                ))}
                            </Field>
                        </FormControl>
                    </Grid>
                    <Grid item xs={8}>
                        {values.type === "status" ? (
                            <Field
                                as={TextField}
                                id="reg-cat-autocomplete"
                                label={t("StrategyBatchRegistrations.nameOfStatusCategory")}
                                type="text"
                                variant="filled"
                                fullWidth
                                autoComplete="off"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue("category", e.target.value)}
                                options={categories}
                                value={values.type === "status" ? values.category : ""}
                            />
                        ) : (
                            <Field
                                as={TextField}
                                name="name"
                                label={t("StrategyBatchRegistrations.nameOfRegistration")}
                                type="text"
                                variant='filled'
                                fullWidth
                                autoFocus
                                error={errors.name && touched.name}
                                helperText={touched.name && errors.name}
                            />
                        )}
                    </Grid>

                    {values.type === "status" && values.names.length > 0 && values.names.map((n, i) => (
                        <Grid item xs={12}
                            style={{
                                display: "flex",
                                justifyContent: "flex-start",
                                alignItems: "center",
                            }}
                        >
                            <Typography>{i + 1}.</Typography>
                            <NiceOutliner
                                style={{ padding: "0 8px", display: "flex", alignItems: "center", width: "100%" }}
                                innerStyle={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "0 8px",
                                    width: "100%"
                                }}
                            >
                                <Typography>{n}</Typography>
                                <IconButton
                                    onClick={() => {
                                        const names = [...values.names]
                                        names.splice(i, 1);
                                        setFieldValue("names", names)
                                    }}
                                >
                                    <CloseCircleFillIcon size={20} color={theme.palette.primary.light} />
                                </IconButton>
                            </NiceOutliner>
                        </Grid>
                    ))}
                    {values.type === "status" && (
                        <div style={{ width: "100%", display: "flex", padding: "8px 16px 0 8px" }}>
                            <Field
                                as={TextField}
                                name="name"
                                label={t("StrategyBatchRegistrations.nameOfRegistration")}
                                type="text"
                                variant='filled'
                                size="small"
                                fullWidth
                                autoFocus
                                error={values.names.includes(values.name)}
                                helperText={values.names.includes(values.name) ? t("StrategyBatchRegistrations.duplicateStatus") : ""}
                                style={{ paddingRight: 8 }}
                            />
                            <IconButton
                                disabled={!values.name || values.names.includes(values.name)}
                                onClick={async () => {
                                    if (!values.name || values.names.includes(values.name)) return;
                                    setFieldValue("names", [...values.names, values.name])
                                    setFieldValue("name", "");
                                    await validateForm({
                                        ...values,
                                        names: [...values.names, values.name],
                                        name: ""
                                    });
                                }}
                            >
                                <AddCircleFillIcon size={20} color={theme.palette.secondary.light} />
                            </IconButton>
                        </div>
                    )}
                </Grid>
            )}
        </CreateDialog>
    )
}

export default AddRegistrationDialog;

