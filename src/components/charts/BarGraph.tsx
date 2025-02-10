import React from 'react';
import { Bar, ComposedChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { NEW_CHART_COLORS } from "../../constants/ChartColors";
import { useAuth } from "../../providers/authProvider";
import { useTranslation } from "react-i18next";
import EmptyView from "../containers/EmptyView";

interface BarChartProps {
    label?: string;
    slantedLabel?: boolean | undefined;
    yAxisLabel?: string;
    xAxisLabel?: string;
    data: any[] | undefined;
    xKey: string;
    yAxisTickFormatter?: (value: any, index: number) => string;
    tickCount?: number;
    margin?: { bottom: number; left: number; top: number; };
    dateKeyRegex?: RegExp;
    answerRate?: { [key: string]: number };
    pointSystemType?: string | number | undefined;
    labelOnInside?: boolean;
    colors?: { [key: number]: string };
    isLikert?: boolean;
    likertScale?: number;
}

const measureTextWidth = (text: string, fontSize: number) => {
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');
    const textElement = document.createElementNS(svgNamespace, 'text');

    textElement.setAttribute('font-size', fontSize.toString());
    textElement.textContent = text;
    svg.appendChild(textElement);

    document.body.appendChild(svg);
    const width = textElement.getComputedTextLength();
    document.body.removeChild(svg);

    return width;
};

const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine: string[] = [];

    const testLineWidth = (line: string) => measureTextWidth(line, fontSize);

    words.forEach(word => {
        currentLine.push(word);
        const line = currentLine.join(' ');
        if (testLineWidth(line) > maxWidth) {
            currentLine.pop();
            lines.push(currentLine.join(' '));
            currentLine = [word];
        }
    });

    if (currentLine.length) {
        lines.push(currentLine.join(' '));
    }

    return lines;
};

const CustomXAxisTick = (props: any) => {
    const { x, y, payload, slantedLabel } = props;
    const { value } = payload;
    const maxWidth = 140; // Maximum width for the tick label
    const fontSize = 10; // Font size for the tick label
    const lineHeight = 15; // Line height for wrapped text
    const textAnchor = slantedLabel ? "end" : "middle";
    const rotationAngle = slantedLabel ? -45 : 0;

    const lines = wrapText(value, maxWidth, fontSize);

    return (
        <g transform={`translate(${x},${y})`} textAnchor={textAnchor}>
            {lines.map((line, index) => (
                <text
                    key={index}
                    x={0}
                    y={index * lineHeight}
                    dy={slantedLabel ? 0 : 12}
                    fill="#666"
                    fontSize={fontSize}
                    transform={rotationAngle !== 0 ? `rotate(${rotationAngle})` : undefined}
                >
                    {line}
                </text>
            ))}
        </g>
    );
};

const CustomLabel = (props: any) => {
    const { x, y, width, height, value, fill, fontSize, textAnchor = 'middle', labelOnInside, position } = props;

    // Determine the vertical position based on the 'position' prop
    let labelY = y; // Default y position

    // For labels outside the bar
    if (position === "top" || position === undefined) {
        labelY = y - 10; // Position above the bar
    } else if (position === "center") {
        labelY = y + height / 2 - fontSize / 2; // Vertically centered within the height of the bar
    }

    return (
        <text
            x={x + width / 2} // Center horizontally
            y={labelY}
            fill={fill}
            fontSize={fontSize}
            textAnchor={textAnchor}
            dominantBaseline="middle" // Center text vertically
            dy={0} // Adjust dy if needed
        >
            {value}
        </text>
    );
};

const BarGraph: React.FC<BarChartProps> = ({
    data,
    yAxisLabel,
    xAxisLabel,
    xKey = "text",
    yAxisTickFormatter,
    tickCount,
    slantedLabel,
    margin,
    dateKeyRegex,
    answerRate,
    pointSystemType,
    labelOnInside = false,
    colors,
    isLikert = false,
    likertScale
}) => {
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

    // Calculate the maximum number of lines for the tick labels
    const maxTickLabelLines = data?.reduce((maxLines, item) => {
        const lines = wrapText(item[xKey], 140, 10).length;
        return Math.max(maxLines, lines);
    }, 1);

    // Adjust the dy value based on the maximum number of lines
    const adjustedDy = 20 + (maxTickLabelLines - 1) * 15; // 15 is the line height

    const keys = data?.reduce((acc, curr) => {
        Object.keys(curr).forEach(key => {
            if (dateKeyRegex?.test(key) && !acc.includes(key)) {
                acc.push(key);
            }
        });
        return acc;
    }, [] as string[]);

    const combinedMargin = {
        ...margin,
        bottom: slantedLabel ? (margin?.bottom || 0) + 50 : (margin?.bottom || adjustedDy),
        left: 20
    };

    // Helper function to clean up data key
    const stripIndexFromKey = (key: string) => {
        if (typeof key === 'string') {
            return key.replace(/\[\d+\]/g, '');
        }
        return key;
    };

    // Custom Tooltip Component
    const CustomTooltip = ({ active, payload, yAxisLabel, answerRate }: any) => {
        const { t } = useTranslation();

        if (active && payload && payload.length) {
            // Extract and clean data
            const entries = payload.map((entry: any) => {
                const cleanedDataKey = stripIndexFromKey(entry.dataKey);
                return {
                    dataKey: cleanedDataKey,
                    value: entry.value,
                    color: entry.fill,
                    cleanedLabel: cleanedDataKey
                };
            });

            return (
                <div className="custom-tooltip">
                    {entries.map((entry: any, index: any) => (
                        <p key={index} className="label">
                            {`${entry.cleanedLabel}: ${entry.value}`}
                        </p>
                    ))}
                    {/* Display additional information if available */}
                    {answerRate && answerRate[entries[0]?.dataKey] !== undefined ? (
                        <p className="answerRate">
                            {t("ReportPage.answerRate", { value: `${answerRate[entries[0]?.dataKey]}%` })}
                        </p>
                    ) : null}
                </div>
            );
        }
        return null;
    };
    const yAxisTickFormatterConditional = (value: any) => {
        if (pointSystemType === 2 || pointSystemType === "Percentage") {
            return `${value}%`;
        }
        return value;
    };

    const transformData = (data: any[]) => {
        const dateKeys = Object.keys(data[0]).filter(key => key !== "Name");
        return dateKeys.map(dateKey => data.map(item => ({
            Name: item.Name,
            value: item[dateKey],
            date: dateKey
        })));
    };

    const transformedData = transformData(data as any[]);

    const isAllZeroValues = transformedData.length > 0 && transformedData.every((dataSet) => dataSet.every((item) => item.value === 0));

    if (isAllZeroValues) {
        return (
            <ResponsiveContainer minHeight={150}>
                <EmptyView title="Ingen data for denne tidsperiode" />
            </ResponsiveContainer>
        );
    }

    const labelProps = yAxisTickFormatter ? undefined : { position: labelOnInside ? "top" : "center", fill: !labelOnInside ? "white" : "black", fontSize: 10 };

    return (
        <ResponsiveContainer width="100%" height="99%">
            <ComposedChart data={data} margin={combinedMargin}>
                <Tooltip
                    content={<CustomTooltip answerRate={answerRate} yAxisLabel={yAxisLabel} />}
                    wrapperStyle={{ outline: "none" }}
                    cursor={{ fill: 'transparent' }} />
                <XAxis
                    dataKey={xKey}
                    axisLine={{ stroke: "#ECEEF0", strokeWidth: '1px' }}
                    tickLine={{ stroke: "#ECEEF0", strokeWidth: '1px' }}
                    interval={0}
                    tick={<CustomXAxisTick slantedLabel={slantedLabel} />}
                    style={{ fontSize: "12px" }}
                    angle={!slantedLabel ? 0 : -25}
                    label={{
                        value: xAxisLabel,
                        position: 'centerBottom',
                        offset: 0,
                        dy: adjustedDy,
                        style: { fontSize: '14px' }
                    }}
                />
                <YAxis
                    label={{
                        value: yAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                        offset: 0,
                        style: { fontSize: '14px' },
                        dy: 80,
                    }}
                    axisLine={{ stroke: "#ECEEF0", strokeWidth: '1px' }}
                    tickLine={{ stroke: "#ECEEF0", strokeWidth: '1px' }}
                    allowDecimals={false}
                    padding={{ top: 15 }}
                    tickFormatter={yAxisTickFormatterConditional}
                    interval={0}
                    tickCount={tickCount}
                    style={{ fontSize: "15px" }}
                    tick={{ fill: "rgba(10, 8, 18, 0.87)" }}
                    domain={isLikert ? [0, likertScale || 0] : [0, 'auto']}
                />
                <CartesianGrid stroke="rgba(10, 8, 18, 0.2)" horizontal={true} vertical={false} />
                {keys.map((key: string, index: number) => (
                    <Bar
                        isAnimationActive={false}
                        key={index}
                        dataKey={key}
                        fill={themeColors[index]}
                        radius={[8, 8, 0, 0]}
                        label={<CustomLabel {...labelProps} />} // Pass label props correctly
                    />
                ))}
            </ComposedChart>
        </ResponsiveContainer>
    );
};


export default BarGraph;
