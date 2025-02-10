import {TextField} from "@material-ui/core";
import React, {ChangeEvent, useEffect, useState} from "react";
import {appServices} from "../../services/appServices";
import {Autocomplete} from "@material-ui/lab";
import {AutocompleteRenderInputParams} from "@material-ui/lab/Autocomplete/Autocomplete";
import {DawaMunicipalityRegion} from "../../models/location/Municipality";
import {useTranslation} from "react-i18next";

interface RegionSelectorProps {
    municipality: string | undefined;
    value: string | number | undefined;
    onChange: (value: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({value = "", onChange, municipality}) => {
    const services = appServices();
    const [options, setOptions] = useState<DawaMunicipalityRegion[]>([]);
    const {t} = useTranslation();

    useEffect(() => {
        const fetch = async () => {
            if (municipality) {
                const res = await services.dawa.getRegions(municipality);
                if (res.success) {
                    setOptions(res.value);
                    if (res.value.length === 1) {
                        onChange(res.value[0].navn);
                    }
                }
            }
        }
        fetch();
    },[municipality])

    const handleChange = (e: ChangeEvent<{}>, name: string | null) => name !== null && onChange(name);
    const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

    return (
        <Autocomplete
            id="region-autocomplete"
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
                    label={t('PatientCrudDialog.region')}
                    type="text"
                    variant="outlined"
                    fullWidth
                    value={value}
                    autoComplete="off"
                    onChange={handleInputChange}
                />
            )}
            noOptionsText={!value ? t('PatientCrudDialog.notEmpty') : t('PatientCrudDialog.noOptions')}
        />
    )
}

export default RegionSelector;
