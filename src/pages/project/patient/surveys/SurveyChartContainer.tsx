import {Box, Divider, MenuItem, Select} from "@material-ui/core";
import TimeRangeSelector from "../../../../components/pickers/TimeRangeSelector";
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import EmptyButtonView from "../../../../components/containers/EmptyView";
import React, {useState} from "react";
import {EntryBatch, Survey} from "../../../../models/Survey";
import useURIData from "../../../../hooks/useURIData";
import {useQuery} from "react-query";
import {XAxisProps} from "recharts";
import {isSameDay} from "date-fns";
import format from "date-fns/format";
import {useAppServices} from "../../../../providers/appServiceProvider";
import ProjectPatient from "../../../../models/ProjectPatient";
import {TimeData} from "../../../../lib/date/fromPreset";
import sortTime from "../../../../lib/data/sortTime";
import MethodGraph from "../../../../components/charts/MethodGraph";
import {useTranslation} from "react-i18next";

interface SurveyChartContainerProps {
    patient: Required<ProjectPatient>;
    templates: Survey[];
}

const SurveyChartContainer: React.FC<SurveyChartContainerProps> = ({patient, templates}) => {
    const templatesExist = templates.length > 0
    const patientsService = useAppServices().projectPatients(patient.parentId);
    const {t} = useTranslation();

    const [surveyId, setSurveyId] = useState(templatesExist ? templates[0].id : "");
    const survey = templates.find(s => s.id === surveyId);
    const [timeData] = useURIData<TimeData | {}>("timeData");

    const query = useQuery<EntryBatch[]>({
        queryKey: `${patient.id}/survey`,
        queryFn: async () => {
            const res = await patientsService.getSurveyAnswers(patient.id);
            if (!res.success) return []
            return res.value;
        },
        staleTime: Infinity,
        cacheTime: Infinity
    });

    const dataIn: EntryBatch[] = (query.data ?? []).filter( eb => eb.surveyId === surveyId);
    const timeSeriesData = sortTime(dataIn.map((a) => ({
        value: a.score ?? 0,
        time: a.answeredAt !== undefined && new Date(a.answeredAt).getTime() > 0 ? new Date(a.answeredAt).getTime() : new Date(a.createdAt).getTime()
    })));

    const filteredTimeSeriesData =
        timeSeriesData.filter(td => "start" in timeData ? td.time >= timeData.start && td.time < timeData.end : true);

    const tickFormatter: XAxisProps["tickFormatter"] = (t: number) => {
        if (isSameDay(t, new Date())) return "I dag"
        return format(t, "dd/MM/yyyy");
    }

    if (!templatesExist) return null;

    const ChartView = () => filteredTimeSeriesData.length === 0 || survey === undefined? (
        <EmptyButtonView
            title={t("CitizenPage.noData")}
            subTitle={t("CitizenPage.changeTimeInterval")}
            noImage
        />
    ) : (
        <MethodGraph
            survey={survey}
            data={filteredTimeSeriesData}
            tickFormatter={tickFormatter}
            xKey="time"
            yKey="value"
        />
    );

    return (
        <React.Fragment>
            <Box display="flex" justifyContent="space-between" alignItems="center" pb={2}>
                <Select
                    onChange={e => setSurveyId((e.target.value as string))}
                    value={surveyId}
                    variant="outlined"
                    style={{minWidth: 160, maxWidth: 260}}
                >
                    <Divider orientation="horizontal"/>
                    {templates.map(f => (
                        <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                    ))}
                </Select>
                <TimeRangeSelector/>
            </Box>

            <Box height="400px" position='relative'>
                {query.isLoading && <LoadingOverlay size={30}/>}
                {!query.isLoading && <ChartView/>}
            </Box>
        </React.Fragment>
    )
}

export default SurveyChartContainer;
