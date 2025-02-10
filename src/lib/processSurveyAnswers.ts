import {getMonth, getQuarter, getWeek, getYear} from "date-fns";
import {EntryBatch} from "../models/Survey";
import {Point} from "recharts/types/shape/Curve";

export interface PointStats {
    points: Point[]
    min: number;
    max: number;
    sum: number;
    count: number;
    average: number;
}

export interface XPointStats extends PointStats {
    x: number;
}

export interface SurveyStats {
    start: Date;
    end: Date;
    data: {
        WEEK: XPointStats[];
        MONTH: XPointStats[];
        QUARTER: XPointStats[];
    }
}

const pointMapToArray = (map: { [x: number]: PointStats }): XPointStats[] => Object.keys(map).map(x => ({ x: Number(x), ...map[Number(x)]}))

// WEEK, MONTH, QUARTER
const processSurveyAnswers = (answers: EntryBatch[]): SurveyStats => {
    const { startDate, endDate } = answers.reduce(({startDate, endDate}, curr) => ({
        startDate: new Date(curr.answeredAt) < startDate ? new Date(curr.answeredAt) : startDate,
        endDate: new Date(curr.answeredAt) > endDate ? new Date(curr.answeredAt) : endDate,
    }), { startDate: new Date(), endDate: new Date() })

    const minYear = getYear(startDate);

    const timeData = answers.map(({score, answeredAt}: EntryBatch) => {
        const date = new Date(answeredAt)
        const actual = {
            date,
            week: getWeek(date, { weekStartsOn: 1 }),
            month: getMonth(date),
            quarter: getQuarter(date),
            year: getYear(date)
        }

        const yearsAHead = actual.year - minYear;
        const relative: { [p: string]: number } = {
            startYear: minYear,
            week: actual.week + 52 * yearsAHead,
            month: actual.month + 12 * yearsAHead,
            quarter: actual.quarter + 4 * yearsAHead,
        }

        return { score, actual, relative }
    });

    const pointStatsMap = timeData.reduce((prev, curr, i) => {
        for (const time of ["WEEK", "MONTH", "QUARTER"]) {
            const x = curr.relative[time.toLowerCase()];
            if (prev[time][x] === undefined) {
                prev[time][x] = {
                    min: curr.score,
                    max: curr.score,
                    average: curr.score,
                    count: 0,
                    sum: 0,
                    points: []
                };
            }
            prev[time][x].points.push({ x, y: curr.score})

            const old = prev[time][x];

            prev[time][x].min = curr.score < old.min ? curr.score : old.min;
            prev[time][x].max = curr.score > old.max ? curr.score : old.max;
            prev[time][x].count += 1;
            prev[time][x].sum += curr.score;
            prev[time][x].average = prev[time][x].sum / prev[time][x].count;
        }

        return prev;
    }, { "WEEK": {}, "MONTH": {}, "QUARTER": {}} as { [p: string]: { [q: number]: Omit<PointStats, "x">}})

    return {
        start: startDate,
        end: endDate,
        data: {
            WEEK: pointMapToArray(pointStatsMap.WEEK),
            MONTH: pointMapToArray(pointStatsMap.MONTH),
            QUARTER: pointMapToArray(pointStatsMap.QUARTER),
        }
    }
}

export default processSurveyAnswers;
