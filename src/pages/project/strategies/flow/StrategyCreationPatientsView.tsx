import React, { useState } from "react";
import SelectTable from "../../../../components/tables/SelectTable";
import HeadItem from "../../../../components/tables/HeadItem";
import ProjectPatient, { patientSearchFilter } from "../../../../models/ProjectPatient";
import { Grid, Box, TextField, TableCell } from "@material-ui/core";
import AutocompleteTags from "../../../../components/inputs/AutocompleteTags";
import ProjectTag from "../../../../models/ProjectTag";
import DirectionalButton from "../../../../components/buttons/NextButton";
import TagChip from "../../../../components/TagChip";
import { SurveyFrequencyFormValues } from "./FrequencyDialog";
import BaseTableCell from "../../../../components/tables/BaseTableCell";
import {useTranslation} from "react-i18next";


interface StrategyCreationPatientsProps {
    patients: ProjectPatient[];
    surveyFrequencyFormValues: SurveyFrequencyFormValues;
    copyOfSurveyFrequencyFormValues: SurveyFrequencyFormValues;
    setActiveState: (index: number) => void;
    setsurveyFrequencyFormValues: (data: SurveyFrequencyFormValues) => void;
    activeStep: number;
    edit: boolean;
}

const StrategyCreationPatientsView: React.FC<StrategyCreationPatientsProps> = ({
                                                                                   patients,
                                                                                   setActiveState,
                                                                                   surveyFrequencyFormValues,
                                                                                   copyOfSurveyFrequencyFormValues,
                                                                                   setsurveyFrequencyFormValues,
                                                                                   activeStep,
                                                                                   edit
                                                                               }) => {
    const {t} = useTranslation();
    const heads: HeadItem<ProjectPatient>[] = [
        {id: "name", label: t("StrategyFlowPage.StrategyCreationPatientsView.name")},
        {
            id: "tags", numeric:
                false, label: t("StrategyFlowPage.StrategyCreationPatientsView.tags"),
            render: sp =>
                <Box display="flex" maxWidth="160px" flexWrap="wrap">
                    {sp.tags?.map((tag) =>
                        <TagChip key={tag.id} tag={tag} size="small"/>)
                    }
                </Box>
        }
    ];

    const [enableReset, toggleEnableReset] = useState(true);

    const handleSelect = (patientsId: string[]) => {
        setsurveyFrequencyFormValues({
            ...surveyFrequencyFormValues,
            patientsId: patientsId
        });
        toggleEnableReset(false);
    }

    const handleNext = async () => {
        setActiveState(activeStep += 1)
    };
    const handlePrev = async () => {
        if(edit){
            handleReset();
        }
        setActiveState(activeStep -= 1);
    };

    const handleReset = async () => {
        setsurveyFrequencyFormValues({
            ...surveyFrequencyFormValues,
            patientsId: copyOfSurveyFrequencyFormValues.patientsId
        });
        toggleEnableReset(true);
    };

    const handleInput = (v: string) => setInput(v);
    const [input, setInput] = useState("");


    const [tags, setTags] = useState<ProjectTag[]>([]);
    const handleChange = (selectedTags: ProjectTag[]) => {
        setTags(selectedTags);
    };

    const handleDelete = (tag: ProjectTag) => () => handleChange(tags.filter(t => t.id !== tag.id));

    const [searchTerm, setSearch] = useState<string>('');
    let filteredPatients = patients;
    filteredPatients = patients?.filter(patientSearchFilter(searchTerm));
    filteredPatients = filteredPatients.filter(((data: any) => tags.every((tag: ProjectTag) => data.tags?.some((t: any) => t.name.includes(tag.name)))));

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            xs={12}
            style={{gap: 15}}>
            <Grid item xs={12}>
                <Box>
                    <TextField
                        value={searchTerm}
                        onChange={(event) => setSearch(event.target.value)}
                        variant="outlined"
                        label={t("StrategyFlowPage.StrategyCreationPatientsView.filterName")}
                        defaultValue=""
                        fullWidth={true}
                        style={{marginTop: 8, marginBottom:8}}
                    />
                </Box>
                <Box>
                    <AutocompleteTags
                        input={input}
                        onInputChange={handleInput}
                        tags={tags}
                        onChange={handleChange}
                        label={t("StrategyFlowPage.StrategyCreationPatientsView.filterTags")}
                        variant="outlined"
                    />
                    <Box style={{
                        marginTop: 10,
                    }}>
                        {tags && tags.map(tag => <TagChip tag={tag} onDelete={handleDelete(tag)}/>)}
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box>
                    <Box style={{height: 300}}>
                        <SelectTable<ProjectPatient>
                            heads={heads}
                            elements={filteredPatients}
                            selected={surveyFrequencyFormValues.patientsId}
                            setSelected={handleSelect}
                            endCell={() => (<BaseTableCell align="right" padding="none"/>)}
                            endActions={<TableCell style={{display: 'none'}}/>}
                        />
                    </Box>
                </Box>

            </Grid>
            <Grid item xs={12}>
                <Box style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    <Box style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'left'
                    }}>
                        <Box>
                            {edit && (
                                <DirectionalButton
                                    disabled={enableReset}
                                    onClick={handleReset}
                                    text={t("StrategyFlowPage.StrategyCreationPatientsView.resetStep")}
                                    variant="text"
                                ></DirectionalButton>
                            )}
                        </Box>
                    </Box>
                    <Box style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'right'
                    }}>
                        <Box>
                            <DirectionalButton
                                onClick={handlePrev}
                                text={t("StrategyFlowPage.StrategyCreationPatientsView.back")}
                                variant="outlined"
                            ></DirectionalButton>
                        </Box>
                        <Box style={{
                            marginLeft: 10,
                        }}>
                            <DirectionalButton
                                onClick={handleNext}
                                disabled={Boolean(surveyFrequencyFormValues.patientsId.length === 0)}
                                text={t("StrategyFlowPage.StrategyCreationPatientsView.next")}
                                aria-label="submit"
                                variant="contained"
                            >
                            </DirectionalButton>
                        </Box>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    )
}

export default StrategyCreationPatientsView;
