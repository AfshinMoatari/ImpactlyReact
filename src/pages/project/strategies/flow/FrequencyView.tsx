import React, {useEffect, useState} from "react";
import HeadItem from "../../../../components/tables/HeadItem";
import useStrategyContext from "./DataFlowProvider";
import {SurveyFrequencyFormValues} from "./FrequencyDialog";
import {SendoutfrequencyToFrequencyExpression, frequencyExpressionToCron} from "../../../../lib/cron";
import {BatchSendoutData, defaultFrequency, Frequency} from "../../../../models/cron/Frequency";
import CreateButton from "../../../../components/buttons/CreateButton";
import BaseTable from "../../../../components/tables/BaseTable";
import FrequencyChip from "../../../../components/FrequencyChip";
import {Chip} from "@material-ui/core";
import BaseTableCell from "../../../../components/tables/BaseTableCell";
import ColoredIconButton from "../../../../components/buttons/ColoredIconButton";
import PencilFillIcon from "remixicon-react/PencilFillIcon";
import {Guid} from "../../../../lib/Guid";
import SendoutFlowPage from "./SendoutDIalog";
import CloseCircleFillIcon from "remixicon-react/CloseCircleFillIcon";
import {useTranslation} from "react-i18next";


const heads: HeadItem<Frequency>[] = [
    {
        id: "cronExpression",
        numeric: false,
        disablePadding: false,
        label: "Tidspunkt",
        render: f => <FrequencyChip frequency={f}/>
    },
    {
        id: "surveys",
        numeric: false,
        disablePadding: false,
        label: "Spørgeskemaer",
        render: f => f.surveys.map(s => <Chip key={s.id} label={s.name} color="secondary"/>)
    },
    {
        id: "patientsId",
        numeric: true,
        disablePadding: false,
        label: "Deltager",
        render: f => f.patientsId.length
    }
]

const FrequencyView = () => {
    const {state, onChange, touched, onTouch} = useStrategyContext();
    const { t } = useTranslation();

    const heads: HeadItem<Frequency>[] = [
        {
            id: "cronExpression",
            numeric: false,
            disablePadding: false,
            label: t("StrategyFlowPage.FrequencyView.time"),
            render: f => <FrequencyChip frequency={f}/>
        },
        {
            id: "surveys",
            numeric: false,
            disablePadding: false,
            label: t("StrategyFlowPage.FrequencyView.surveys"),
            render: f => f.surveys.map(s => <Chip key={s.id} label={s.name} color="secondary"/>)
        },
        {
            id: "patientsId",
            numeric: true,
            disablePadding: false,
            label: t("StrategyFlowPage.FrequencyView.participant"),
            render: f => f.patientsId.length
        }
    ]

    const [element, setElement] = useState<SurveyFrequencyFormValues>({
        id: "",
        expression: SendoutfrequencyToFrequencyExpression(defaultFrequency),
        surveys: state.surveys,
        patientsId: state.patients.map(p => p.id),
        end: defaultFrequency.end,
    })

    const handleCreateClick = () => {
        setElement({
            id: "",
            expression: SendoutfrequencyToFrequencyExpression(defaultFrequency),
            surveys: state.surveys,
            patientsId: state.patients.map(p => p.id),
            end: defaultFrequency.end,
        });
        setDialogOpen(true);
    }

    const handleEditClick = (freq: SurveyFrequencyFormValues) => (e: React.MouseEvent) => {
        setElement({...freq});
        makeAcopy(freq);
        setEdit(true);
        setDialogOpen(true);
    }

    useEffect(() => {
        if (!touched.stepFrequencies) {
            handleCreateClick()
            onTouch("stepFrequencies")
        }
    }, []);

    const handleChange = (values: SurveyFrequencyFormValues) => {

        const frequency: Partial<Frequency> = {
            id: Guid.create().toString(),
            end: values.end,
            surveys: values.surveys,
            patientsId: values.patientsId,
            cronExpression: frequencyExpressionToCron(values.expression),
        }

        if (values.id) {
            if (edit) {
                const frequencyIndex = state.frequencies.findIndex(f => f.id === values.id)
                if (frequencyIndex !== -1) {
                    state.frequencies[frequencyIndex] = (frequency as Frequency);
                }
            } else {
                const frequencies = [...state.frequencies, (frequency as Frequency)]
                return onChange({
                    ...state,
                    frequencies: frequencies
                });
            }
        }
    }

    const handleRemoveFrequency = (fId: string) => onChange({
        ...state,
        frequencies: [...state.frequencies.filter((freq) => freq.id !== fId)]
    });

    const [open, setDialogOpen] = useState(true);
    const handleClose = () => {
        setElement({
            id: "",
            expression: SendoutfrequencyToFrequencyExpression(defaultFrequency),
            surveys: state.surveys,
            patientsId: state.patients.map(p => p.id),
            end: defaultFrequency.end
        });
        setEdit(false);
        setActiveStep(0);
        setDialogOpen(false);
    }

    const [copyOfSurveyFrequencyFormValues, makeAcopy] = useState<SurveyFrequencyFormValues>({
        id: "",
        expression: SendoutfrequencyToFrequencyExpression(defaultFrequency),
        surveys: state.surveys,
        patientsId: state.patients.map(p => p.id),
        end: defaultFrequency.end
    });

    const [activeStep, setActiveStep] = React.useState<number>(0);
    const [edit, setEdit] = useState<boolean>(false)

    return (
        <React.Fragment>
            <div style={{width: "100%", flex: 1}}>
                <BaseTable<Frequency>
                    heads={heads}
                    elements={state.frequencies}
                    endActions={<CreateButton text={t("StrategyFlowPage.FrequencyView.createSendout")} onClick={handleCreateClick}/>}
                    endCell={freq => (
                        <BaseTableCell align="right" padding="normal">
                            <ColoredIconButton
                                onClick={() => handleRemoveFrequency(freq.id)}
                                flat={true}
                                inverse={true}
                                style={{width: 35, height: 35, padding: 8}}
                            >
                                <CloseCircleFillIcon/>
                            </ColoredIconButton>
                            <ColoredIconButton
                                onClick={handleEditClick({
                                    id: freq.id,
                                    expression: SendoutfrequencyToFrequencyExpression(freq),
                                    surveys: freq.surveys,
                                    patientsId: freq.patientsId,
                                    end: freq.end,
                                })}
                                flat={true}
                                inverse={true}
                                style={{width: 35, height: 35, padding: 8}}
                            >
                                <PencilFillIcon/>
                            </ColoredIconButton>
                        </BaseTableCell>
                    )}
                    disabledSorting
                />
            </div>
            {/* <FrequencyDialog
                surveys={state.surveys}
                onSubmit={handleSubmit}
                onClose={handleClose}
                onRemove={handleRemoveFrequency}
                element={element}
            /> */}

            <SendoutFlowPage
                patients={state.patients}
                surveys={state.surveys}
                edit={edit}
                open={open}
                setsurveyFrequencyFormValues={setElement}
                copyOfSurveyFrequencyFormValues={copyOfSurveyFrequencyFormValues}
                activeStep={activeStep}
                surveyFrequencyFormValues={element}
                setActiveStep={setActiveStep}
                onClose={handleClose}
                onChange={handleChange}
            />
        </React.Fragment>
    )
}

export default FrequencyView;
