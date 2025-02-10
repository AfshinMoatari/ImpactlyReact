import React, { useEffect, useMemo, useState } from "react";
import { useAppServices } from "../../../../../providers/appServiceProvider";
import { ModuleProps } from "../index";
import ViewContainer from "../ViewContainer";
import { BarChartData } from "../../../../../services/reportService";
import BarGraph from "../../../../../components/charts/BarGraph";
import PieGraph from "../../../../../components/charts/PieGraph";
import { useTranslation } from "react-i18next";
import { isSurveyDateRangeValid } from "../../../../../lib/date/dateValidation";
import { DateRange } from "../../../../../models/Report";
import { useProjectSurveys } from "../../../../../hooks/useSurveys";

const CustomDistributionView: React.FC<ModuleProps> = ({ config, mode }) => {
    const services = useAppServices();
    const [data, setData] = useState<BarChartData>();
    const [loading, setLoading] = useState(true);
    const [populationSize, setPopulationSize] = useState<{ [key: string]: number } | undefined>();
    const [sampleSize, setSampleSize] = useState<{ [key: string]: number } | undefined>();
    const { t } = useTranslation();
    const projectSurveyQuery = useProjectSurveys(config.projectId, services);
    const surveys = projectSurveyQuery.surveys;
    const survey = surveys?.find(s => s.id === config.surveyId);
    const field = survey?.fields.find(s => s.id === config.fieldId);
    const scale = field?.type;

    config.tags = config.tags ?? [];

    const extractLabels = (customGuideLabel: { [key: number]: string }, dateRanges: DateRange[]): string[] => {
        return dateRanges.map((_, index) => {
            return customGuideLabel[index] || "";
        });
    };

    useEffect(() => {
        if (isSurveyDateRangeValid(config.dateRanges)) {
            // Temporary solution for old data that doesn't have xAxisDataType
            if (config.xAxisDataType === null || config.xAxisDataType === undefined) {
                config.xAxisDataType = "choices";
            }
            const fetch = async () => {
                try {
                    const res = await services.reports.getCustomSurveyData(config);
                    if ("value" in res && res.success) {
                        setData(res.value);
                        setPopulationSize(res.value.populationSize);
                        setSampleSize(res.value.sampleSizes);
                    } else {
                        console.error("Failed to fetch data:", res);
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetch();
        }
    }, [config, services.reports]);

    const customGuideLabels = extractLabels(config.customGuideLabel ?? {}, config.dateRanges ?? []);

    const chartData = data?.chartDatas ?? [];

    const modifiedChartData = chartData.map((item, index) => {
        const label = mode !== "review" ? config.labels?.[index] ?? item.Name : item.Name;
        return {
            ...item,
            Name: label,
        };
    });

    // Set tickCount based on the scale
    const tickCount = scale === 'likert' ? field?.choices.length : undefined;

    return (
        <ViewContainer
            loading={loading}
            data={modifiedChartData}
            config={config}
            populationSize={populationSize}
            sampleSize={sampleSize}
            dateKeyRegex={/^\d{2}\/\d{2}\/\d{2}(\[\d\])?-\d{2}\/\d{2}\/\d{2}(\[\d\])?$/}
            customGuideLabels={customGuideLabels}
        >
            {config.graphType === 2 ? (
                <PieGraph
                    colors={config.colors}
                    data={modifiedChartData}
                    percentage={config.pointSystemType === 2 || config.pointSystemType === "Percentage"}
                />
            ) : (
                <BarGraph
                    colors={config.colors}
                    labelOnInside={config.labelOnInside}
                    slantedLabel={config.slantedLabel}
                    xAxisLabel={config.xAxisDataType === "choices" ? t("moduleConfigs.dataLabels.choices") : t("moduleConfigs.dataLabels.periods")}
                    yAxisLabel={
                        config.isAverageScore
                            ? t("moduleConfigs.dataLabels.scores") + (scale === 'likert' ? " - " + scale : '')
                            : (config.pointSystemType === 1 || config.pointSystemType === "Point")
                                ? t("moduleConfigs.dataLabels.quantity", { value: t(`ReportsIndex.pointSystemTypeMap.absoluteNumbers`) })
                                : t("moduleConfigs.dataLabels.quantity", { value: t(`ReportsIndex.pointSystemTypeMap.percentage`) }) + (scale === 'likert' ? " - " + scale : '')
                    }
                    xKey="Name"
                    data={modifiedChartData}
                    dateKeyRegex={/^\d{2}\/\d{2}\/\d{2}(\[\d\])?-\d{2}\/\d{2}\/\d{2}(\[\d\])?$/}
                    pointSystemType={config.pointSystemType}
                    tickCount={tickCount}
                    isLikert={config.questionType === "likert"}
                    likertScale={config.likertScale}
                />
            )}
        </ViewContainer>
    );
};

export default CustomDistributionView;
