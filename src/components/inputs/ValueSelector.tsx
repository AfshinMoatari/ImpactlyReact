import React, { useState, ChangeEvent, FocusEvent } from "react";
import { TextField } from "@material-ui/core";
import { GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { PatientRegistrationDataGrid } from "../../models/Registration";

interface ValueSelectorProps {
    p: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>;
    isValid: boolean;
    handleValueChange: (n: number | null, p: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => void;
}

const ValueSelector: React.FC<ValueSelectorProps> = ({ p, isValid, handleValueChange }) => {
    const [value, setValue] = useState<number | string | null>((p.row as PatientRegistrationDataGrid).value);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const { t } = useTranslation();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value === '' ? null : Number(e.target.value);
        setValue(newValue);
        handleValueChange(newValue, p);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(value);
        handleChange(e);
    };

    return (
        <TextField
            style={{ width: '70px' }}
            InputProps={{ inputProps: { min: 0 } }}
            name={t("CommunicationFlowPage.StrategyRegSendoutUpdateView.value")}
            type="number"
            variant="outlined"
            error={!isValid}
            value={isFocused ? value : (p.row as PatientRegistrationDataGrid).value}
            onFocus={() => {
                setIsFocused(true);
                setValue('');
            }}
            onBlur={handleBlur}
            onChange={handleChange}
        />
    );
};

export default ValueSelector;
