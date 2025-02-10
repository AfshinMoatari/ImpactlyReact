import { Frequency, CalendarUnit, CronFrequencyExpression, FrequencyExpression, SendoutFrequency } from "../models/cron/Frequency";
import cronstrue from "cronstrue/i18n";

const CronToFrequencyExpression = (cronExpression: string): CronFrequencyExpression => {
    const expression = cronExpression.split(" ");
    const minute = expression[0];
    const hour = expression[1];
    const day = expression[2];
    const month = expression[3];
    const week = expression[4];

    // Set clock
    const clock = {
        hour: parseInt(hour),
        minute: parseInt(minute)
    }

    // Case 0 days
    if (day.includes("/")) {
        return {
            count: parseInt(day.split('/')[1]),
            unit: CalendarUnit.DAILY,
            weekDays: [],
            monthDays: [],
            ...clock
        }
    }
    if (day.includes("*") && week.includes("*")) {
        return {
            count: 1,
            unit: CalendarUnit.DAILY,
            weekDays: [],
            monthDays: [],
            ...clock
        }
    }
    // Case 1 weeks
    if (week !== '*') {
        return {
            count: week.includes("X") ? parseInt(week.split("X")[1]) : 1,
            unit: CalendarUnit.WEEKLY,
            weekDays: convertFromCronIntervals(week.split("X")[0])
                .map(n => n % 7), // Revert from 7 days a week
            monthDays: [],
            ...clock
        }
    }

    // Case 2 months
    return {
        count: month.includes("/") ? parseInt(month.split("/")[1]) : 1,
        unit: CalendarUnit.MONTHLY,
        weekDays: [],
        monthDays: convertFromCronIntervals(day),
        ...clock
    }
}

const convertFromCronIntervals = (str: string) => {
    const array = []
    const commaSplit = str.split(",")
    for (const s of commaSplit) {
        if (!s.includes("-")) {
            array.push(parseInt(s))
            continue;
        }
        const dashSplit = s.split("-")
        for (let i = parseInt(dashSplit[0]); i <= parseInt(dashSplit[1]); i++) {
            array.push(i)
        }
    }
    return array
}

const convertToCronIntervals = (array: number[]) => {
    let str = ""
    let last = undefined;
    let cnt = 0;

    for (let i = 0; i < array.length; i++) {
        const weekDay = array[i];

        // set first
        if (last === undefined) {
            last = weekDay;
            str += weekDay.toString();
            continue;
        }

        // in a range
        if (weekDay - last === 1) {
            last = weekDay;
            cnt += 1;
            // last as interval
            if (i === array.length - 1) str += `-${last.toString()}`;
            continue
        }

        // last for interval
        if (cnt > 0) str += `-${last.toString()}`;

        // add last day
        str += `,${weekDay.toString()}`;
        last = weekDay;
        cnt = 0;
    }

    return str;
}

export const frequencyExpressionToCron = (freq: FrequencyExpression, endOnSunday: boolean = true) => {

    // convert to sunday on last day
    if (endOnSunday) {
        freq.weekDays = freq.weekDays.map(wd => {
            if (wd === 0) return 7
            return wd
        });
    }

    // pause unit for each interval type
    const pause =
        freq.count === 1 ?
            ""
            :
            freq.unit !== CalendarUnit.WEEKLY ?
                `/${freq.count}`
                :
                "X" + freq.count;

    // Case CalenderUnit.DAILY
    if (freq.unit === CalendarUnit.DAILY) return `${freq.minute} ${freq.hour} *${pause} * *`

    // Case CalenderUnit.WEEKLY
    if (freq.unit === CalendarUnit.WEEKLY) {
        const sortedWeekDays = freq.weekDays.sort();
        let days = freq.weekDays.length === 0 ? "*" : convertToCronIntervals(sortedWeekDays);
        return `${freq.minute} ${freq.hour} * * ${days}${pause}`
    }

    // Case CalenderUnit.MONTH
    const sortedMonthDays = freq.monthDays.sort();
    let days = freq.monthDays.length === 0 ? "*" : convertToCronIntervals(sortedMonthDays);
    return `${freq.minute} ${freq.hour} ${days} *${pause} *`
}

export const humanizeCronExpression = (cron: string, t: (key: string, options?: any) => string, locale: string): string => {
    // remove special operation
    const match = cron.match(/X\d*/);
    cron = cron.replace(match ? match[0] : '', '');
    let str = cronstrue.toString(cron, { locale });

    // add for weeks pause
    if (match)
        str += `, ${t('StrategyFlowPage.FrequencyView.everyNthWeek', {
            nthWeek: match[0].replace('X', ''),
        })}`;

    return str;
};

export const SendoutfrequencyToFrequencyExpression = (frequency: Frequency): FrequencyExpression =>
    CronToFrequencyExpression(frequency.cronExpression);