import {
    ProjectRegistration,
    PStatusRegistration,
    RegistrationType,
    RegistrationTypeMap
} from "../../../models/Strategy";
import {Grid, InputLabel, MenuItem, Select, TextField, Typography} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import {Field} from "formik";
import React, {ChangeEvent} from "react";
import {Autocomplete} from "@material-ui/lab";
import {AutocompleteRenderInputParams} from "@material-ui/lab/Autocomplete/Autocomplete";
import NiceOutliner from "../../../components/containers/NiceOutliner";
import IconButton from "@material-ui/core/IconButton";
import CloseCircleFillIcon from "remixicon-react/CloseCircleFillIcon";
import theme from "../../../constants/theme";
import AddCircleFillIcon from "remixicon-react/AddCircleFillIcon";
import CreateDialog from "../../../components/dialogs/CreateDialog";
import * as Yup from "yup";
import {Validators} from "../../../lib/Validators";
import {FormikHelpers} from "formik/dist/types";
import {Guid} from "../../../lib/Guid";
import { useTranslation } from "react-i18next";

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
        then: Yup.array().min(1, "Du skal tilføje minimum én registrering")
    }),
    category: Yup.string().when("type", {
        is: (type: string) => type === "status",
        then: Validators.required(),
    })
});

interface EditRegistrationDialogProps {
    curReg?: ProjectRegistration
    effects: ProjectRegistration[];
    open: boolean;
    onClose: VoidFunction;
    onChange: (effects: ProjectRegistration[]) => void;
}

const EditRegistrationDialog: React.FC<EditRegistrationDialogProps> = ({curReg, effects, open, onClose, onChange}) => {
    const { t } = useTranslation();
    const registrationTypeMap = RegistrationTypeMap(t);
    const registrationTypes = Object.keys(registrationTypeMap);

    const handleSubmit = (values: RegisterForm, formikHelpers: FormikHelpers<RegisterForm>) => {
        if (values.type !== "status") {
            const effect = {
                id: curReg?.id,
                name: values.name,
                type: values.type
            } as Partial<ProjectRegistration>;
            const curEffect = effects.find((x) => x.id == effect.id);
            if (curEffect) {
                curEffect.name = effect.name ?? '';
                curEffect.type = effect.type ?? 'count';
            }
            onChange(effects)
        } else {
            const curEffect = effects.find((x) => x.id == curReg?.id)
            if (curEffect) {
                const statusEffects = values.names.map(name => ({...values, name})) as Partial<ProjectRegistration>[];
                curEffect.name = statusEffects[0].name ?? ''
            }
            onChange(effects)
        }

        onClose();
        formikHelpers.resetForm();
    }

    return (
        <CreateDialog<RegisterForm>
            onSubmit={handleSubmit}
            initialValues={{
                type: curReg?.type ?? registrationTypes[0] as RegistrationType,
                names: curReg?.type === "status" ? [(curReg as PStatusRegistration).name] : [],
                name: curReg?.type !== "status" ? curReg?.name ?? '' : [(curReg as PStatusRegistration).name][0],
                category: (curReg as PStatusRegistration)?.category ?? '',
            }}
            title={curReg ? "Rediger registrering" : "Opret registrering"}
            open={open}
            validationSchema={RegisterEffectSchema}
            onClose={onClose}
            enableReinitialize={true}
        >
            {({values, errors, touched, setFieldValue, validateForm, validateField}) => (
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel id="type-label">Vælg type</InputLabel>
                            <Field
                                as={Select}
                                id="type"
                                name="type"
                                labelId="type-label"
                                label="Vælg type"
                                type="select"
                                variant='filled'
                                fullWidth
                                required
                                onChange={(e: React.ChangeEvent<{ name?: string; value: string }>) => {
                                    setFieldValue("type", e.target.value);
                                }}
                                disabled
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
                                name="category"
                                label="Navngiv statuskategori"
                                type="text"
                                variant='filled'
                                fullWidth
                                autoFocus
                                error={errors.name && touched.name}
                                helperText={touched.name && errors.name}
                                disabled
                            />
                        ) : (
                            <Field
                                as={TextField}
                                name="name"
                                label="Navngiv registrering"
                                type="text"
                                variant='filled'
                                fullWidth
                                autoFocus
                                error={errors.name && touched.name}
                                helperText={touched.name && errors.name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue("name", e.target.value)}
                            />
                        )}
                    </Grid>

                    {values.type === "status" && (
                        <div style={{width: "100%", display: "flex", padding: "0 16px 0 8px"}}>
                            <Field
                                as={TextField}
                                name="name"
                                label="Navngiv registrering"
                                type="text"
                                variant='filled'
                                size="small"
                                fullWidth
                                autoFocus
                                error={errors.name && touched.name}
                                helperText={touched.name && errors.name}
                                style={{paddingRight: 8}}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    setFieldValue("names", [e.target.value])
                                    setFieldValue("name", e.target.value);
                                }
                                }
                            />
                        </div>
                    )}
                </Grid>
            )}
        </CreateDialog>
    )
}

export default EditRegistrationDialog;

