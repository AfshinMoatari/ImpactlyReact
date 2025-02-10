import {TextField} from "@material-ui/core";
import React, {ChangeEvent, useEffect, useState} from "react";
import {appServices} from "../../services/appServices";
import {Autocomplete} from "@material-ui/lab";
import {AutocompleteRenderInputParams} from "@material-ui/lab/Autocomplete/Autocomplete";
import {DawaPostalMunicipality} from "../../models/location/PostalData";
import {useTranslation} from "react-i18next";

interface MunicipalitySelectorProps {
    postal: string | number | undefined;
    value: string | number | undefined;
    onChange: (value: string) => void;
}

const MunicipalitySelector: React.FC<MunicipalitySelectorProps> = ({value = "", onChange, postal}) => {
    const services = appServices();
    const [options, setOptions] = useState<DawaPostalMunicipality[]>([]);
    const {t} = useTranslation();

    useEffect(() => {
        const fetch = async () => {
            if (postal === undefined) return;

            const res = await services.dawa.getMunicipalities(String(postal));
            if (!res.success) return;

            setOptions(res.value);
            if (!res.value.map(o => o.navn).includes(String(value))) onChange(res.value[0].navn);
        }
        fetch();
    },[postal, value])

    const handleChange = (e: ChangeEvent<{}>, name: string | null) => name !== null && onChange(name);
    const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

    return (
        <Autocomplete
            id="municipality-autocomplete"
            selectOnFocus
            clearOnBlur
            clearOnEscape
            autoComplete
            autoSelect
            disabled={options.length === 1}
            options={options.map(o => o.navn)}
            onChange={handleChange}
            value={String(value)}
            getOptionLabel={(name: string) => name}
            renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField
                    {...params}
                    inputProps={{...params.inputProps, value: value}}
                    label={t('PatientCrudDialog.municipality')}
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

export default MunicipalitySelector;
