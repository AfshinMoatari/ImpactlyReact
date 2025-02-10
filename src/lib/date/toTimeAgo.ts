import i18n from 'i18next';
import {toLocalDateTimeString} from "./toLocalISO";

export const toTimeAgo = (input: Date | string): string => {
    if (!input) return "";
    const date = new Date(input);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (seconds < 10) {
        return i18n.t('timeAgo.justNow');
    } else if (seconds < 60) {
        return i18n.t('timeAgo.secondsAgo', { count: seconds });
    } else if (minutes === 1) {
        return i18n.t('timeAgo.minuteAgo', { count: minutes });
    } else if (minutes < 60) {
        return i18n.t('timeAgo.minutesAgo', { count: minutes });
    } else if (hours === 1) {
        return i18n.t('timeAgo.hourAgo', { count: hours });
    } else if (hours < 24) {
        return i18n.t('timeAgo.hoursAgo', { count: hours });
    } else if (days === 1) {
        return i18n.t('timeAgo.dayAgo');
    } else if (days < 8) {
        return i18n.t('timeAgo.daysAgo', { count: days });
    } else {
        return toLocalDateTimeString(date);
    }
};
