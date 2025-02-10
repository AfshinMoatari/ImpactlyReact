import {FormControl, InputLabel, MenuItem, Select, SelectProps} from "@material-ui/core";
import React from "react";

const LabeledSelect: React.FC<SelectProps> = ({ name, ...props}) => {

    const labelId = name + "-labeled-selector-id"

    return (
        <FormControl variant="filled">
            <InputLabel id={labelId}>{props.label}</InputLabel>
            <Select
                labelId={labelId}
                name={name}
                {...props}
            />
        </FormControl>
    )
}

export default LabeledSelect;
