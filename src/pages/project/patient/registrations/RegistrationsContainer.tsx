import React, {useState} from "react";
import {Box, MenuItem, Select} from "@material-ui/core";
import Registration from "../../../../models/Registration";
import Strategy from "../../../../models/Strategy";
import isNumber from "../../../../lib/math/isNumber";
import {TimeUnit, TimeUnitMap} from "../../../../lib/data/createTimeFormatter";
import EmptyButtonView from "../../../../components/containers/EmptyView";
import {convertCountRegsToChartData, convertNumRegsToChartData} from "../../../../lib/data/convertRegsToChartData";
import {ResponsiveContainer} from "recharts";
import BarGraph from "../../../../components/charts/BarGraph";
import {useTranslation} from "react-i18next";

interface RegistrationsContainerProps {
    strategy: Strategy;
    registrations: Registration[];
}

const RegistrationsContainer: React.FC<RegistrationsContainerProps> = ({ strategy, registrations }) => {

    const { t, i18n: i18nInstance } = useTranslation();
    const timeUnitMap = TimeUnitMap(i18nInstance);
    const nonStatusEffects = strategy.effects.filter(e => e.type != "status");
    const [registrationKey, setRegistrationKey] = useState(nonStatusEffects.length > 0 ? nonStatusEffects[0].id : "");
    const regs = registrations.filter(r => r.effectId === registrationKey)
    const [timeUnit, setTimeUnit] = useState(TimeUnit.Weekly);
    if (nonStatusEffects.length === 0) return null;

    const isNumeric = regs[0]?.type === "numeric";
    const chartData = isNumeric ? convertNumRegsToChartData(timeUnit, regs) : convertCountRegsToChartData(timeUnit, regs)
    const sortedChartData = [...chartData].sort((a, b) => {
        const dateA = new Date(a.time);
        const dateB = new Date(b.time);
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <React.Fragment>
            <Box display="flex" justifyContent="flex-end" alignItems="center">
                <Select
                    onChange={e => setRegistrationKey((e.target.value as string))}
                    value={registrationKey}
                    variant="outlined"
                    style={{marginRight: 8, minWidth: 160}}
                >
                    {nonStatusEffects.map(effect => (
                        <MenuItem key={effect.id} value={effect.id}>{effect.name}</MenuItem>
                    ))}
                </Select>
                <Select
                    onChange={e => setTimeUnit(e.target.value as TimeUnit)}
                    value={timeUnit}
                    variant="outlined"
                >
                    {Object.values(TimeUnit).filter(k => isNumber(k)).map((v) => (
                        <MenuItem key={v} value={v}>{timeUnitMap[Number(v)]}</MenuItem>
                    ))}
                </Select>
            </Box>
            <Box height="360px" pb={2} pt={2} mb={2} borderBottom="2px solid #eceef0">
                {regs.length === 0 ? (
                    <EmptyButtonView
                        title={t("CitizenPage.noData")}
                        subTitle={t("CitizenPage.createRegMessage")}
                        noImage
                    />
                ) : (
                    <ResponsiveContainer>
                        <BarGraph yAxisLabel={isNumeric? "Gns. værdi" : "Antal"} xKey="time" data={sortedChartData} dateKeyRegex={/value/}/>
                    </ResponsiveContainer>
                )}
            </Box>
        </React.Fragment>
    )
}

export default RegistrationsContainer;
