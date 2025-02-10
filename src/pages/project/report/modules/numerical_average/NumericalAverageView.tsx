import React, { useEffect, useMemo, useState } from "react";
import { ModuleProps } from "../index";
import ViewContainer from "../ViewContainer";
import BarGraph from "../../../../../components/charts/BarGraph";
import { ChartDatas, NumericRegistration } from "../../../../../models/Registration";
import { useAppServices } from "../../../../../providers/appServiceProvider";
import { useTranslation } from "react-i18next";
import { isRegDateRangeValid } from "../../../../../lib/date/dateValidation";
import LineGraph from "../../../../../components/charts/LineGraph";
import { DateRange } from "../../../../../models/Report";

const NumericalAverageView: React.FC<ModuleProps> = ({ config, mode }) => {

    const services = useAppServices();
    const [data, setData] = useState<NumericRegistration>();
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

    useEffect(() => {
        const fetch = async () => {
            const res = await services.reports.getRegistrationData(config);
            if (res.success) {
                setData(res.value);
                setPopulationSize(res.value.populationSize);
                setSampleSize(res.value.sampleSizes);
            }
            setLoading(false);
        };

        if (isRegDateRangeValid(config)) {
            fetch();
        } else {
            setLoading(false);
        }
    }, [config, config.tags.length, config.effectId, config.timeUnit, config.timePreset, config.start, config.end, config.isEmpty, services.reports])

    const customGuideLabels = extractLabels(config.customGuideLabel ?? {}, config.dateRanges ?? []);

    const chartData = data?.chartDatas ?? [] as ChartDatas[];

    const valueKeyRegex = /^(Denne uge|Sidste uge|Denne måned|Sidste måned|Dette kvartal|Sidste kvartal|Dette år|Sidste år)$|^(\d{2})\/(\d{2})\/(\d{2})-(\d{2})\/(\d{2})\/(\d{2})$/i;

    const findValueKey = (item: { [key: string]: any }): string | undefined => {
        return Object.keys(item).find(key => valueKeyRegex.test(key));
    };
    const modifiedChartData = chartData.map((item, index) => {
        const label = mode !== "review" ? config.labels?.[index] ?? item.Name : item.Name;
        return {
            ...item,
            Name: label,
        };
    });

    const transformedChartData = useMemo(() => modifiedChartData.map(item => {
        const valueKey = findValueKey(item);
        const value = valueKey ? (item as any)[valueKey] : null;

        return {
            Value: value,
            Name: item.Name
        };
    }), [modifiedChartData]);

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
            dateKeyRegex={valueKeyRegex}
            customGuideLabels={customGuideLabels}
        >
            {config.graphType === 1 ?
                <BarGraph
                    colors={config.colors}
                    labelOnInside={config.labelOnInside}
                    slantedLabel={config.slantedLabel}
                    xKey="Name"
                    data={modifiedChartData}
                    dateKeyRegex={valueKeyRegex}
                    answerRate={answerRateBarsData}
                    xAxisLabel={t("moduleConfigs.dataLabels.frequency")}
                    yAxisLabel={t("moduleConfigs.dataLabels.value")}
                /> :
                <LineGraph
                    colors={config.colors}
                    data={transformedChartData}
                    xAxisLabel={t("moduleConfigs.dataLabels.frequency")}
                    yAxisLabel={t("moduleConfigs.dataLabels.value")}
                />
            }
        </ViewContainer>
    )
}

export default NumericalAverageView;
