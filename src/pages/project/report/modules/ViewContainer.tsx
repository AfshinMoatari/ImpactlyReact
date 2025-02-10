import React from "react";
import { Box, CircularProgress } from "@material-ui/core";
import { ResponsiveContainer } from "recharts";
import { EmptyView } from "../../../../components/containers/EmptyView";
import TagChip from "../../../../components/TagChip";
import { ReportModuleConfig } from "../../../../models/Report";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { CustomTheme } from "../../../../constants/theme";
import { useAuth } from "../../../../providers/authProvider";
import { useTranslation } from "react-i18next";
import { NEW_CHART_COLORS } from "../../../../constants/ChartColors";

const useStyles = makeStyles<CustomTheme>(() => ({
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
    },
    timeSeries: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: "rgba(10, 8, 18, 0.08)",
        borderRadius: "8px",
        padding: "12px",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: "10px",
    },
    dynamicItem: {
        display: "flex",
        alignItems: "center",
    },
    statisticColor: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
}));

interface ViewContainerProps {
    data: any[] | undefined;
    children: React.ReactElement;
    config: ReportModuleConfig;
    loading?: boolean;
    populationSize?: { [key: string]: number };
    sampleSize?: { [key: string]: number };
    dateKeyRegex?: RegExp;
    customGuideLabels?: string[];
}

const ViewContainer: React.FC<ViewContainerProps> = ({
    data = [],
    config,
    children,
    loading,
    populationSize = {},
    sampleSize = {},
    dateKeyRegex,
    customGuideLabels = [],
}) => {
    const { currentProject } = useAuth();
    const classes = useStyles();
    const { tags } = config;
    const empty = !data || data.length === 0;
    const { t } = useTranslation();

    const keys = React.useMemo(() => {
        return data.reduce<string[]>((acc, curr) => {
            Object.keys(curr).forEach((key) => {
                if (dateKeyRegex?.test(key) && !acc.includes(key)) {
                    acc.push(key);
                }
            });
            return acc;
        }, []);
    }, [data, dateKeyRegex]);

    const stripIndexFromKey = (key: string) => key.replace(/\[\d+\]/g, '');

    const findMatchingKey = (key: string, sizeObject: { [key: string]: number }) => {
        const baseKey = stripIndexFromKey(key);
        return Object.keys(sizeObject).find(k => stripIndexFromKey(k) === baseKey) || key;
    };

    //Temp use project color MYOB demo problem
    const themeColors = currentProject?.theme && Object.keys(currentProject.theme).length > 0
        ? currentProject.theme
        : NEW_CHART_COLORS;

    // const themeColors = colors && Object.keys(colors).length > 0
    //     ? colors
    //     : project?.theme && Object.keys(project.theme).length > 0
    //         ? project.theme
    //         : NEW_CHART_COLORS;

    const renderStats = (key: string, label: string, index: number) => {
        const matchedPopKey = findMatchingKey(key, populationSize);
        const matchedSampKey = findMatchingKey(key, sampleSize);

        const popSize = populationSize[matchedPopKey] ?? 0;
        const sampSize = sampleSize[matchedSampKey] ?? 0;

        const displayRate =
            sampSize > 0 && popSize > 0
                ? (sampSize / popSize * 100).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                })
                : null;

        const customGuideLabel = customGuideLabels[index] || "";

        // Use themeColors[0] for the color in case of specific types
        const circleColor = (config.type === "aggregatedCount" || config.type === "numericalAverage" || config.type === "surveyStats")
            ? themeColors[0]
            : themeColors[index];

        // Conditional check for hiding the label
        const shouldHideLabel =
            config.type === "correlativeDistribution" &&
            config.multipleQuestionsIds &&
            Object.keys(config.multipleQuestionsIds).length > 1;

        return (
            <Box key={key} className={classes.dynamicItem}>
                {/* Conditional rendering for the statistic color span */}
                {!config.graphType || (config.graphType === 1 || config.graphType === 3) ? (
                    <span
                        className={classes.statisticColor}
                        style={{ backgroundColor: circleColor }}
                    ></span>
                ) : null}

                {/* Conditional rendering for the label */}
                <span style={{ fontSize: "10px" }}>
                    {!shouldHideLabel ? (
                        <>
                            {customGuideLabel && `${customGuideLabel} - `}
                            {`${label} (n = ${sampSize}${displayRate ? `, ${displayRate}%` : ""})`}
                            {`, N = ${popSize}`}
                        </>
                    ) : (
                        <>
                            {customGuideLabel && `${customGuideLabel}`}
                            {`${label}`}
                            {`, N = ${popSize}`}
                        </>
                    )}
                </span>
            </Box>
        );
    };

    const populationChip = (key: string) => {
        const popSize = populationSize[key];
        if (popSize !== undefined) {
            return <Box style={{ fontSize: "14px" }}></Box>;
        }
    };

    if (loading) {
        return (
            <ResponsiveContainer>
                <EmptyView title={t("Loading")}>
                    <CircularProgress />
                </EmptyView>
            </ResponsiveContainer>
        );
    }

    if (empty) {
        return (
            <ResponsiveContainer minHeight={150}>
                <EmptyView title={t("moduleConfigs.noData")} />
            </ResponsiveContainer>
        );
    }

    return (
        <Box className={classes.container}>
            <Box display="flex" width="95%" height="95%" pr={1} pl={1}>
                {children}
            </Box>

            <Box display="flex" pl={1} pb={config.type === "surveyStats" ? 1 : 0} padding="10px 10px 10px 20px">
                {tags && tags.map((tag, index) => (
                    <TagChip key={index} tag={tag} color="rgba(10, 8, 18, 0.12)" />
                ))}
            </Box>

            <Box padding="0 15px" style={{ backgroundColor: "rgba(10, 8, 18, 0.08)", borderBottom: "1px solid rgba(10, 8, 18, 0.12)" }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" padding="10px 0">
                    <div style={{ fontSize: "14px", fontWeight: 400 }}>
                        {t("moduleConfigs.periodAnswerRate")}
                        {(config.type === "surveyStats" || config.type === "customDistribution") && (
                            <>{t("moduleConfigs.answerRate")}</>
                        )}
                    </div>
                    <div>{populationChip(keys[0])}</div>
                </Box>
            </Box>

            {(config.type === "aggregatedCount" || config.type === "numericalAverage" || config.type === "surveyStats") && sampleSize ? (
                <Box className={classes.timeSeries}>
                    {data.map((chartData, index) => renderStats(chartData.Name, chartData.Name, index))}
                </Box>
            ) : (
                <Box className={classes.timeSeries}>
                    {keys.map((key, index) => renderStats(key, key.replace(/\[\d+]$/, "").replace(/\[\d+]/g, ""), index))}
                </Box>
            )}
        </Box>
    );
};

export default ViewContainer;
