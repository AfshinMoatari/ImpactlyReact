import React, {useState} from "react";
import NiceOutliner from "../../../components/containers/NiceOutliner";
import {Box, Chip, Typography} from "@material-ui/core";
import {textifyFrequency} from "../../../components/FrequencyChip";
import {defaultFrequency, Frequency} from "../../../models/cron/Frequency";
import FrequencyDialog, {SurveyFrequencyFormValues} from "../strategies/flow/FrequencyDialog";
import {SendoutfrequencyToFrequencyExpression, frequencyExpressionToCron} from "../../../lib/cron";
import {Guid} from "../../../lib/Guid";
import {Survey} from "../../../models/Survey";
import ColoredIconButton from "../../../components/buttons/ColoredIconButton";
import AddLineIcon from "remixicon-react/AddLineIcon";
import EditButton from "../../../components/buttons/EditButton";
import {t} from "i18next";
import {useLanguage} from "../../../LanguageContext";

interface StrategyFrequencies {
    frequencies: Frequency[];
    edit: boolean;
    edited: Frequency[];
    onChange: (frequencies: Frequency[]) => void;
    availableSurveys: Survey[];
}

const StrategyFrequencies: React.FC<StrategyFrequencies> = ({frequencies, edit, availableSurveys, edited, onChange}) => {
    const [element, setElement] = useState<SurveyFrequencyFormValues>();
    const handleClose = () => setElement(undefined);
    const {language} = useLanguage();

    const handleCreateClick = () => setElement({
        id: "",
        expression: SendoutfrequencyToFrequencyExpression(defaultFrequency),
        surveys: [],
        patientsId: [],
        end: defaultFrequency.end,
    })
    const handleEditClick = (freq: Frequency) => (e: React.MouseEvent) => {
        const formValue: SurveyFrequencyFormValues = {
            id: freq.id,
            expression: SendoutfrequencyToFrequencyExpression(freq),
            surveys: freq.surveys,
            patientsId: freq.patientsId,
            end: freq.end,
        }
        setElement({...formValue});
    }

    const handleSubmit = (values: SurveyFrequencyFormValues) => {
        const frequency: Partial<Frequency> = {
            id: Guid.create().toString(),
            end: values.end,
            surveys: values.surveys,
            cronExpression: frequencyExpressionToCron(values.expression),
        }

        if (values.id) {
            const frequencies = [...edited]
            const frequencyIndex = frequencies.findIndex(f => f.id === values.id)
            if (frequencyIndex !== -1) (frequencies[frequencyIndex] = frequency as Frequency);
            return onChange(frequencies);
        }

        onChange([...edited, frequency as Frequency]);
    }

    const handleRemoveFrequency = (fId: string) => onChange([...edited.filter((freq) => freq.id !== fId)]);

    const freqs = !edit ? frequencies : edited;

    return (
        <NiceOutliner>
            <Box display='flex' justifyContent='space-between'>
                <div>
                    <Typography variant="h3" style={{fontWeight: '500'}}>Udsendelser</Typography>
                    <Typography variant="subtitle2" style={{paddingBottom: 16}}>
                        Se hvornår en samling af jeres valgte spørgeskemaer bliver sendt ud til de
                        tilknyttede borger
                    </Typography>
                </div>
                {edit && (
                    <ColoredIconButton
                        flat={true}
                        inverse={true}
                        style={{width: 35, height: 35, padding: 8}}
                        onClick={handleCreateClick}
                    >
                        <AddLineIcon/>
                    </ColoredIconButton>
                )}
            </Box>
            {edit && (
                <FrequencyDialog
                    surveys={availableSurveys}
                    onSubmit={handleSubmit}
                    onClose={handleClose}
                    onRemove={handleRemoveFrequency}
                    element={element}
                />
            )}
            {freqs.map(f => (
                <NiceOutliner
                    key={f.id}
                    innerStyle={{
                        marginBottom: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <span style={{fontSize: 16}}>{textifyFrequency(f, t, language)}</span>
                    <div>
                        {f.surveys.map((s, i) =>
                            <Chip
                                key={s.id}
                                label={`${i+1}. ${s.name}`}
                                color="secondary"
                                style={{marginRight: 8}}
                            />
                        )}
                    </div>
                    {edit && <EditButton onClick={handleEditClick(f)} />}
                </NiceOutliner>
            ))}
        </NiceOutliner>
    )
}

export default StrategyFrequencies;
