import {TextField} from "@material-ui/core";
import TagChip from "../TagChip";
import {Autocomplete} from "@material-ui/lab";
import {AutocompleteRenderInputParams} from "@material-ui/lab/Autocomplete/Autocomplete";
import React, {ChangeEvent} from "react";
import ProjectTag from "../../models/ProjectTag";
import {useProjectCrudListQuery} from "../../hooks/useProjectQuery";
import {useTranslation} from "react-i18next";

interface AutocompleteTagsProps {
    input: string;
    onInputChange: (input: string) => void;
    tags: ProjectTag[];
    onChange: (tags: ProjectTag[]) => void;
    filter?: (tag: ProjectTag) => boolean;
    label?: string;
    variant?: 'standard' | 'outlined' | 'filled';
}

const AutocompleteTags: React.FC<AutocompleteTagsProps> = ({variant, input, onInputChange, tags, onChange, filter= () => true, label= "Navn på tag" }) => {
    const tagQuery = useProjectCrudListQuery(services => services.projectTags);
    const {t} = useTranslation();

    const tagIdMap = tagQuery.elements.reduce((prev, curr) =>{
        prev[curr.id] = curr
        return prev
    }, {} as { [id: string]: ProjectTag })

    const handleChange = (e: ChangeEvent<{}>, optionId: string | null) => {
        if (optionId === null) return;
        onChange([...tags, tagIdMap[optionId]]);
    }

    const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value);

    const filteredOptions = tagQuery.elements
        .filter(tag =>
            tag.name.toLowerCase().includes(input.toLowerCase()) &&
            filter(tag) &&
            !tags.map(t => t.id).includes(tag.id))
        .map(tag => tag.id)
        .slice(0, 7);

    return (
        <Autocomplete
            id="tag-autocomplete"
            options={filteredOptions}
            onChange={handleChange}
            value={input}
            renderOption={(id: string) => <TagChip tag={tagIdMap[id]}/>}
            renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField
                    {...params}
                    inputProps={{...params.inputProps, value: input}}
                    label={label}
                    type="text"
                    size='small'
                    fullWidth
                    autoComplete="off"
                    onChange={handleInputChange}
                    variant={variant}
                />
            )}
            noOptionsText={t("CitizenPage.noMatchingTags")}
        />
    )
}

export default AutocompleteTags;
