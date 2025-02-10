import React, {useState} from "react";
import {Box, Typography} from "@material-ui/core";
import NiceOutliner from "../../../components/containers/NiceOutliner";
import {ProjectRegistration, PStatusRegistration, regName} from "../../../models/Strategy";
import CloseCircleFillIcon from "remixicon-react/CloseCircleFillIcon";
import theme from "../../../constants/theme";
import ColoredIconButton from "../../../components/buttons/ColoredIconButton";
import AddLineIcon from "remixicon-react/AddLineIcon";
import AddRegistrationDialog from "../strategies/AddRegistrationDialog";
import EditButton from "../../../components/buttons/EditButton";
import EditRegistrationDialog from "../strategies/EditRegistationDialog";
import DeleteButton from "../../../components/buttons/DeleteButton"

interface StrategyRegistrations {
    registrations: ProjectRegistration[]
    edit: boolean;
    edited: ProjectRegistration[];
    onChange: (effects: ProjectRegistration[]) => void;
}

const StrategyRegistrations: React.FC<StrategyRegistrations> = ({registrations, edit, edited, onChange}) => {
    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);

    const [curReg, setCurReg] = useState<ProjectRegistration>()
    const handleSubmitEdit = (effects: ProjectRegistration[]) => onChange(effects)
    const handleRemoveEffect = (a: ProjectRegistration) => () => {
        onChange(edited.filter(b => b.id !== undefined ? b.id !== a.id : b.name !== a.name));
    }
    const handleEditRegClick = (ee: ProjectRegistration) => (e: React.MouseEvent) => {
        setCurReg(ee);
        setOpenEdit(true);
        e.preventDefault();
        e.stopPropagation();
    }
    const handleClose = () => setOpen(false);
    const handleCloseEdit = () => setOpenEdit(false)
    const handleAddNewEffect = () => setOpen(true);

    const effects = !edit ? registrations : edited;
    const statusEffects: PStatusRegistration[] = [];
    const accidentEffects: ProjectRegistration[] = [];
    const numericEffects: ProjectRegistration[] = [];
    for (const effect of effects) {
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
        const newCategory = props.map((prop) => category[prop].sort((a: PStatusRegistration, b: PStatusRegistration) => b.index > a.index))
        for (const newCategoryElement of newCategory) {
            newCategoryElement.sort((a: PStatusRegistration, b: PStatusRegistration) => a.index - b.index)
            statusEffects.push(...newCategoryElement)
        }
    }
    const sortedEffects = [...statusEffects, ...accidentEffects, ...numericEffects]
    return (
        <NiceOutliner style={{paddingTop: 16}}>
            <Box display='flex' justifyContent='space-between'>
                <div>
                    <Typography variant="h3" style={{fontWeight: '500'}}>Registreringer</Typography>
                    <Typography variant="subtitle2" style={{paddingBottom: 16}}>
                        Se hvad der kan registreres for borgere
                    </Typography>
                </div>
                {edit && (
                    <ColoredIconButton
                        flat={true}
                        inverse={true}
                        style={{width: 35, height: 35, padding: 8}}
                        onClick={handleAddNewEffect}
                    >
                        <AddLineIcon/>
                    </ColoredIconButton>
                )}
            </Box>
            {edit && (
                <AddRegistrationDialog
                    effects={edited}
                    open={open}
                    onClose={handleClose}
                    onChange={onChange}
                />
            )}
            {sortedEffects.map(e => (
                <NiceOutliner
                    key={e.id}
                    innerStyle={{
                        marginBottom: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    {regName(e)}
                    {edit && (
                        <div>
                            <EditButton onClick={handleEditRegClick(e)}/>
                            <DeleteButton
                                onConfirm={handleRemoveEffect(e)}
                                message="Er du sikker på, at du vil slette denne registrering?"
                                title="Slet registrering"
                            />
                        </div>
                    )}
                </NiceOutliner>
            ))}
            <EditRegistrationDialog
                curReg={curReg}
                effects={effects}
                open={openEdit}
                onClose={handleCloseEdit}
                onChange={handleSubmitEdit}
            />
        </NiceOutliner>

    )
}

export default StrategyRegistrations;
