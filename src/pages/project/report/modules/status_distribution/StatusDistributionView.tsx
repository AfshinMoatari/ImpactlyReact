import React, { useEffect, useState } from "react";
import { useAppServices } from "../../../../../providers/appServiceProvider";
import { ModuleProps } from "../index";
import { ChartDatas, StatusRegistration } from "../../../../../models/Registration";
import ViewContainer from "../ViewContainer";
import BarGraph from "../../../../../components/charts/BarGraph";
import PieGraph from "../../../../../components/charts/PieGraph";
import { useTranslation } from "react-i18next";
import { areStatusDatesValid } from "../../../../../lib/date/dateValidation";

const StatusDistributionView: React.FC<ModuleProps> = ({ config, mode }) => {
    const services = useAppServices();
    const [data, setData] = useState<StatusRegistration>();
    const [loading, setLoading] = useState(true);
    const [populationSize, setPopulationSize] = useState<{ [key: string]: number } | undefined>();
    const [sampleSize, setSampleSize] = useState<{ [key: string]: number }>();
    const { t } = useTranslation();

    config.tags = config.tags ?? [];

    const extractLabels = (customGuideLabel: { [key: number]: string }, endDates: Date[]): string[] => {
        return endDates.map((_, index) => {
            return customGuideLabel[index] || "";
        });
    };

    useEffect(() => {
        const hasInvalidDateRange = config.endDates ? !areStatusDatesValid(config.endDates) : false;

        if (!hasInvalidDateRange) {
            const fetch = async () => {
                const res = await services.reports.getStatusData(config);
                if (res.success) {
                    setData(res.value);
                    setPopulationSize(res.value.populationSize);
                    setSampleSize(res.value.sampleSizes);
                }
                setLoading(false);
            }
            fetch();
        }
    }, [config, config.tags.length, config.surveyId, config.fieldId, config.strategyId, config.dateRanges, config.isEmpty, config.pointSystemType, config.isExcludeOnlyOneAnswer, config.isAverageScore, services.reports]);

    const customGuideLabels = extractLabels(
        config.customGuideLabel ?? {},
        (config.endDates ?? []).filter((date): date is Date => date !== null)
    );

    const chartData = data?.chartDatas ?? [] as ChartDatas[];
    const modifiedChartData = chartData.map((item, index) => {
        const label = mode !== "review" ? config.labels?.[index] ?? item.Name : item.Name;
        return {
            ...item,
            Name: label,
        };
    });

    return (
        <ViewContainer
            loading={loading}
            data={modifiedChartData}
            config={config}
            populationSize={populationSize}
            sampleSize={sampleSize}
            dateKeyRegex={/^\d{2}\/\d{2}\/\d{2}(\[\d\])?$/}
            customGuideLabels={customGuideLabels}
        >
            {config.graphType === 2 ? (
                <PieGraph
                    colors={config.colors}
                    data={modifiedChartData}
                    percentage={config.pointSystemType === 2}
                />
            ) : (
                <BarGraph
                    colors={config.colors}
                    labelOnInside={config.labelOnInside}
                    slantedLabel={config.slantedLabel}
                    pointSystemType={config.pointSystemType}
                    data={modifiedChartData}
                    xAxisLabel={t("moduleConfigs.dataLabels.statuses")}
                    yAxisLabel={(config.pointSystemType === 1 || config.pointSystemType === "Point") ? t("moduleConfigs.dataLabels.registrations", { value: t(`ReportsIndex.pointSystemTypeMap.absoluteNumbers`) }) : t("moduleConfigs.dataLabels.registrations", { value: t(`ReportsIndex.pointSystemTypeMap.percentage`) })}
                    xKey="Name"
                    dateKeyRegex={/^\d{2}\/\d{2}\/\d{2}(\[\d\])?$/}
                />
            )}
        </ViewContainer>
    )
}

export default StatusDistributionView;
