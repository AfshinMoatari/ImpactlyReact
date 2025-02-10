import React, { ChangeEvent, ReactNode } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      marginTop: theme.spacing(1),
      minWidth: "100%",
    }
  }),
);

export interface SelectDropDownProps {
  defaultValue: unknown;
  options: {[key: string]: string};
  label: string;
  disabled: boolean;
  onChange: (event: ChangeEvent<{ name?: string | undefined; value: unknown; }>, child: ReactNode) => void;
}

export const SelectDropDown: React.FC<SelectDropDownProps> =
    ({
      defaultValue,
      options,
      label,
      onChange,
      disabled
     }) => {
  const classes = useStyles();
  return (
    <>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel>{label}</InputLabel>
        <Select
          onChange={onChange}
          label={label}
          value={defaultValue}    
          disabled={disabled} 
          >
          {Object.entries(options).map(([key, value]) => {
            return (<MenuItem value={key}>{value}</MenuItem>);
          })}
        </Select>
      </FormControl>
    </>
  );
}

export default SelectDropDown