import React, { useEffect, useMemo, useState } from "react";
import { ModuleProps } from "../index";
import ViewContainer from "../ViewContainer";
import BarGraph from "../../../../../components/charts/BarGraph";
import { useAppServices } from "../../../../../providers/appServiceProvider";
import { ChartDatas, IncidentRegistration } from "../../../../../models/Registration";
import { useTranslation } from "react-i18next";
import { isRegDateRangeValid } from "../../../../../lib/date/dateValidation";
import LineGraph from "../../../../../components/charts/LineGraph";
import { DateRange } from "../../../../../models/Report";

const AggregatedCountView: React.FC<ModuleProps> = ({ config, mode }) => {

    const services = useAppServices();
    const [data, setData] = useState<IncidentRegistration>();
    const [loading, setLoading] = useState(true);
    const [populationSize, setPopulationSize] = useState<{ [key: string]: number } | undefined>();
    const { t } = useTranslation();

    config.tags = config.tags ?? [];

    useEffect(() => {
        const fetch = async () => {
            const res = await services.reports.getIncidentData(config);
            if (res.success) {
                setData(res.value);
                setPopulationSize(res.value.populationSize);
            }
            setLoading(false);
        };

        if (isRegDateRangeValid(config)) {
            fetch();
        } else {
            setLoading(false);
        }
    }, [config.tags.length, config.effectId, config.timeUnit, config.timePreset, config.start, config.end, config.isEmpty]);

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

    return (
        <ViewContainer
            data={modifiedChartData}
            config={config}
            loading={loading}
            populationSize={populationSize}
            dateKeyRegex={valueKeyRegex}
        >
            {config.graphType === 1 ?
                <BarGraph
                    colors={config.colors}
                    labelOnInside={config.labelOnInside}
                    slantedLabel={config.slantedLabel}
                    data={modifiedChartData}  // Use modifiedChartData here
                    xKey="Name"
                    dateKeyRegex={valueKeyRegex}
                    xAxisLabel={t("moduleConfigs.dataLabels.frequency")}
                    yAxisLabel={t("moduleConfigs.dataLabels.registration")}
                /> :
                <LineGraph
                    data={transformedChartData}  // Use transformedChartData here
                    colors={config.colors}
                    xAxisLabel={t("moduleConfigs.dataLabels.frequency")}
                    yAxisLabel={t("moduleConfigs.dataLabels.registration")}
                />
            }
        </ViewContainer>
    )
}

export default AggregatedCountView;
