import React from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts";
import { useAuth } from "../../providers/authProvider";
import { NEW_CHART_COLORS } from "../../constants/ChartColors";

interface LineGraphProps {
    data: any[];
    xAxisLabel?: string;
    yAxisLabel?: string;
    colors?: { [key: number]: string };
    slantedLabel?: boolean | undefined;
    margin?: { bottom: number; left: number; top: number; };
}

const CustomizedLabel = (props: any) => {
    const { x, y, value } = props;
    return (
        <text x={x} y={y} dy={-10} fill="#000" fontSize={10} textAnchor="middle">
            {value}
        </text>
    );
};

const LineGraph: React.FC<LineGraphProps> = ({ data, xAxisLabel, yAxisLabel, colors, margin, slantedLabel }) => {

    const combinedMargin = {
        ...margin,
        bottom: slantedLabel ? (margin?.bottom || 0) + 50 : (margin?.bottom || 20),
        left: 20
    };

    const project = useAuth().currentProject;

    //Temp use project color MYOB demo problem
    const themeColors = project?.theme && Object.keys(project.theme).length > 0
        ? project.theme
        : NEW_CHART_COLORS;

    // const themeColors = colors && Object.keys(colors).length > 0
    //     ? colors
    //     : project?.theme && Object.keys(project.theme).length > 0
    //         ? project.theme
    //         : NEW_CHART_COLORS;

    return (
        <ResponsiveContainer width="100%" height="99%">
            <LineChart data={data} margin={combinedMargin}>
                <XAxis
                    dataKey="displayName"
                    axisLine={{ stroke: "#ECEEF0", strokeWidth: '1px' }}
                    tickLine={{ stroke: '#ECEEF0', strokeWidth: 1 }}
                    padding={{ left: 50, right: 50 }}
                    style={{ fontSize: "12px" }}
                    tick={{ fill: "rgba(10, 8, 18, 0.87)", textAnchor: slantedLabel ? "end" : 'middle' }}
                    angle={!slantedLabel ? 0 : -25}
                    label={{
                        value: xAxisLabel,
                        position: 'centerBottom',
                        offset: 0,
                        dy: 20,
                        style: { fontSize: '14px' }
                    }}
                />
                <YAxis
                    dataKey="Value"
                    axisLine={{ stroke: "#ECEEF0", strokeWidth: '1px' }}
                    tickLine={{ stroke: '#ECEEF0', strokeWidth: 1 }}
                    tick={{ fill: "rgba(10, 8, 18, 0.87)" }}
                    label={{
                        value: yAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                        offset: 12,
                        style: { fontSize: '16px' },
                        dy: 30,
                    }}
                />
                <Tooltip contentStyle={{ border: 'none', boxShadow: 'none' }} />
                <Line
                    type="monotone"
                    dataKey="Value"
                    stroke={themeColors[1]}
                    dot={{ stroke: themeColors[1], strokeWidth: 2, fill: themeColors[2] }}
                >
                    <LabelList dataKey="Value" position="top" content={<CustomizedLabel />} />
                </Line>
            </LineChart>
        </ResponsiveContainer>
    );
}

export default LineGraph;
