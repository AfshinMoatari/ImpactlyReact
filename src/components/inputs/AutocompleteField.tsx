import React, { ChangeEvent, useState } from 'react';
import { TextField, Button, Grid, InputAdornment } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import EraserFillIcon from 'remixicon-react/EraserFillIcon';
import BaseDialog from '../dialogs/BaseDialog';
import { useTranslation } from 'react-i18next';
import { FormHelperText } from '@material-ui/core';

interface AutocompleteFieldsProps {
    inputs: string[];
    onInputsChange: (inputs: string[]) => void;
    label?: string;
    dialogTitle?: string;
    dialogDescription?: string;
    dialogInputLabel?: string;
    dialogInputMaxLength: number;
    multiline : boolean;
    rows: number;
    required?: boolean;
    maxItems: number;
    error: boolean | undefined;
    helperText: React.ReactNode;
    name?: string;
    id?: string;
    variant?: 'standard' | 'outlined' | 'filled';
}

const AutocompleteFields: React.FC<AutocompleteFieldsProps> = ({name, id, variant, inputs, onInputsChange, label, required, dialogTitle, dialogDescription, dialogInputLabel, dialogInputMaxLength, multiline, rows, maxItems, error, helperText}) => {
    const {t} = useTranslation();
    const [openDialog, setOpenDialog] = useState(false);
    const [newItem, setNewItem] = useState('');

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewItem('');
    };

    const handleAddItem = () => {
        if (newItem.trim() !== '') {
            const updatedInputs = [...inputs, newItem];
            onInputsChange(updatedInputs);
            setNewItem('');
            setOpenDialog(false);
        }
    };

    const handleChange = (e: ChangeEvent<{}>, option: string | null) => {
        if (option !== null) {
            const updatedInputs = [...inputs, option];
            onInputsChange(updatedInputs);
        }
    };

    const handleInputClick = () => {
        setOpenDialog(true);
    };

    const handleClearInputs = () => {
        onInputsChange([]);
    };

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Grid container spacing={0}>
                    <Grid item xs={12} sm={11.5}>
                        <Autocomplete
                            options={inputs}
                            onChange={handleChange}
                            open={false}
                            renderInput={(params) => (
                                <>
                                    <TextField
                                        {...params}
                                        id={id}
                                        name={name}
                                        inputProps={{...params.inputProps, value: inputs}}
                                        label={label}
                                        multiline={multiline}
                                        rows={rows}
                                        type="text"
                                        size='small'
                                        fullWidth
                                        autoComplete="off"
                                        required={required}
                                        variant={variant}
                                        onClick={handleInputClick}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">{t("Common.Adornment.maxItems", {context: label?.toLowerCase(), items: maxItems})}</InputAdornment>
                                        }}
                                        error={error}
                                    />
                                    <FormHelperText 
                                        error={error}
                                    >
                                        {
                                        error && (
                                            <span className="error-container" style={{margin: '0 14px'}}>
                                                {helperText}
                                            </span>
                                        )}
                                    </FormHelperText>

                            </>
                            
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={.5}>
                        <Button
                            disabled={inputs.length === 0}
                            color='warning'
                            onClick={handleClearInputs}
                            style={{ marginTop: rows * 8, marginBottom: rows * 8 }}
                        >
                            <EraserFillIcon />
                        </Button>
                    </Grid>
                </Grid>
            </div>
            <BaseDialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                title={dialogTitle}
                description={dialogDescription}
                style={{
                    borderBottom: '2px solid rgba(10, 8, 18, 0.05)',
                    marginBottom: 20,
                    padding: '16px 24px 24px 24px',
                    width: '1000px'
                }} >
                <TextField
                    label={dialogInputLabel}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    variant="outlined"
                    style={{margin: '0 24px'}}
                    multiline
                    minRows={2}
                    inputProps={{
                        maxLength: {dialogInputMaxLength}
                    }}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">{t("Common.Adornment.maxCharLimit", {char: dialogInputMaxLength})}</InputAdornment>,
                    }}
                />
                
                <Button
                    size="large"
                    type='submit'
                    aria-label="submit"
                    onClick={handleAddItem}
                    disabled={!newItem}
                    color={"primary"}
                    style={{fontWeight: 600, marginTop: 24}}
                >
                    {t("RegisterDialog.save")}
                </Button>
            </BaseDialog>
        </>
    );
};

export default AutocompleteFields;
