import React, { useEffect, useState } from "react";
import { useAppServices } from "../../../../../providers/appServiceProvider";
import { CorrelativeDistributionStatsTabel, ModuleProps } from "../index";
import ViewContainer from "../ViewContainer";
import { BarChartData, CorrelativeDistributionStats } from "../../../../../services/reportService";
import BarGraph from "../../../../../components/charts/BarGraph";
import HorizontalBarGraph from "../../../../../components/charts/HorizontalBarGraph";
import { useTranslation } from "react-i18next";
import { isSurveyDateRangeValid } from "../../../../../lib/date/dateValidation";
import { DateRange } from "../../../../../models/Report";
import TableViewContainer from "../TableViewContainer";
import HeadItem from "../../../../../components/tables/HeadItem";

const CorrelativeDistributionView: React.FC<ModuleProps> = ({ config, mode }) => {
    const services = useAppServices();
    const [data, setData] = useState<BarChartData>();
    const [tableData, setTableData] = useState<CorrelativeDistributionStatsTabel[]>([]);
    const [loading, setLoading] = useState(true);
    const [populationSize, setPopulationSize] = useState<{ [key: string]: number } | undefined>();
    const [sampleSize, setSampleSize] = useState<{ [key: string]: number }>();
    const { t } = useTranslation();

    config.tags = config.tags ?? [];

    const extractLabels = (customGuideLabel: { [key: number]: string }, dateRanges: DateRange[]): string[] => {
        return dateRanges.map((_, index) => {
            return customGuideLabel[index] || "";
        });
    };

    const formatDate = (date: Date): string => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        if (isSurveyDateRangeValid(config.dateRanges)) {
            const fetch = async () => {
                try {
                    let res;
                    if (config.viewType === "table") {
                        res = await services.reports.getCorrelativeDistributionStats(config);
                        if ("value" in res && res.success) {
                            const dataArray = res.value;

                            dataArray.sort((a: CorrelativeDistributionStats, b: CorrelativeDistributionStats) => {
                                const startA = new Date(a.datePeriod.start).getTime();
                                const startB = new Date(b.datePeriod.start).getTime();
                                const endA = new Date(a.datePeriod.end).getTime();
                                const endB = new Date(b.datePeriod.end).getTime();

                                if (startA === startB) {
                                    return endA - endB;
                                }
                                return startA - startB;
                            });

                            const mappedData = dataArray.map((item: CorrelativeDistributionStats) => {
                                const startDate = formatDate(new Date(item.datePeriod.start));
                                const endDate = formatDate(new Date(item.datePeriod.end));
                                return {
                                    id: item.fieldId,
                                    question: item.fieldText,
                                    period: `${startDate} - ${endDate}`,
                                    N: item.bigN,
                                    n: item.smallN,
                                    answerRate: `${item.answerRate}%`
                                };
                            });

                            setTableData(mappedData);
                        } else {
                            console.error("Failed to fetch table data:", res);
                        }
                    } else {
                        res = await services.reports.getCorrelativeDistributionData(config);
                        if ("value" in res && res.success) {
                            setData(res.value);
                            setPopulationSize(res.value.populationSize);
                            setSampleSize(res.value.sampleSizes);
                        } else {
                            console.error("Failed to fetch chart data:", res);
                        }
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

    const heads: HeadItem<CorrelativeDistributionStatsTabel>[] = [
        { id: "question", label: t("moduleConfigs.chartColumns.questions") },
        { id: "period", label: t("moduleConfigs.chartColumns.periods") },
        { id: "N", label: "N" },
        { id: "n", label: "n" },
        { id: "answerRate", label: t("moduleConfigs.chartColumns.answerRates") }
    ];

    return config.viewType === 'table' ? (
        <TableViewContainer<CorrelativeDistributionStatsTabel>
            loading={loading}
            config={config}
            heads={heads}
            elements={tableData}
        />
    ) : (
        <ViewContainer
            loading={loading}
            data={modifiedChartData}
            config={config}
            populationSize={populationSize}
            sampleSize={sampleSize}
            dateKeyRegex={/^\d{2}\/\d{2}\/\d{2}(\[\d\])?-\d{2}\/\d{2}\/\d{2}(\[\d\])?$/}
            customGuideLabels={customGuideLabels}
        >
            {config.graphType === 3 ? (
                <HorizontalBarGraph
                    colors={config.colors}
                    labelOnInside={config.labelOnInside}
                    xKey="Name"
                    data={modifiedChartData}
                    dateKeyRegex={/^\d{2}\/\d{2}\/\d{2}(\[\d\])?-\d{2}\/\d{2}\/\d{2}(\[\d\])?$/}
                    pointSystemType={config.pointSystemType}
                    xAxisLabel={config.isAverageScore ? t("moduleConfigs.dataLabels.scores") : (config.pointSystemType === 1 || config.pointSystemType === "Point") ? t("moduleConfigs.dataLabels.quantity", { value: t(`ReportsIndex.pointSystemTypeMap.absoluteNumbers`) }) : t("moduleConfigs.dataLabels.quantity", { value: t(`ReportsIndex.pointSystemTypeMap.percentage`) })}
                    yAxisLabel={t("moduleConfigs.dataLabels.questions")}
                    isLikert={config.questionType === "likert"}
                    likertScale={config.likertScale}
                />
            ) : (
                <BarGraph
                    colors={config.colors}
                    labelOnInside={config.labelOnInside}
                    slantedLabel={config.slantedLabel}
                    yAxisLabel={config.isAverageScore ? t("moduleConfigs.dataLabels.scores") : (config.pointSystemType === 1 || config.pointSystemType === "Point") ? t("moduleConfigs.dataLabels.quantity", { value: t(`ReportsIndex.pointSystemTypeMap.absoluteNumbers`) }) : t("moduleConfigs.dataLabels.quantity", { value: t(`ReportsIndex.pointSystemTypeMap.percentage`) })}
                    xAxisLabel={t("moduleConfigs.dataLabels.questions")}
                    xKey="Name"
                    data={modifiedChartData}
                    dateKeyRegex={/^\d{2}\/\d{2}\/\d{2}(\[\d\])?-\d{2}\/\d{2}\/\d{2}(\[\d\])?$/}
                    pointSystemType={config.pointSystemType}
                    isLikert={config.questionType === "likert"}
                    likertScale={config.likertScale}
                />
            )}
        </ViewContainer>
    );
};

export default CorrelativeDistributionView;
