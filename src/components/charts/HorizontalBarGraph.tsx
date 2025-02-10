import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from "react-i18next";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, CartesianGrid, Bar, Cell, Text } from "recharts";
import { NEW_CHART_COLORS } from "../../constants/ChartColors";
import { useAuth } from "../../providers/authProvider";
import EmptyView from "../containers/EmptyView";

// Helper function to clean up data key
const stripIndexFromKey = (key: string) => {
    if (typeof key === 'string') {
        return key.replace(/\[\d+\]/g, '');
    }
    return key;
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, xKey, answerRate }: any) => {
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

        // Get value for the xKey from payload
        const dataName = payload[0]?.payload[xKey];
        const rateValue = answerRate && answerRate[dataName];

        return (
            <div className="custom-tooltip">
                {entries.map((entry: any, index: any) => (
                    <p key={index} className="label" style={{ color: entry.color }}>
                        {`${entry.cleanedLabel}: ${entry.value}`}
                    </p>
                ))}
                <p className="intro">{label}</p>
                {rateValue !== undefined && (
                    <p className="answerRate">
                        {t("ReportPage.answerRate", { value: `${rateValue}%` })}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

interface HorizontalBarGraphProps {
    label?: string;
    slantedLabel?: boolean | undefined;
    yAxisLabel?: string;
    xAxisLabel?: string;
    data: any[] | undefined;
    xKey: string;
    tickCount?: number;
    margin?: { bottom: number; left: number; top: number; };
    dateKeyRegex?: RegExp;
    answerRate?: { [key: string]: number };
    pointSystemType?: string | number | undefined;
    labelOnInside?: boolean;
    isLikert?: boolean;
    likertScale?: number;
    colors?: { [key: number]: string };
}

const HorizontalBarGraph: React.FC<HorizontalBarGraphProps> = ({
    data,
    xKey = "Name",
    margin,
    dateKeyRegex,
    answerRate,
    pointSystemType,
    labelOnInside = false,
    isLikert = false,
    colors,
    likertScale,
    xAxisLabel,
    yAxisLabel
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

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [yAxisWidth, setYAxisWidth] = useState(340);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                setYAxisWidth(Math.min(containerWidth * 0.2, 340));
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        handleResize();

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, []);

    const combinedMargin = {
        ...margin,
        bottom: margin?.bottom || 20,
    };

    const keys = data?.reduce((acc: any, curr: any) => {
        Object.keys(curr).forEach(key => {
            if (dateKeyRegex?.test(key) && !acc.includes(key)) {
                acc.push(key);
            }
        });
        return acc;
    }, []);

    const xAxisTickFormatter = (value: string | number | Date, index: number) => {
        const limit = 20;
        if (typeof value !== 'string') {
            value = pointSystemType === 2 || pointSystemType === "Percentage" ? `${value}%` : value.toString();
        }
        return value.length < limit ? value : `${value.substring(0, limit)}...`;
    };

    const isAllZeroValues = data && data.every((d) => keys.every((key: any) => d[key] === 0));

    if (isAllZeroValues) {
        return (
            <ResponsiveContainer minHeight={150}>
                <EmptyView title="Ingen data for denne tidsperiode" />
            </ResponsiveContainer>
        );
    }

    const calculateBarSize = (numberOfItems: number): number => {
        const maxBarHeight = 50;
        return Math.max(maxBarHeight / numberOfItems, 20);
    };

    const barSize = calculateBarSize(data?.length || 0);

    // Extract the keys from the themeColors object
    const themeKeys = Object.keys(themeColors).map(Number);

    const datasetColors = keys.reduce((acc: any, key: string, idx: number) => {
        const colorKey = themeKeys[idx % themeKeys.length]; // Cycle through themeKeys
        acc[key] = themeColors[colorKey]; // Assign the color using the corresponding key
        return acc;
    }, {});

    const getYAxisTickStyle = (value: string, maxWidth: number) => {
        const baseFontSize = 12;
        const maxLength = 20;
        let fontSize = baseFontSize;

        if (value.length > maxLength) {
            fontSize = Math.max(baseFontSize - (value.length - maxLength) / 2, 10);
        }

        return { fontSize: `${fontSize}px`, maxWidth };
    };

    const wrapText = (text: string, maxWidth: number) => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const { width } = getTextWidth(testLine);

            if (width > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        return lines;
    };

    const getTextWidth = (text: string) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return { width: 0 };
        context.font = '12px Arial';
        const width = context.measureText(text).width;
        return { width };
    };

    const renderCustomYAxisTick = (props: any) => {
        const { x, y, payload } = props;
        const maxWidth = yAxisWidth - 50;
        const { fontSize, maxWidth: textMaxWidth } = getYAxisTickStyle(payload.value, maxWidth);
        const lines = wrapText(payload.value, textMaxWidth);

        return (
            <g>
                {lines.map((line, index) => (
                    <Text
                        key={index}
                        x={50}
                        y={y + (index * 12)}
                        fill="#666"
                        fontSize={fontSize}
                        textAnchor="start"
                        verticalAnchor="middle"
                    >
                        {line}
                    </Text>
                ))}
            </g>
        );
    };

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="99%" debounce={50}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={combinedMargin}
                >
                    <XAxis
                        type="number"
                        axisLine={{ stroke: "#ECEEF0", strokeWidth: '1px' }}
                        tickLine={{ stroke: "#ECEEF0", strokeWidth: '1px' }}
                        tickFormatter={xAxisTickFormatter}
                        style={{ fontSize: "12px" }}
                        domain={isLikert ? [0, likertScale || 'auto'] : [0, 'auto']}
                        label={{
                            value: xAxisLabel,
                            position: 'centerBottom',
                            offset: 0,
                            dy: 20,
                            style: { fontSize: '14px' }
                        }}
                    />
                    <YAxis
                        dataKey={xKey}
                        type="category"
                        axisLine={{ stroke: "#ECEEF0", strokeWidth: '1px' }}
                        tickLine={{ stroke: "#ECEEF0", strokeWidth: '1px' }}
                        width={yAxisWidth}
                        tick={renderCustomYAxisTick}
                        domain={isLikert ? [0, likertScale || 'auto'] : [0, 'auto']}
                        label={{
                            value: yAxisLabel,
                            angle: -90,
                            position: 'insideLeft',
                            offset: 8,
                            style: { fontSize: '14px' },
                            dy: 30,
                        }}
                    />
                    <Tooltip content={<CustomTooltip answerRate={answerRate} xKey={xKey} />} wrapperStyle={{ outline: "none" }} cursor={{ fill: 'transparent' }} />
                    <CartesianGrid stroke="rgba(10, 8, 18, 0.2)" horizontal={false} vertical />
                    {keys.map((key: any) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            minPointSize={8}
                            barSize={barSize}
                            isAnimationActive={false}
                            radius={[0, 8, 8, 0]}
                            label={labelOnInside ? { position: "inside", fill: "white", fontSize: 12 } : { position: "right", fill: "black", fontSize: 12 }}
                        >
                            {data?.map((d: any) => (
                                <Cell
                                    key={`${d[xKey]}-${key}`}
                                    fill={datasetColors[key]}
                                />
                            ))}
                        </Bar>
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HorizontalBarGraph;
