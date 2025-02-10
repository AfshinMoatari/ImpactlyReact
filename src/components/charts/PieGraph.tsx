import React, { CSSProperties, useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { EmptyView } from "../containers/EmptyView";
import { NEW_CHART_COLORS } from "../../constants/ChartColors";
import { Typography } from "@material-ui/core";
import { useAuth } from "../../providers/authProvider";

interface PieChartProps {
    data: any[];
    percentage: boolean;
    colors?: { [key: number]: string };
    dateKeyRegex?: RegExp; // Optional regex to filter date keys
}

const styles: Record<string, CSSProperties> = {
    legendItem: {
        display: 'flex',
        alignItems: 'baseline',
    },
    centeredContent: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
    },
    legendWrapper: {
        display: 'flex',
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "normal",
        textAlign: 'right',
        minWidth: "20%",
        marginLeft: "15px",
    },
    legendIcon: {
        width: 12,
        height: 12,
        borderRadius: '50%',
        flexShrink: 0,
    },
    legendText: {
        marginLeft: '5px',
        marginBottom: 15,
    },
};

const PieGraph: React.FC<PieChartProps> = ({ data, percentage, colors, dateKeyRegex }) => {
    const project = useAuth().currentProject;
    const [chartKey, setChartKey] = useState(0);


    //Temp use project color MYOB demo problem
    const themeColors = project?.theme && Object.keys(project.theme).length > 0
        ? project.theme
        : NEW_CHART_COLORS;

    // const themeColors = colors && Object.keys(colors).length > 0
    //     ? colors
    //     : project?.theme && Object.keys(project.theme).length > 0
    //         ? project.theme
    //         : NEW_CHART_COLORS;

    useEffect(() => {
        setChartKey((prevKey) => prevKey + 1);
    }, [data]);

    const transformData = (data: any[]) => {
        // Extract and format date keys based on dateKeyRegex
        const dateKeys = Object.keys(data[0])
            .filter((key) => key !== "Name" && (!dateKeyRegex || dateKeyRegex.test(key)));

        // Function to format date keys
        const formatDateKey = (key: string) => key.replace(/\[\d+\]/g, '');

        return dateKeys.map((dateKey) =>
            data.map((item) => ({
                Name: item.Name,
                value: item[dateKey],
                date: formatDateKey(dateKey), // Format the date key
            }))
        );
    };

    const transformedData = transformData(data);

    const isAllZeroValues = transformedData.length > 0 && transformedData.every((dataSet) => dataSet.every((item) => item.value === 0));

    if (isAllZeroValues) {
        return (
            <ResponsiveContainer minHeight={150}>
                <EmptyView title="Ingen data for denne tidsperiode" />
            </ResponsiveContainer>
        );
    }

    const themeArray = Object.values(themeColors);

    const customLegend = (value: string, color: string) => {
        return (
            <div style={styles.legendItem}>
                <div style={{ ...styles.legendIcon, backgroundColor: color }} />
                <span style={styles.legendText}>{value}</span>
            </div>
        );
    };

    return (
        <>
            {transformedData.map((dataSet, chartIndex) => {
                const isPieZeroValues = dataSet.every((item) => item.value === 0);

                if (isPieZeroValues) {
                    return (
                        <ResponsiveContainer key={chartIndex}>
                            <div style={styles.centeredContent}>
                                <Typography variant="body2">
                                    {`Ingen data for tidsperiode ${dataSet[0]?.date.replace(/\[\d+\]$/, "")}`}
                                </Typography>
                            </div>
                        </ResponsiveContainer>
                    );
                }
                return (
                    <ResponsiveContainer width="100%" height="95%" key={chartIndex}>
                        <PieChart>
                            <Pie
                                data={dataSet}
                                dataKey="value"
                                nameKey="Name"
                                cx="45%"
                                cy="50%"
                                outerRadius="40%" // Adjust this value for smaller pie chart
                                label={(entry) => {
                                    const labelValue = parseFloat(entry.value);
                                    if (labelValue === 0) {
                                        return null;
                                    }
                                    const formattedValue = labelValue % 1 === 0 ? labelValue : labelValue.toFixed(1);
                                    return percentage ? `${formattedValue}%` : formattedValue;
                                }}
                                labelLine={dataSet.some((item) => item.value !== 0)} // Boolean indicating if label lines should be displayed
                            >
                                {dataSet.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            themeArray[index % themeArray.length]
                                        }
                                    />
                                ))}
                            </Pie>
                            <text x="45%" y="95%" textAnchor="middle" fontSize={10}>
                                {dataSet[0]?.date.replace(/\[\d+\]$/, "")}
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                );
            })}
            <div style={styles.legendWrapper}>
                {transformedData[transformedData.length - 1]?.map((entry, index) =>
                    customLegend(
                        entry.Name,
                        themeArray[index % themeArray.length]

                    )
                )}
            </div>
        </>
    );
};

export default PieGraph;
