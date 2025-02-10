import React from 'react';
import Box from '@material-ui/core/Box/Box';
import {InputBaseProps, makeStyles, TextField} from "@material-ui/core";
import {CustomTheme} from "../../constants/theme";
import { styled } from "@mui/material/styles";
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles<CustomTheme>((theme) => ({
    input: {
        'label + &': {
            marginTop: theme.spacing(3),
        },
        borderRadius: 8,
        position: 'relative',
        padding: '4px 10px',
        boxShadow: `${(theme as CustomTheme).custom.palePrimary} 0 0 0 0.1rem`,
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        '&:focus-within': {
            boxShadow: `${theme.palette.primary.light} 0 0 0 0.1rem`,
        },
        '& .remixicon-icon ': {
            color: theme.palette.primary.main,
        },
        '& > input': {
            color: theme.palette.primary.main,
        }
    },
}))

const CssTextField = styled(TextField)({
    "& label.Mui-focused": {
      color: "inherit",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "none",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "none",
      },
      "&:hover fieldset": {
        borderColor: "lightgray",
      },
      "&.Mui-focused fieldset": {
        borderColor: "lightgray",
      },
    },
});

export interface SearchProps {
    search: string;
    onChange: (search: string) => void;
    box?: true;
    width?: React.CSSProperties["width"];
}

type SearchInputProps = SearchProps & Omit<InputBaseProps, "onChange">;

export const SearchInput: React.FC<SearchInputProps> = ({search, box, width, onChange, ...props}) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Box
            height={box ? 32 : undefined}
            display='flex'
            alignItems='center'
            justifyContent='center'
            width={width}
        >
            <CssTextField
                id="søg"
                label={t('PatientListPage.search')}
                value={search}
                onChange={(event) => onChange(event.target.value)}
                variant="outlined"
                style={{marginRight: 8}}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
            />
        </Box>

    )
};

export default SearchInput