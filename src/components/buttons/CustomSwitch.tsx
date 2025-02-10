import React from 'react';
import { Switch } from '@mui/material';
import { SxProps, Theme } from '@mui/system';

interface CustomSwitchProps {
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    name?: string;
    sx?: SxProps<Theme>;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
                                                              checked,
                                                              onChange,
                                                              name,
                                                              sx,
                                                              ...props
                                                          }) => {
    const defaultStyles = {
        '& .MuiSwitch-switchBase': {
            padding: '17px',
            '&.Mui-checked': {
                color: '#fff',
                transform: 'translateX(12px)',
                '& + .MuiSwitch-track': {
                    backgroundColor: '#ED4C2F',
                    opacity: 1,
                },
            },
        },
        '& .MuiSwitch-thumb': {
            width: 9,
            height: 9,
        },
        '& .MuiSwitch-track': {
            borderRadius: '10px / 50%',
            width: '30px',
            height: '19px',
        },
        ...sx,
    };

    return (
        <Switch
            checked={checked}
            onChange={onChange}
            name={name}
            sx={defaultStyles}
            {...props}
        />
    );
};

export default CustomSwitch;