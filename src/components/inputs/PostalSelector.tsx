import {TextField} from "@material-ui/core";
import React, {ChangeEvent, useState} from "react";
import {appServices} from "../../services/appServices";
import DawaPostal from "../../models/location/DawaPostal";
import {Autocomplete} from "@material-ui/lab";
import {AutocompleteRenderInputParams} from "@material-ui/lab/Autocomplete/Autocomplete";
import {useTranslation} from "react-i18next";

interface PostalNumberFieldSelectorProps {
    value: string | number | undefined;
    onChange: (value: string) => void;
}

const PostalSelector: React.FC<PostalNumberFieldSelectorProps> = ({value = "", onChange}) => {
    const services = appServices();
    const [options, setOptions] = useState<DawaPostal[]>([]);
    const {t} = useTranslation();

    const fetch = async (v: string) => {
        const res = await services.dawa.autoCompletePostal(v);
        if (res.success) {
            setOptions(res.value);
        }
    }

    const handleChange = (e: ChangeEvent<{}>, o: DawaPostal | null) => {
        if (o !== null) {
            onChange(o.postnummer.nr);
        }
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        if (isNaN(Number(v))) return
        if (v.length === 4) return onChange(v);
        if (v.length < 4) {
            onChange(v);
            fetch(v);
        }
    }


    return (
        <Autocomplete
            id="postalNumber-autocomplete"
            selectOnFocus
            clearOnBlur
            clearOnEscape
            autoComplete
            autoSelect
            options={options}
            onChange={handleChange}
            getOptionLabel={(o: DawaPostal) => o.postnummer.nr}
            renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField
                    {...params}
                    inputProps={{...params.inputProps, value: value}}
                    label={t('PatientCrudDialog.postNumber')}
                    type="text"
                    variant="outlined"
                    fullWidth
                    autoComplete="off"
                    onChange={handleInputChange}
                />
            )}
            noOptionsText={!value ? t('PatientCrudDialog.notEmpty') : t('PatientCrudDialog.noOptions')}
        />
    )
}

export default PostalSelector;
