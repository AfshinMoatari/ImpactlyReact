import React, { ChangeEvent, useState } from "react";
import { Box, Typography, AccordionDetails, AccordionSummary, Accordion, List, ListItem, ListItemText, Menu, MenuItem, Backdrop, CircularProgress, DialogContent, Grid, TextField } from "@material-ui/core";
import NiceOutliner from "../../../components/containers/NiceOutliner";
import { PStatusRegistration, ProjectRegistration, distinctEffects, regCategory } from "../../../models/Strategy";
import ArrowDownSLineIcon from "remixicon-react/ArrowDownSLineIcon";
import { IconButton } from "@mui/material";
import { useAppServices } from "../../../providers/appServiceProvider";
import { useAuth } from "../../../providers/authProvider";
import BatchRegistrationDialog from "./BatchRegistrationDialog";
import snackbarProvider from "../../../providers/snackbarProvider";
import AddLineIcon from "remixicon-react/AddLineIcon";
import AddRegistrationDialog from "../strategies/AddRegistrationDialog";
import { BatchSendoutRegistration, PatientRegistrationDataGrid } from "../../../models/Registration";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import theme from "../../../constants/theme";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BaseDialog from "../../../components/dialogs/BaseDialog";
import DirectionalButton from "../../../components/buttons/NextButton";
import { useTranslation } from "react-i18next";

interface StrategyBatchRegistrationsProp {
    strategyId: string;
    effects: ProjectRegistration[];
    onNewValue: (effects: ProjectRegistration[]) => void;
}

interface CRUDEffectResponse {
    success: boolean;
    message?: string;
    value?: any;
};

const StrategyBatchRegistrations: React.FC<StrategyBatchRegistrationsProp> = ({
    strategyId,
    effects,
    onNewValue }) => {

    const [openReg, setRegDialogOpen] = useState(false);
    const [openCreate, setCreateDialogOpen] = useState(false);
    const [activeStep, setActiveStep] = React.useState<number>(0);
    const handleCloseReg = () => setRegDialogOpen(false);
    const handleCloseCreate = () => setCreateDialogOpen(false);
    const { t } = useTranslation();
    const projectId = useAuth().currentProjectId;
    const strategyService = useAppServices().projectStrategies(projectId);

    const [selectedeffects, setSelectedEffects] = useState<ProjectRegistration[]>([] as ProjectRegistration[])
    const [selectedcategory, setCategory] = useState('')
    const [expanded, setExpanded] = React.useState<string | false>();

    const handleCreateDialogOpen = () => {
        setCreateDialogOpen(true);
        setRegDialogOpen(false);
    }

    const handleRegDialogOpen = () => {
        if (selectedEffect) {
            handleCloseMenu();
            setSelectedEffects(uniqueEffects.filter(x => (x as PStatusRegistration).category == regCategory(selectedEffect)) as ProjectRegistration[]);
            setCategory(regCategory(selectedEffect))
            setActiveStep(0);
            setRegDialogOpen(true);
        }
    }
    const handleAccordionExpandClick = (panel: string) => (event: React.ChangeEvent<{}>, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    const [selectedEffect, setSelectedEffect] = useState<ProjectRegistration | null>(null);
    const handleEditDialogOpen = () => { handleCloseMenu(); }
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const [editedEffectName, setEffectName] = useState<string[]>([] as string[]);
    const [isEffectChanged, setEffectChanged] = useState(true);
    const [isEffectResetable, setEffectResetable] = useState(true);

    const effectTypes = Array.from(new Set(effects.map((effect) => effect.type)));
    const statusEffects: PStatusRegistration[] = [];
    const accidentEffects: ProjectRegistration[] = [];
    const numericEffects: ProjectRegistration[] = [];
    for (const effect of effects) {
        switch ((effect as ProjectRegistration).type) {
            case "status":
                statusEffects.push(effect as PStatusRegistration);
                break;
            case "numeric":
                numericEffects.push(effect as ProjectRegistration);
                break;
            case "count":
                accidentEffects.push(effect as ProjectRegistration);
        }
    }
    const categories: any[] = [];
    for (const statusEffect of statusEffects) {
        if (!categories.find((x) => Object.keys(x).find((y) => y == statusEffect.category))) categories.push({ [statusEffect.category]: [] })
        categories.find((x) => Object.keys(x).find((y) => y == statusEffect.category))[statusEffect.category].push(statusEffect)
    }
    statusEffects.splice(0, statusEffects.length);
    for (const category of categories) {
        const props = Object.keys(category);
        const newCategory = props.map((prop) => category[prop].sort((a: PStatusRegistration, b: PStatusRegistration) => b.index > a.index))
        for (const newCategoryElement of newCategory) {
            newCategoryElement.sort((a: PStatusRegistration, b: PStatusRegistration) => a.index - b.index)
            statusEffects.push(...newCategoryElement)
        }
    }
    const sortedEffects = [...statusEffects, ...accidentEffects, ...numericEffects]
    const uniqueEffects = sortedEffects.reduce((unique: ProjectRegistration[], o: any) => {
        if (!unique.some((obj: ProjectRegistration) => (obj as ProjectRegistration).type !== null && (obj as ProjectRegistration).type === (o as ProjectRegistration).name)) {
            unique.push(o);
        }
        return unique;
    }, []);

    const [batchRegistrationData, setBatchRegistrationData] = useState<BatchSendoutRegistration>({
        ids: [] as string[],
        effectId: '',
        registrationDate: new Date(),
        value: 0,
        patientRegistrationDataGrid: [] as PatientRegistrationDataGrid[]
    });
    const handleClick = (effectId: string) => (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedEffect(effects.find(e => e.id === effectId) as ProjectRegistration);
        setAnchorEl(e.currentTarget);
    }
    const handleCloseMenu = () => {
        setAnchorEl(null);
    }

    const handleEditEffect = () => {
        if (selectedEffect) {
            if (selectedEffect.type === 'status') {
                let selectedEffects = ([] as string[]);
                effects.forEach(e => {
                    if ((e as PStatusRegistration).category == selectedEffect.category) {
                        selectedEffects.push(e.name)
                    }
                });
                setEffectName(selectedEffects);
            } else {
                setEffectName([selectedEffect.name]);
            }
            setEditDialogOpen(true);
            handleEditDialogOpen();
        }
        handleCloseMenu();
    }
    const handleDeleteEffect = async () => {
        if (selectedEffect) {
            try {
                setShowDeleteDialog(false);
                const toDeleteEffects = ([] as ProjectRegistration[])
                if (selectedEffect.type === 'status') {
                    let toDelStatus = effects.filter(s => (s as PStatusRegistration).category === selectedEffect.category);
                    toDelStatus.forEach(s => {
                        toDeleteEffects.push(s);
                    });
                } else {
                    toDeleteEffects.push(selectedEffect);
                }
                const res: CRUDEffectResponse = await strategyService.deleteEffects(strategyId, toDeleteEffects.map(({ id }) => id));
                if (!res.success) {
                    console.error(res.message || 'Failed to delete the effect');
                    return false;
                }
                let deletedEffects = res.value as ProjectRegistration[]
                if (deletedEffects !== null) {
                    deletedEffects.forEach(deletedEffect => {
                        const deletedEffectIndex = effects.findIndex((e) => e.id === deletedEffect.id);
                        if (deletedEffectIndex > -1) {
                            effects.splice(deletedEffectIndex, 1);
                        }
                    });
                }
                onNewValue(effects);
                snackbarProvider.success(t("StrategyBatchRegistrations.registrationRemoved"))
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        }
    }

    const handleCreateEffect = async (projectRegistration: ProjectRegistration[]) => {
        try {
            const toCreateEffects = ([] as ProjectRegistration[])
            if (projectRegistration[projectRegistration.length - 1].type === 'status') {
                let toAddStatus = projectRegistration.filter(s => (s as PStatusRegistration).category === (projectRegistration[projectRegistration.length - 1] as PStatusRegistration).category)
                toAddStatus.forEach(s => {
                    toCreateEffects.push(s);
                });
            } else {
                toCreateEffects.push(projectRegistration[projectRegistration.length - 1]);
            }

            const res: CRUDEffectResponse = await strategyService.createEffects(strategyId, toCreateEffects as ProjectRegistration[]);
            if (!res.success) {
                console.error(res.message || 'Failed to create the effect');
                return false;
            }
            onNewValue(effects.concat(res.value as ProjectRegistration[]));
            snackbarProvider.success(t("StrategyBatchRegistrations.regCreated"))
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    const handleEffectNameChange = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, i: number) => {
        let value = e.target.value as string
        let newEditedEffectName = [...editedEffectName]
        newEditedEffectName[i] = value

        setEffectName(newEditedEffectName);
        if (selectedEffect && editedEffectName) {
            if (value !== null) {
                setEffectChanged(false);
                setEffectResetable(false);
            } else {
                setEffectChanged(true);
                setEffectResetable(true);
            }
            if (value === null || value === '') {
                setEffectResetable(false);
                setEffectChanged(true);
            }
        }
    }

    const handleEditSubmit = async () => {
        if (selectedEffect) {
            setEditDialogOpen(false);
            setEffectResetable(true);
            setEffectChanged(true);

            if (selectedEffect.type === 'status') {
                // Get original effects with the original category
                const originalCategory = (effects.find(e => e.id === selectedEffect.id) as PStatusRegistration)?.category;
                const statusEffects = effects.filter(e =>
                    (e as PStatusRegistration).category === originalCategory
                );

                // Create updated effects with new category and names
                const updatedEffects = statusEffects.map((effect, index) => ({
                    ...effect,
                    category: (selectedEffect as PStatusRegistration).category,
                    name: editedEffectName[index] || effect.name
                }));

                // Update the effects array
                const res = await strategyService.updateEffects(strategyId, updatedEffects);
                if (res.success) {
                    const newEffects = [
                        ...effects.filter(e =>
                            (e as PStatusRegistration).category !== originalCategory
                        ),
                        ...updatedEffects
                    ];
                    onNewValue(newEffects);
                    snackbarProvider.success(t("StrategyBatchRegistrations.regUpdated"));
                }
            } else {
                selectedEffect.name = editedEffectName[0];
                const res: CRUDEffectResponse = await strategyService.updateEffects(strategyId, [selectedEffect]);
                if (!res.success) {
                    console.error(res.message || 'Failed to edit the effect');
                    return false;
                }
                setSelectedEffect(selectedEffect);
                snackbarProvider.success(t("StrategyBatchRegistrations.regUpdated"))
                return true;
            }
        }
    }

    const handleReset = () => {
        if (selectedEffect) {
            setEffectResetable(true);
            setEffectChanged(true);
            if (selectedEffect.type === 'status') {
                let selectedEffects = ([] as string[]);
                effects.forEach(e => {
                    if ((e as PStatusRegistration).category == (selectedEffect as PStatusRegistration).category) {
                        selectedEffects.push(e.name)
                    }
                });
                setEffectName(selectedEffects);
            } else {
                setEffectName([selectedEffect.name]);
            }
        }
    }

    return (
        <NiceOutliner style={{ paddingTop: 16 }}>
            <Box display='flex' justifyContent='space-between'>
                <div>
                    <Typography variant="h3" style={{ fontWeight: '500' }}>{t("StrategyBatchRegistrations.registrations")}</Typography>
                    <Typography variant="subtitle2" style={{ paddingBottom: 16 }}>
                        {t("StrategyBatchRegistrations.registrationsSubtitle")}
                    </Typography>
                </div>
                <div>
                    <IconButton>
                        <AddLineIcon
                            onClick={handleCreateDialogOpen}
                        />
                    </IconButton>
                </div>
            </Box>

            {effectTypes.map(et => (
                <Accordion expanded={expanded === et} onChange={handleAccordionExpandClick(et)}>
                    <AccordionSummary aria-controls={`${et}-content`} id={`${et}-header`} expandIcon={<ArrowDownSLineIcon size={28} />}
                    >
                        <Typography>
                            {et === "numeric" ?
                                t("StrategyBatchRegistrations.numeric") :
                                et === "count" ? t("StrategyBatchRegistrations.incident") : t("StrategyBatchRegistrations.status")}
                            ({distinctEffects(uniqueEffects).filter(x => x.type == et).length})
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List style={{ width: "100%" }}>
                            {distinctEffects(uniqueEffects).filter(x => x.type == et).map((e) => (
                                <ListItem key={e.id} style={{ paddingLeft: 2, paddingRight: 2 }}>
                                    <ListItemText style={{ display: 'flex', alignItems: 'center' }}>
                                        {regCategory(e)}
                                    </ListItemText>
                                    {et === "status" ?
                                        <Box style={{ paddingTop: 4, paddingBottom: 4, paddingLeft: 12, paddingRight: 12, borderRadius: 100 }} sx={{ bgcolor: 'rgba(10, 8, 18, 0.08)' }}>
                                            {uniqueEffects.filter(x => x.type === et && x.category == regCategory(e))?.map((ue, index, obj) => {
                                                if (obj.length - 1 === index) {
                                                    return ue.name
                                                } else {
                                                    return ue.name + " -> "
                                                }
                                            })}
                                        </Box> : null
                                    }
                                    <Box>
                                        <IconButton
                                            style={{ color: theme.palette.error.dark, width: 45, height: 45, padding: 8 }}
                                            aria-controls="simple-menu"
                                            aria-haspopup="true"
                                            onClick={handleClick((e as ProjectRegistration).id)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                        <Menu
                                            keepMounted
                                            id="simple-menu"
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleCloseMenu}>
                                            <MenuItem key="register" onClick={handleRegDialogOpen}>
                                                {t("StrategyBatchRegistrations.register")}
                                            </MenuItem>
                                            <MenuItem key="editEffect" onClick={handleEditEffect}>
                                                {t("StrategyBatchRegistrations.rename")}
                                            </MenuItem>
                                            <MenuItem key="removeEffect" onClick={() => { handleCloseMenu(); setShowDeleteDialog(true) }}>
                                                {t("StrategyBatchRegistrations.delete")}
                                            </MenuItem>
                                        </Menu>
                                        <ConfirmDialog
                                            title={t("StrategyBatchRegistrations.delete")}
                                            open={showDeleteDialog}
                                            onClose={() => setShowDeleteDialog(false)}
                                            onConfirm={handleDeleteEffect}
                                        >
                                            {t("StrategyBatchRegistrations.deleteMessage")}
                                        </ConfirmDialog>

                                        <BaseDialog
                                            style={{
                                                borderBottom: '2px solid rgba(10, 8, 18, 0.05)',
                                                marginBottom: 20,
                                                padding: '16px 24px 0 24px'
                                            }}
                                            title={selectedEffect?.type === "numeric" ?
                                                t("StrategyBatchRegistrations.editNumericTitle") :
                                                selectedEffect?.type === "count" ?
                                                    t("StrategyBatchRegistrations.editIncidentTitle") :
                                                    t("StrategyBatchRegistrations.editStatusTitle")}
                                            open={isEditDialogOpen}
                                            fullWidth={false}
                                            maxWidth='lg'
                                            onClose={() => {
                                                setEffectName([] as string[]);
                                                setEditDialogOpen(false);
                                                setEffectResetable(true)
                                                setEffectChanged(true);
                                            }}
                                        >
                                            <Backdrop style={{
                                                zIndex: 10,
                                                color: 'white'
                                            }} open={false}>
                                                <CircularProgress color="inherit" />
                                            </Backdrop>
                                            <DialogContent style={{ padding: '0px 24px 32px 24px', overflow: "Hidden" }}>
                                                <Grid
                                                    container direction="column"
                                                    justifyContent="center"
                                                    xs={12}
                                                    style={{ gap: 15, width: '400px' }}>
                                                    <Grid item xs={12}>
                                                        <Box style={{ marginTop: 15, marginBottom: 20 }}>
                                                            {(selectedEffect?.type === "numeric" ||
                                                                selectedEffect?.type === "count") &&
                                                                <TextField
                                                                    value={editedEffectName[0]}
                                                                    onChange={(e) => handleEffectNameChange(e, 0)}
                                                                    variant="outlined"
                                                                    label={t("StrategyBatchRegistrations.editNameLabel")}
                                                                    defaultValue={editedEffectName[0]}
                                                                    fullWidth={true}
                                                                    style={{ marginTop: 10, marginBottom: 10 }}
                                                                />
                                                            }
                                                            {selectedEffect?.type === "status" && (
                                                                <>
                                                                    <TextField
                                                                        value={(selectedEffect as PStatusRegistration).category}
                                                                        onChange={(e) => {
                                                                            if (selectedEffect) {
                                                                                // Keep existing effect names
                                                                                const currentNames = editedEffectName.length > 0
                                                                                    ? editedEffectName
                                                                                    : effects
                                                                                        .filter(ef => (ef as PStatusRegistration).category === selectedEffect.category)
                                                                                        .map(ef => ef.name);

                                                                                // Update selected effect with new category
                                                                                const updatedSelectedEffect = {
                                                                                    ...selectedEffect,
                                                                                    category: e.target.value
                                                                                };
                                                                                setSelectedEffect(updatedSelectedEffect);
                                                                                setEffectName(currentNames);
                                                                                setEffectChanged(false);
                                                                                setEffectResetable(false);
                                                                            }
                                                                        }}
                                                                        variant="outlined"
                                                                        label={t("StrategyBatchRegistrations.editCategoryLabel")}
                                                                        fullWidth={true}
                                                                        style={{ marginTop: 10, marginBottom: 10 }}
                                                                    />
                                                                    {effects
                                                                        .filter(e => (e as PStatusRegistration).category ===
                                                                            (effects.find(orig => orig.id === selectedEffect?.id) as PStatusRegistration)?.category)
                                                                        .map((se, i) => (
                                                                            <TextField
                                                                                key={i}
                                                                                value={editedEffectName[i]}
                                                                                onChange={(e) => handleEffectNameChange(e, i)}
                                                                                variant="outlined"
                                                                                label={t("StrategyBatchRegistrations.editNameStatusLabel", { index: i + 1 })}
                                                                                fullWidth={true}
                                                                                style={{
                                                                                    marginTop: 10,
                                                                                    marginBottom: 10,
                                                                                    marginLeft: 20,
                                                                                    width: `calc(100% - ${20 * (i + 1)}px)`
                                                                                }}
                                                                            />
                                                                        ))}
                                                                </>
                                                            )}
                                                        </Box>
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <Box style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            justifyContent: 'right'
                                                        }}>
                                                            <Box style={{
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                justifyContent: 'right'
                                                            }}>
                                                                <Box>
                                                                    <DirectionalButton
                                                                        onClick={handleReset}
                                                                        disabled={isEffectResetable}
                                                                        text={t("StrategyBatchRegistrations.resetButton")}
                                                                        variant="text"
                                                                    ></DirectionalButton>
                                                                </Box>
                                                                <Box style={{ marginLeft: 5 }}>
                                                                    <DirectionalButton
                                                                        onClick={handleEditSubmit}
                                                                        disabled={isEffectChanged}
                                                                        text={t("StrategyBatchRegistrations.editButton")}
                                                                        aria-label="submit"
                                                                        variant="contained"
                                                                    >
                                                                    </DirectionalButton>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </DialogContent>
                                        </BaseDialog>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            ))}

            <BatchRegistrationDialog
                strategyId={strategyId}
                open={openReg}
                onClose={handleCloseReg}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                strategyService={strategyService}
                setBatchRegistrationData={setBatchRegistrationData}
                batchRegistrationData={batchRegistrationData}
                effects={selectedeffects}
                category={selectedcategory}
            />

            <AddRegistrationDialog
                effects={effects}
                open={openCreate}
                onClose={handleCloseCreate}
                onChange={handleCreateEffect}
            />
        </NiceOutliner>
    )
}

export default StrategyBatchRegistrations;