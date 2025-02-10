import {DefaultLocale} from "../models/cron/Local";

const da: DefaultLocale = {
    endOnSunday: false,
    weekDays: [
        'Søndag',
        'Mandag',
        'Tirsdag',
        'Onsdag',
        'Torsdag',
        'Fredag',
        'Lørdag',
    ],
    weekDaysOrderedList: [1, 2, 3, 4, 5, 6, 0],
    altWeekDays: [
        'S',
        'M',
        'T',
        'O',
        'T',
        'F',
        'L',
    ],
    months: [
        'Januar',
        'Februar',
        'Marts',
        'April',
        'Maj',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'December',
    ],
    altMonths: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'Maj',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Okt',
        'Nov',
        'Dec',
    ],
    monthDays: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
    ]
}

const local_calender = {
    da: da
}

export default local_calender;