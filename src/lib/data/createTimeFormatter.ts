import { format } from "date-fns";
import { da } from "date-fns/locale";
import i18n from 'i18next';


export enum TimeUnit {
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Yearly,
}

export const TimeUnitMap = (i18nInstance: typeof i18n): { [key: number]: string } => {
    return {
        0: i18nInstance.t('timePresets.daily'),
        1: i18nInstance.t('timePresets.weekly'),
        2: i18nInstance.t('timePresets.monthly'),
        3: i18nInstance.t('timePresets.quarterly'),
        4: i18nInstance.t('timePresets.yearly'),
    };
};

type DateFormatter = (date: Date) => string;

const dailyFormat: DateFormatter = d => format(new Date(d), "dd/MM/yy", { locale: da, weekStartsOn: 1 });
const weeklyFormat: DateFormatter = d => "Uge " + format(new Date(d), "w/yy", { locale: da, weekStartsOn: 1 });
const monthlyFormat: DateFormatter = d => format(new Date(d), "yyyy-MM", { locale: da, weekStartsOn: 1 });
const quarterlyFormat: DateFormatter = d => format(new Date(d), "qqq yy", { locale: da, weekStartsOn: 1 })
const yearlyFormat: DateFormatter = d => format(new Date(d), "yyyy", { locale: da, weekStartsOn: 1 });

export const formatterMap = {
    [TimeUnit.Daily]: dailyFormat,
    [TimeUnit.Weekly]: weeklyFormat,
    [TimeUnit.Monthly]: monthlyFormat,
    [TimeUnit.Quarterly]: quarterlyFormat,
    [TimeUnit.Yearly]: yearlyFormat,
}

export const TimeUnitTemp = (i18nInstance: typeof i18n): { [key: string]: string } => {
    return {
        Daily: i18nInstance.t('timePresets.daily'),
        Weekly: i18nInstance.t('timePresets.weekly'),
        Monthly: i18nInstance.t('timePresets.monthly'),
        Quarterly: i18nInstance.t('timePresets.quarterly'),
        Annual: i18nInstance.t('timePresets.yearly')
    };
}

const timeFormatter = (unit: TimeUnit) => (date: number | string | Date) => {
    const d = new Date(date);

    return formatterMap[unit](d);
}

export default timeFormatter;
