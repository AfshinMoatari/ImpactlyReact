import moment from 'moment';
import {DateRange, ReportModuleConfig} from "../../models/Report";


//date validtion for custom and validated surveys
export const isSurveyDateRangeValid = (dateRanges: DateRange[] | undefined): boolean => {
    if (!dateRanges) {
        return false;
    }

    return dateRanges.every(range => {
        const isStartValid = range.start && moment(range.start).isValid();
        const isEndValid = range.end && moment(range.end).isValid();
        const isEndAfterStart = range.start && range.end && moment(range.end).isSameOrAfter(moment(range.start));

        return isStartValid && isEndValid && isEndAfterStart;
    });
};

//date validtion for numeric and incident registrations
export const isRegDateRangeValid = (config: Partial<ReportModuleConfig>): boolean => {
    if (config.timePreset !== 'custom') {
        return true;
    }

    const parseDate = (date: Date | string | undefined) => {
        if (typeof date === 'string') {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime()) ? moment(parsedDate) : null;
        } else if (date instanceof Date) {
            return !isNaN(date.getTime()) ? moment(date) : null;
        }
        return null;
    };

    const startMoment = parseDate(config.start);
    const endMoment = parseDate(config.end);

    const isStartValid = startMoment ? startMoment.isValid() : false;
    const isEndValid = endMoment ? endMoment.isValid() : false;

    const isEndAfterStart = startMoment && endMoment ? endMoment.isSameOrAfter(startMoment) : false;

    return isStartValid && isEndValid && isEndAfterStart;
};

//date validation for status registrations
export const areStatusDatesValid = (dates: (Date | null | undefined)[]): boolean => {
    return dates.every(date => {
        if (!date) {
            return false;
        }

        const momentDate = moment(date);
        return momentDate.isValid();
    });
};