import React, { useEffect, useMemo, useState } from "react";
import { useAppServices } from "../../../../../providers/appServiceProvider";
import { ModuleProps } from "../index";
import ViewContainer from "../ViewContainer";
import { BarChartData } from "../../../../../services/reportService";
import BarGraph from "../../../../../components/charts/BarGraph";
import { useTranslation } from "react-i18next";
import { isSurveyDateRangeValid } from "../../../../../lib/date/dateValidation";
import LineGraph from "../../../../../components/charts/LineGraph";
import { DateRange } from "../../../../../models/Report";

const MethodGraphView: React.FC<ModuleProps> = ({ config, mode }) => {
    const services = useAppServices();
    const [data, setData] = useState<BarChartData>();
    const [populationSize, setPopulationSize] = useState<{ [key: string]: number } | undefined>();
    const [sampleSize, setSampleSize] = useState<{ [key: string]: number }>();
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    config.tags = config.tags ?? [];

    const extractLabels = (customGuideLabel: { [key: number]: string }, dateRanges: DateRange[]): string[] => {
        return dateRanges.map((_, index) => {
            return customGuideLabel[index] || "";
        });
    };

    useEffect(() => {
        if (isSurveyDateRangeValid(config.dateRanges)) {
            const fetch = async () => {
                const res = await services.reports.getSurveyStatsData(config);
                if ("value" in res && res.success) {
                    setData(res.value);
                    setPopulationSize(res.value.populationSize);
                    setSampleSize(res.value.sampleSizes);
                }
                setLoading(false);
            };
            fetch();
        }
    }, [config.tags.length, config.surveyId, config.strategyId, config.dateRanges, config, services.reports]);

    const customGuideLabels = extractLabels(config.customGuideLabel ?? {}, config.dateRanges ?? []);

    const chartData = data?.chartDatas ?? [] as any[];

    // Modify the chart data with labels from config
    const modifiedChartData = useMemo(() => {
        return chartData.map((item, index) => {
            const label = mode !== "review" ? config.labels?.[index] ?? item.Name : item.Name.replace(/\[\d+\]/g, '');
            return {
                ...item,
                displayName: label,
                dataName: item.Name
            };
        });
    }, [chartData, config.labels]);

    const answerRateBars = useMemo(() => {
        return data?.chartDatas.map((d) => {
            const sampleSizeForKey = data?.sampleSizes[d.Name];
            const populationSizeForKey = data?.populationSize[d.Name];
            if (sampleSizeForKey !== undefined && populationSizeForKey !== undefined) {
                return ((sampleSizeForKey / populationSizeForKey) * 100).toFixed(2);
            }
            return "0.00"; // Default value if not available
        });
    }, [data?.chartDatas, data?.sampleSizes, data?.populationSize]);

    const answerRateBarsData = useMemo(() => {
        const sampleSizesKeys = Object.keys(data?.sampleSizes || {});
        return sampleSizesKeys.reduce<Record<string, any>>((acc, key, index) => {
            acc[key] = answerRateBars?.[index];
            return acc;
        }, {});
    }, [data?.sampleSizes, answerRateBars]);

    return (
        <ViewContainer
            loading={loading}
            data={modifiedChartData}
            config={config}
            populationSize={populationSize}
            sampleSize={sampleSize}
            dateKeyRegex={/Value/}
            customGuideLabels={customGuideLabels}
        >
            {config.graphType === 1 ?
                <BarGraph
                    colors={config.colors}
                    labelOnInside={config.labelOnInside}
                    slantedLabel={config.slantedLabel}
                    xKey="displayName"
                    data={modifiedChartData}
                    dateKeyRegex={/Value/}
                    answerRate={answerRateBarsData}
                    xAxisLabel={t("moduleConfigs.dataLabels.periods")}
                    yAxisLabel={t("moduleConfigs.dataLabels.scores")}
                /> :
                <LineGraph
                    colors={config.colors}
                    data={modifiedChartData}
                    slantedLabel={config.slantedLabel}
                    xAxisLabel={t("moduleConfigs.dataLabels.periods")}
                    yAxisLabel={t("moduleConfigs.dataLabels.scores")}
                />
            }
        </ViewContainer>
    );
};

export default MethodGraphView;
