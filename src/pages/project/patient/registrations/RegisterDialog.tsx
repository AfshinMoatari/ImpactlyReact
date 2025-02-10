import {Field} from "formik";
import {FormControl, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React from "react";
import Registration, {StatusRegistration} from "../../../../models/Registration";
import {KeyboardDatePicker} from "@material-ui/pickers";
import Strategy, {
    ProjectRegistration,
    PStatusRegistration, RegistrationType,
    RegistrationTypeMap,
    regName
} from "../../../../models/Strategy";
import CreateDialog from "../../../../components/dialogs/CreateDialog";
import snackbarProvider from "../../../../providers/snackbarProvider";
import * as Yup from "yup";
import {Validators} from "../../../../lib/Validators";
import {useQueryClient} from "react-query";
import {useAppServices} from "../../../../providers/appServiceProvider";
import ProjectPatient from "../../../../models/ProjectPatient";
import storageService from "../../../../services/storageService";
import registration from "../../../../models/Registration";
import {useTranslation} from "react-i18next";

// const PatientRegistrationScheme = Yup.object().shape({
//     date: Validators.validDate
//         .concat(Validators.requiredDate).concat(Validators.dateNotInFuture())
// });

interface RegisterDialogProps {
    strategy: Strategy | undefined;
    onClose: VoidFunction;
    open: boolean;
    patient: ProjectPatient | undefined;
    registrations: Registration[];
    currentReg: Partial<Registration> | undefined;
    patientName?: string | undefined;
}

interface UpdateRegistrationResponse {
    success: boolean;
    message?: string;
};

// TODO
export const RegisterDialog: React.FC<RegisterDialogProps> =
    ({
         open,
         strategy,
         onClose,
         patient,
         registrations,
         currentReg
     }) => {
        const {t} = useTranslation();
        const storageClient = storageService('Registration');
        const queryClient = useQueryClient();
        const patientsService = useAppServices().projectPatients(patient?.parentId || '');
        const strategyEffects = strategy?.effects ?? [];
        const statusEffects: PStatusRegistration[] = [];
        const accidentEffects: ProjectRegistration[] = [];
        const numericEffects: ProjectRegistration[] = [];
        for (const effect of strategyEffects) {
            switch (effect.type) {
                case "status":
                    statusEffects.push(effect);
                    break;
                case "numeric":
                    numericEffects.push(effect);
                    break;
                case "count":
                    accidentEffects.push(effect);
            }
        }
        const categories: any[] = [];
        for (const statusEffect of statusEffects) {
            if (!categories.find((x) => Object.keys(x).find((y) => y == statusEffect.category))) categories.push({[statusEffect.category]: []})
            categories.find((x) => Object.keys(x).find((y) => y == statusEffect.category))[statusEffect.category].push(statusEffect)
        }
        statusEffects.splice(0, statusEffects.length);
        for (const category of categories) {
            const props = Object.keys(category);
            const newCategory = props.map((prop) => category[prop].sort((a: PStatusRegistration, b: PStatusRegistration) => a.index - b.index))
            for (const newCategoryElement of newCategory) {
                newCategoryElement.sort((a: PStatusRegistration, b: PStatusRegistration) => a.index - b.index)
                statusEffects.push(...newCategoryElement)
            }
        }
        const sortedEffects = [...statusEffects, ...accidentEffects, ...numericEffects]
        const effectIdMap = sortedEffects.reduce((prev, curr) => ({
            ...prev,
            [curr.id]: curr
        }), {} as { [key: string]: ProjectRegistration });
        const effectTypeMap = sortedEffects.reduce((prev, curr) => {
            curr.type = curr.type === undefined || curr.type === null ? "count" : curr.type;
            if (prev[curr.type] === undefined) prev[curr.type] = [];
            prev[curr.type] = [...prev[curr.type], curr];
            return prev;
        }, {} as { [key: string]: ProjectRegistration[] });
        const handleEdit = async (reg: Partial<Registration>) => {
            try {
                const res: UpdateRegistrationResponse = await patientsService.updateRegistration(patient?.id || '', reg);
                if (!res.success) {
                    console.error(res.message || 'Failed to update registration');
                    return false;
                }

                await queryClient.invalidateQueries(`${patient?.id}/registrations`);
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        };

        const handleSubmit = async (reg: Partial<Registration>) => {
            const effect = strategy?.effects.find(e => e.id === reg.effectId);
            if (!effect) {
                onClose();
                return snackbarProvider.error(t("RegisterDialog.snackbarNoMatchReg"));
            }

            if (!reg.date) return;
            const date = new Date();
            date.setFullYear(reg.date.getFullYear());
            date.setMonth(reg.date.getMonth());
            date.setDate(reg.date.getDate());

            if (effect.type === "status") {
                const statuses = registrations
                    .filter(r => r.type === "status")
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as StatusRegistration[];

                const lastStatus = statuses.find(r => r?.now?.category === (effect as PStatusRegistration).category)

                const registration: Registration = {
                    ...reg,
                    effectName: effect.name,
                    type: "status",
                    before: (lastStatus as StatusRegistration)?.now ?? undefined,
                    now: effect,
                    date
                } as StatusRegistration;

                const res = await patientsService.createRegistration(patient?.id || '', registration);
                if (!res.success) {
                    snackbarProvider.error(t("RegisterDialog.snackError"));
                    return;
                }
                await queryClient.invalidateQueries(`${patient?.id}/registrations`);
                await storageClient.saveState('registrationType', `${reg.type}/${effect.category}/${strategy?.id}`)
                return;
            }

            const registration: Registration = {
                ...reg,
                effectName: effect.name,
                type: effect.type,
                date
            } as Registration;

            const res = await patientsService.createRegistration(patient?.id || '', registration);
            if (!res.success) {
                snackbarProvider.error(t("RegisterDialog.snackError"));
                return;
            }
            await storageClient.saveState('registrationType', `${reg.type}/${reg.effectId}/${strategy?.id}`)
            await queryClient.invalidateQueries(`${patient?.id}/registrations`);
        };
        const lastAnsweredRegAndType = storageClient.loadState<string>("registrationType")
        let lastAnsweredType = null;
        let lastAnsweredCategory = null;
        let lastAnsweredId = null;
        let lastAnsweredStrategy = null;
        if (lastAnsweredRegAndType) {
            lastAnsweredStrategy = lastAnsweredRegAndType.split('/')[2]
            if (lastAnsweredStrategy == strategy?.id) {
                lastAnsweredType = lastAnsweredRegAndType.split('/')[0]
                if (lastAnsweredType as registration["type"] == "status") {
                    lastAnsweredCategory = lastAnsweredRegAndType.split('/')[1]
                }
                lastAnsweredId = lastAnsweredRegAndType.split('/')[1]
            }
        }
        const initialType = lastAnsweredType
            ? lastAnsweredType as registration["type"]
            : (Object.keys(effectTypeMap)[0] ?? "count") as Registration["type"];
        const initialEffect = strategy?.effects[0];
        const initialValues = {
            type: initialType,
            effectId: lastAnsweredId ? lastAnsweredId : initialEffect?.id,
            category: lastAnsweredCategory ? lastAnsweredCategory : initialEffect?.type === "status" ? (initialEffect as PStatusRegistration)?.category : "",
            date: new Date(),
        }
        return (
            <CreateDialog<Partial<Registration & { category: string }>>
                onSubmit={currentReg ? handleEdit : handleSubmit}
                initialValues={currentReg ? currentReg : initialValues}
                title={currentReg ? t("RegisterDialog.titleEdit") : t("RegisterDialog.titleNew")}
                open={open}
                onClose={onClose}
                // validationSchema={PatientRegistrationScheme}
                enableReinitialize
            >
                {({values, errors, touched, setFieldValue}) => {
                    const effects = effectTypeMap[values.type as RegistrationType];
                    const categories = values.type === "status" ?
                        Object.keys(effects.reduce((prev, curr) => ({
                            ...prev,
                            [(curr as PStatusRegistration).category]: 1,
                        }), {} as { [p: string]: Number })) : [];
                    return (
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Field
                                    as={KeyboardDatePicker}
                                    disableToolbar
                                    variant="inline"
                                    inputVariant="filled"
                                    format="dd/MM/yyyy"
                                    margin="normal"
                                    id="registration-date"
                                    name="date"
                                    label={t("RegisterDialog.date")}
                                    invalidLabel=""
                                    invalidDateMessage=""
                                    value={values.date}
                                    onChange={(d: Date | null) => {
                                        if (d) {
                                            const currentDate = new Date();
                                            d.setHours(currentDate.getHours());
                                            d.setMinutes(currentDate.getMinutes());
                                            d.setSeconds(currentDate.getSeconds());
                                        }
                                        setFieldValue("date", d);
                                    }}
                                    KeyboardButtonProps={{'aria-label': 'change date'}}
                                    style={{margin: 0}}
                                    error={errors.date && touched.date}
                                    helperText={touched.date && errors.date}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel variant='filled'>{t("RegisterDialog.registrationType")}</InputLabel>
                                    <Field
                                        as={Select}
                                        name="type"
                                        type="select"
                                        variant='filled'
                                        fullWidth
                                        required
                                        autofocus
                                        disabled={currentReg ?? false}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            const type = e.target.value;
                                            setFieldValue("type", type);
                                            if (type === "status") {
                                                const newEffects = effectTypeMap[type as RegistrationType]
                                                const newCategory = (newEffects[0] as PStatusRegistration).category;
                                                setFieldValue("category", newCategory)
                                                const newCategoryEffects = newEffects.filter(e => (e as PStatusRegistration).category === newCategory)
                                                setFieldValue("effectId", newCategoryEffects[0].id)
                                                return;
                                            }
                                            const newEffects = effectTypeMap[type as RegistrationType]
                                            setFieldValue("effectId", newEffects[0].id);
                                        }}
                                    >
                                        {Object.keys(effectTypeMap).map(type => (
                                            <MenuItem key={type}
                                                      value={type}>{RegistrationTypeMap(t)[type as RegistrationType]}</MenuItem>
                                        ))}
                                    </Field>
                                </FormControl>
                            </Grid>

                            {values.type === "status" && (
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel variant='filled'>{t("RegisterDialog.statusCategory")}</InputLabel>
                                        <Field
                                            as={Select}
                                            name="category"
                                            type="select"
                                            variant='filled'
                                            fullWidth
                                            required
                                            disabled={currentReg ?? false}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                const category = e.target.value;
                                                setFieldValue("category", category)
                                                const newEffect = effects.find(e =>
                                                    (e as PStatusRegistration).category === category);
                                                setFieldValue("effectId", newEffect?.id)
                                                return;
                                            }}
                                        >
                                            {categories.map(category => (
                                                <MenuItem key={category} value={category}>{category}</MenuItem>
                                            ))}
                                        </Field>
                                    </FormControl>
                                </Grid>
                            )}

                            <Grid item xs={values.type === "count" ? 12 : 6}>
                                <FormControl fullWidth>
                                    <InputLabel
                                        variant='filled'>{values.type === "status" ? t("RegisterDialog.statuses") : t("RegisterDialog.registration")}</InputLabel>
                                    <Field
                                        as={Select}
                                        name="effectId"
                                        type="select"
                                        variant='filled'
                                        fullWidth
                                        required
                                        autoFocus
                                        disabled={currentReg ?? false}
                                    >
                                        {(effectTypeMap[values.type as RegistrationType] ?? [])
                                            .filter(e =>
                                                (e as PStatusRegistration).category === values.category || values.type !== "status")
                                            .map(e => (
                                                <MenuItem key={e.id} value={e.id}>{regName(e)}</MenuItem>
                                            ))}
                                    </Field>
                                </FormControl>
                            </Grid>

                            {values.type === "numeric" && (
                                <Grid item xs={6}>
                                    <Field
                                        as={TextField}
                                        name="value"
                                        label={t("RegisterDialog.value")}
                                        type="number"
                                        variant='filled'
                                        fullWidth
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Field
                                    as={TextField}
                                    name="note"
                                    label={t("RegisterDialog.note")}
                                    type="text"
                                    variant='filled'
                                    fullWidth
                                    multiline
                                    minRows={6}
                                />
                            </Grid>
                        </Grid>
                    )
                }}
            </CreateDialog>
        )
    }

export default RegisterDialog;