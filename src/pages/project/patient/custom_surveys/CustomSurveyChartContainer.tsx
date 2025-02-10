import React, { useState } from "react";
import ProjectPatient from "../../../../models/ProjectPatient";
import { EntryBatch, Survey } from "../../../../models/Survey";
import Accordion from "@material-ui/core/Accordion";
import {
    AccordionSummary,
    AccordionDetails,
    Typography,
    Select,
    Divider,
    MenuItem,
    Box,
} from "@material-ui/core";
import ArrowDownSLineIcon from "remixicon-react/ArrowDownSLineIcon";
import { useQuery } from "react-query";
import { useAppServices } from "../../../../providers/appServiceProvider";
import BarGraph from "../../../../components/charts/BarGraph";
import EmptyButtonView from "../../../../components/containers/EmptyView";
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import { TextField } from "@mui/material";
import FormControl from "@material-ui/core/FormControl";
import { AnswerProps } from '../../../../models/Survey'
import { useTranslation } from "react-i18next";
import BaseTable from "../../../../components/tables/BaseTable";
import HeadItem from "../../../../components/tables/HeadItem";
import BaseTableCell from "../../../../components/tables/BaseTableCell";

interface CustomSurveyChartContainerProps {
    patient: Required<ProjectPatient>;
    templates: Survey[];
}

const CustomSurveyChartContainer: React.FC<CustomSurveyChartContainerProps> = ({ patient, templates }) => {
    const templatesExist = templates.length > 0;
    const [templateId, setTemplateId] = useState(templatesExist ? templates[0].id : "");
    const currentTemplate = templates.find(s => s.id === templateId) as Survey;
    const questions = currentTemplate?.fields.sort((a, b) => a.index - b.index);
    const [questionId, setQuestionId] = useState("");
    const [freeTextId, setFreeTextId] = useState("");
    const currentQuestionAnswers = questions?.filter(q => q.id === questionId)[0]?.choices;
    const { t } = useTranslation();

    const correctedValueAnswers =
        currentQuestionAnswers && currentQuestionAnswers[0] && currentQuestionAnswers[0].value === 0
            ? currentQuestionAnswers?.map((d) => ({
                value: d.value + 1,
                text: d.text
            }))
            : currentQuestionAnswers?.map((d) => ({
                value: d.value,
                text: d.text
            }));

    const patientsService = useAppServices().projectPatients(patient.parentId);

    const customQuery = useQuery<EntryBatch[]>({
        queryKey: `${patient.id}/custom-survey?`,
        queryFn: async () => {
            const res = await patientsService.getCustomSurveyAnswers(patient.id);
            if (!res.success) return [];
            return res.value;
        },
        staleTime: Infinity,
        cacheTime: Infinity
    });

    const dataIn: EntryBatch[] = (customQuery.data ?? []).filter(eb => eb.surveyId === templateId);
    const filteredData = dataIn.filter(item => item.fieldId === questionId);

    const freeTextAnswers = currentTemplate?.fields.filter(q => q.type === "text");
    freeTextAnswers.map(answer => {
        const curAnswer = dataIn?.filter(item => item.fieldId === answer.id);
        if (curAnswer.length > 0 || curAnswer != undefined) {
            curAnswer.sort((a, b) => {
                return new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime()
            })
            const jsonArray: Array<AnswerProps> = [];
            for (let i = 0; i < curAnswer.length; i++) {
                jsonArray.push({ answeredAt: new Date(curAnswer[i].answeredAt).toLocaleDateString(), answer: curAnswer[i].text ?? '' })
            }
            answer.answer = jsonArray;
        }
    });

    const formattedData = filteredData?.map((d) => ({
        label: d.choiceText,
        value: d.value,
        time: d.answeredAt !== undefined && new Date(d.answeredAt).getTime() > 0 ? new Date(d.answeredAt).getTime() : new Date(d.createdAt).getTime(),
    }));
    formattedData.sort((a, b) => a.time - b.time);

    const formattedDates = currentQuestionAnswers && currentQuestionAnswers[0] && currentQuestionAnswers[0].value === 0
        ? formattedData?.map((d) => ({
            label: d.label,
            value: d.value !== undefined && d.value + 1,
            time: new Date(d.time).toLocaleDateString('en-GB'),
        }))
        : formattedData?.map((d) => ({
            label: d.label,
            value: d.value,
            time: new Date(d.time).toLocaleDateString('en-GB'),
        }));

    const yAxisTickFormatter = (value: any) => {
        const x = correctedValueAnswers?.filter(el => el.value === value)
        if (x?.length > 0)
            if (x[0].text !== undefined)
                return x[0].value.toString()
        return ""
    }

    const TableDataFormatter = () => {
        return correctedValueAnswers.map((c) => {
            const matchingDates = formattedDates.filter(el => el.label === c.text);
            const totalValue = matchingDates.length;
            return {
                index: c.value,
                label: c.text,
                value: totalValue
            };
        });
    };

    const numberTicks = correctedValueAnswers?.length + 1;

    const ChartView = () => {
        if (formattedDates.length === 0 || currentTemplate === undefined) {
            return (
                <EmptyButtonView
                    title={t("CitizenPage.noData")}
                    subTitle={t("CitizenPage.changeTimeInterval")}
                    noImage
                />
            );
        }

        return (
            <>
                <Box width="100%" height="300px" paddingBottom="16px">
                    <BarGraph
                        data={formattedDates}
                        xKey="time"
                        yAxisTickFormatter={yAxisTickFormatter}
                        tickCount={numberTicks}
                        margin={{ bottom: 0, left: 0, top: 0 }}
                        dateKeyRegex={/value/}
                    />
                </Box>
                <Box width="100%" paddingTop="16px">
                    <TableView />
                </Box>
            </>
        );
    };

    function TableView() {
        const heads: HeadItem<{ index: number; label: string; value: string | number | false }>[] = [
            { id: "index", label: "#", numeric: false },
            { id: "label", label: t("CitizenPage.choices"), numeric: false },
            { id: "value", label: t("CitizenPage.votes"), numeric: false }
        ];

        return (
            <BaseTable
                heads={heads}
                elements={TableDataFormatter()}
                initialOrderKey="index"
                initialOrder="asc"
                endCell={() => (<BaseTableCell align="right" padding="none" />)}
            />
        );
    }

    return (
        <React.Fragment>
            <Box display="flex" justifyContent="space-between" alignItems="center" pb={2}>
                <Select
                    onChange={e => setTemplateId((e.target.value as string))}
                    value={templateId}
                    variant="outlined"
                    style={{ minWidth: 160, maxWidth: 260 }}
                >
                    <Divider orientation="horizontal" />
                    {templates.map(f => (
                        <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                    ))}
                </Select>
            </Box>
            {questions?.map(f => {
                if (f.type === "choice" || f.type === "likert") {
                    return <Accordion key={f.id} expanded={questionId === f.id} onChange={(e, expanded) => {
                        if (expanded) {
                            setQuestionId(f.id)
                        } else if (!expanded && questionId === f.id) {
                            setQuestionId("");
                        }
                    }}>
                        <AccordionSummary
                            expandIcon={<ArrowDownSLineIcon />}
                            aria-controls="panel1a-content"
                        >
                            <Typography>{f.text}</Typography>
                        </AccordionSummary>
                        <AccordionDetails
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'auto',
                                position: 'relative',
                                maxHeight: '300px',
                                padding: '16px',
                                boxSizing: 'border-box',
                            }}
                        >
                            <Box height="100%" width="100%" position='relative'>
                                {customQuery.isLoading && <LoadingOverlay size={30} />}
                                {!customQuery.isLoading && <ChartView />}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                } else {
                    return <Accordion key={f.id} expanded={freeTextId === f.id} onChange={(e, expanded) => {
                        if (expanded) {
                            setFreeTextId(f.id)
                        } else if (!expanded && freeTextId === f.id) {
                            setFreeTextId("");
                        }
                    }}>
                        <AccordionSummary
                            expandIcon={<ArrowDownSLineIcon />}
                            aria-controls="panel1a-content"
                        >
                            <Typography>{f.text}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box width="100%" position='relative'>
                                <FormControl fullWidth>
                                    {f.answer?.map((a) => {
                                        return <TextField fullWidth label={a.answeredAt} variant="filled" value={a.answer} multiline={true} />
                                    })}
                                </FormControl>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                }
            }
            )}
        </React.Fragment>
    )
};

export default CustomSurveyChartContainer;
