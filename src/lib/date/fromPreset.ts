import {
    endOfMonth,
    endOfQuarter,
    endOfWeek, endOfYear,
    startOfMonth,
    startOfQuarter,
    startOfWeek, startOfYear,
    subMonths, subQuarters,
    subWeeks, subYears
} from "date-fns";
import i18n from 'i18next';


export interface TimePreset {
    id: string;
    name: string;
    start: (d: Date) => Date;
    end: (d: Date) => Date;
}

export interface TimeData {
    preset: string;
    start: number;
    end: number;
}

export const customTime = (): TimePreset => ({
    id: "custom",
    name: i18n.t('timePresets.custom'),
    start: d => d,
    end: d => d,
});

export const timePresets = (): TimePreset[] => [
    // {
    //     id: "allTime",
    //     name: "Al tid",
    //     start: d => null,
    //     end: d => null,
    // },
    {
        id: "ThisWeek",
        name: i18n.t('timePresets.thisWeek'),
        start: startOfWeek,
        end: endOfWeek
    },
    {
        id: "LastWeek",
        name: i18n.t('timePresets.lastWeek'),
        start: d => startOfWeek(subWeeks(d, 1)),
        end: d => endOfWeek(subWeeks(d, 1)),
    },
    {
        id: "ThisMonth",
        name: i18n.t('timePresets.thisMonth'),
        start: startOfMonth,
        end: endOfMonth,
    },
    {
        id: "LastMonth",
        name: i18n.t('timePresets.lastMonth'),
        start: d => startOfMonth(subMonths(d, 1)),
        end: d => endOfMonth(subMonths(d, 1)),
    },
    {
        id: "ThisQuarter",
        name: i18n.t('timePresets.thisQuarter'),
        start: startOfQuarter,
        end: endOfQuarter,
    },
    {
        id: "LastQuarter",
        name: i18n.t('timePresets.lastQuarter'),
        start: d => startOfQuarter(subQuarters(d, 1)),
        end: d => endOfQuarter(subQuarters(d, 1)),
    },
    {
        id: "ThisYear",
        name: i18n.t('timePresets.thisYear'),
        start: startOfYear,
        end: endOfYear,
    },
    {
        id: "LastYear",
        name: i18n.t('timePresets.lastYear'),
        start: d => startOfYear(subYears(d, 1)),
        end: d => endOfYear(subYears(d, 1))
    },
]

// export const timePresetMap = timePresets.reduce((prev, curr) => {
//     prev[curr.id] = curr;
//     return prev;
// }, {} as {[p: string]: TimePreset});

const fromPreset = (preset: string): { start: Date | undefined, end: Date | undefined } => {
    const timePresetArray = timePresets(); // Call the function to get the array
    const timePreset = timePresetArray.find(tp => tp.id === preset); // Now use .find() on the array
    if (timePreset === undefined) return {end: undefined, start: undefined};

    const start = timePreset.start(new Date());
    const end = timePreset.end(new Date());

    return { start, end };
}

export default fromPreset;
