import {Box} from "@material-ui/core";
import EditButton from "../../../components/buttons/EditButton";
import NameStrategyDialog, {NameForm} from "../strategies/NameStrategyDialog";
import React, {useState} from "react";

interface EditStrategyNameProps {
    name: string;
    onChange: (v: string) => void;
}

const EditStrategyName: React.FC<EditStrategyNameProps> = ({ name, onChange }) => {
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const handleClick = () => setOpen(true);
    const handleSubmit = ({name}: NameForm) => onChange(name);

    return (
        <Box display="flex" alignItems="center">
            <Box mr={2}>{name}</Box>
            <EditButton onClick={handleClick}/>
            <NameStrategyDialog
                onSubmit={handleSubmit}
                open={open}
                onClose={handleClose}
            />
        </Box>
    )
}

export default EditStrategyName;
