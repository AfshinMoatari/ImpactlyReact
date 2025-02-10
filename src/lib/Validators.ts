import * as Yup from "yup";
import { isDate } from "date-fns";
import i18n from 'i18next';

export class Validators {
    static required = () =>
        Yup.string().required(i18n.t('validators.requiredField'));

    static email = () =>
        Yup.string().email(i18n.t('validators.invalidEmail'));

    static phone = () =>
        Yup.string().matches(/\+?\d{8,10}/, i18n.t('validators.invalidPhone'));

    static password = () =>
        Yup.string()
            .min(6, i18n.t('validators.passwordLength'))
            .max(64, i18n.t('validators.passwordMaxLength'))
            .matches(/[0-9]/, i18n.t('validators.passwordDigit'))
            .matches(/[A-ZÆØÅ]/, i18n.t('validators.passwordUppercase'));

    static passwordRepeat = () =>
        Yup.string()
            .oneOf([Yup.ref('password'), null], i18n.t('validators.passwordMismatch'));

    static dateNotInFuture = () => {
        const today = new Date();
        today.setHours(23, 59, 59, 0);
        return Yup.date()
            .max(today, i18n.t('validators.futureDate'))
            .typeError(i18n.t('validators.invalidDate'));
    };

    static validDate = () =>
        Yup.date()
            .nullable()
            .test("is-date", i18n.t('validators.invalidDate'), date => isDate(date))
            .typeError(i18n.t('validators.invalidDate'));

    static requiredDate = () =>
        Yup.date()
            .nullable()
            .required(i18n.t('validators.requiredDate'))
            .typeError(i18n.t('validators.invalidDate'));
}