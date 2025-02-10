import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, YAxisProps, Tooltip, TooltipProps } from "recharts";
import React from "react";
import { BaseAxisProps } from "recharts/types/util/types";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { Survey } from "../../models/Survey";
import { useTheme } from "@material-ui/core";


interface MethodGraphProps {
    survey: Survey;
    data: any[];
    xKey: string;
    yKey: string;
    tickFormatter: BaseAxisProps["tickFormatter"]
}

const MethodGraph: React.FC<MethodGraphProps> = ({ data, survey, tickFormatter, xKey, yKey }) => {

    const color = useTheme().palette.primary;

    const yDomain: YAxisProps["domain"] = [survey?.min, survey?.max]

    // const { threshold, isNegative, min, max } = survey;

    // const firstX = data[0]?.x;
    // const lastX = data[data.length - 1]?.x;
    //
    // const threeAreas = threshold.length > 1;

    const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
        let formattedTick = label
        if (tickFormatter && label) { formattedTick = tickFormatter(label, 0) }
        if (active && payload && payload.length) {

            return (
                <div className="custom-tooltip">
                    <p className="payload">{`Gns. score ${parseFloat(Number(payload[0].value).toFixed(2))}`}</p>
                    <p className="label">{formattedTick}</p>
                </div>
            );
        }

        return null;
    };


    return (
        <ResponsiveContainer width="100%" height="95%">
            <LineChart data={data} key={data.length}>
                <XAxis
                    dataKey={xKey}
                    type="number"
                    scale="time"
                    interval="preserveEnd"
                    domain={["auto", "auto"]}
                    tickFormatter={tickFormatter}
                    style={{ fontSize: "12px" }}
                />
                <YAxis
                    type="number"
                    domain={yDomain}
                    allowDecimals={false}
                    label={{
                        value: "Gns. score",
                        angle: -90,
                        position: 'insideLeft'
                    }}
                />

                <Line type="monotone" name="Gns. score" dataKey={yKey} stroke={color.main} strokeWidth={2} />
                <Tooltip wrapperStyle={{ outline: "none" }} content={<CustomTooltip />} />

                {/*<ReferenceArea x1={firstX} x2={lastX} y1={threeAreas ? threshold[1] : threshold[0]} y2={max} fill={isNegative ? "red" : "green"} opacity={0.3} />*/}
                {/*{threeAreas && <ReferenceArea x1={firstX} x2={lastX} y1={threshold[0]} y2={threshold[1]} fill="yellow" opacity={0.3} />}*/}
                {/*<ReferenceArea x1={firstX} x2={lastX} y1={min} y2={threshold[0]} fill={isNegative ? "green" : "red"} opacity={0.3} />*/}
            </LineChart>
        </ResponsiveContainer>
    )
}

export default MethodGraph;
