import Registration, {NumericRegistration} from "../../models/Registration";
import sortTime from "./sortTime";
import timeFormatter, {TimeUnit} from "./createTimeFormatter";
import fold from "./fold";

export const convertCountRegsToChartData = (timeUnit: TimeUnit, data: Registration[], showAllDates = true) => {
    let uniqueDates: string[] = [];
    const localTimeFormatter = timeFormatter(timeUnit);
    let dates: Date[] = []
    if (showAllDates) {
        for (let i = 0; i < data.length; i++) {
            dates.push(new Date(data[i].date));
        }
        if (dates.length > 0) {
            dates = addMissingDates(dates.sort((a,b) => {return a.getTime() - b.getTime()}))
            dates = dates.sort((a, b) => {
                return a.getTime() - b.getTime()
            });

            const formattedDate = dates.map(date => localTimeFormatter(date))
            uniqueDates = Array.from(new Set(formattedDate))
        }
    }
    const values = data.map((r) => ({value: 1, time: new Date(r.date).getTime()}));
    const sorted = sortTime(values as { time: number }[]);
    const formatted = sorted.map(data => ({...data, time: localTimeFormatter(data.time)}));
    if (dates.length > 0 && showAllDates) {
        let mapped = formatted.reduce((prev, curr) => {
            // @ts-ignore
            prev[curr.time] = (curr.value);
            return prev;
        }, {} as { [time: string]: number[] })
        const missingDates = [];
        for (let i = 0; i < uniqueDates.length; i++) {
            if (!Object.keys(mapped).includes(uniqueDates[i])) {
                missingDates.push(uniqueDates[i])
            }
        }
        for (let i = 0; i < missingDates.length; i++) {
            formatted.push({time: missingDates[i]})
        }
        if (timeUnit !== TimeUnit.Monthly) formatted.sort((a, b) => (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0))
        return fold(formatted, "time", "value")
    } else {
        return fold(formatted, "time", "value");
    }
}

function addMissingDates(dates: Date[]): Date[] {
    const startDate = dates[0]
    const endDate = dates[dates.length - 1]
    const result: Date[] = []
    let currentDate = new Date(startDate.getTime());
    while (currentDate < endDate) {
        result.push(new Date(currentDate.getTime()));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return result;
}

export const convertNumRegsToChartData = (timeUnit: TimeUnit, data: Registration[], showAllDates: boolean = true) => {
    let uniqueDates: string[] = [];
    const localTimeFormatter = timeFormatter(timeUnit);
    const currDates: Date[] = []
    let dates: Date[] = []
    if (showAllDates) {
        const values = data.map((r) => ({value: (r as NumericRegistration).value, time: new Date(r.date).getTime()}));
        const sorted = sortTime(values as { value: number, time: number }[]) as { value: number, time: number }[];
        for (const value of sorted) {
            currDates.push(new Date(value.time))
        }
        if (currDates.length > 0) {
            dates = addMissingDates(currDates);
            const formattedDate = dates.map(date => localTimeFormatter(date))
            uniqueDates = Array.from(new Set(formattedDate))
        }
    }

    const values = data.map((r) => ({value: (r as NumericRegistration).value, time: new Date(r.date).getTime()}));
    const sorted = sortTime(values as { value: number, time: number }[]) as { value: number, time: number }[];
    const formatted = sorted.map(data => ({...data, time: localTimeFormatter(data.time)}));

    let mapped = formatted.reduce((prev, curr) => {
        if (!prev[curr.time]) prev[curr.time] = [];
        prev[curr.time].push(curr.value);
        return prev;
    }, {} as { [time: string]: number[] })

    const sum = (arr: number[]) => arr.reduce((sum, x) => sum + x);
    const average = (arr: number[]) => Math.round(sum(arr) / arr.length);

    if (dates.length > 0 && showAllDates) {
        const missingDates = [];
        for (let i = 0; i < uniqueDates.length; i++) {
            if (!Object.keys(mapped).includes(uniqueDates[i])) {
                missingDates.push(uniqueDates[i])
            }
        }
        const missingDatesObject = missingDates.reduce((prev, curr) => {
            if (!prev[curr]) prev[curr] = [];
            prev[curr].push(0);
            return prev;
        }, {} as { [time: string]: number[] })
        const result = {...mapped, ...missingDatesObject}
        if (timeUnit != TimeUnit.Monthly) {
            const ordered = Object.keys(result).sort().reduce(
                (obj, key) => {
                    // @ts-ignore
                    obj[key] = result[key];
                    return obj;
                },
                {}
            );
            // @ts-ignore
            return Object.keys(ordered).map((time) => ({time, value: average(ordered[time])}))
        }
        return Object.keys(result).map((time) => ({time, value: average(result[time])}))

    } else {
        return Object.keys(mapped).map((time) => ({time, value: average(mapped[time])}))
    }
}
