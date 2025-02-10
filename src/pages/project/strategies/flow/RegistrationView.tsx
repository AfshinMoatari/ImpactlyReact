import BaseTable from "../../../../components/tables/BaseTable";
import React, {useEffect, useState} from "react";
import HeadItem from "../../../../components/tables/HeadItem";
import useStrategyContext from "./DataFlowProvider";
import CloseIcon from "remixicon-react/CloseLineIcon";
import BaseTableCell from "../../../../components/tables/BaseTableCell";
import {
    ProjectRegistration,
    PStatusRegistration, RegistrationTypeMap,
} from "../../../../models/Strategy";
import {CreateButton} from "../../../../components/buttons/CreateButton";
import ColoredIconButton from "../../../../components/buttons/ColoredIconButton";
import AddRegistrationDialog from "../AddRegistrationDialog";
import { useTranslation } from "react-i18next";

const {t} = useTranslation();

const heads: HeadItem<ProjectRegistration>[] = [
    {
        id: "name",
        numeric: false,
        disablePadding: false,
        label: "Registrering",
    },
    {
        id: "id",
        numeric: false,
        disablePadding: true,
        label: "Kategori",
        render: e => e.type === "status" ? (e as PStatusRegistration).category : "",
    },
    {
        id: "type",
        numeric: false,
        disablePadding: true,
        label: "Type",
        render: e => RegistrationTypeMap(t)[e.type],
    }
];


const RegistrationView = () => {
    const {state, onChange, touched, onTouch} = useStrategyContext();
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const handleClick = () => setOpen(true);

    useEffect(() => {
        if (!touched.stepEffects) {
            setOpen(true)
            onTouch("stepEffects")
        }
    }, []);

    const handleRemoveRegistration = (effectId: string) => () => {
        const effects = state.effects.filter(pe => pe.id !== effectId);
        onChange({...state, effects})
    }

    const handleChange = (effects: ProjectRegistration[]) => onChange({...state, effects})

    return (
        <React.Fragment>
            <div style={{width: "100%", flex: 1}}>
                <BaseTable<ProjectRegistration>
                    heads={heads}
                    elements={state.effects as ProjectRegistration[]}
                    endActions={<CreateButton text="Opret registrering" onClick={handleClick}/>}
                    endCell={(row) => (
                        <BaseTableCell padding="checkbox" align="right">
                            <ColoredIconButton
                                onClick={handleRemoveRegistration(row.id)}
                                flat={true}
                                inverse={true}
                                style={{width: 35, height: 35, padding: 8}}
                            >
                                <CloseIcon/>
                            </ColoredIconButton>
                        </BaseTableCell>
                    )}
                />
            </div>
            <AddRegistrationDialog
                effects={state.effects}
                open={open}
                onClose={handleClose}
                onChange={handleChange}
            />
        </React.Fragment>
    )
}

export default RegistrationView;
