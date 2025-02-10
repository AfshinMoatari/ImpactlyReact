import React from "react";
import Chip from "@material-ui/core/Chip";
import {EndType, Frequency} from "../models/cron/Frequency";
import {humanizeCronExpression} from "../lib/cron";
import {useTranslation} from "react-i18next";
import {useLanguage} from "../LanguageContext";

export const textifyFrequency = (f: Frequency, t: (key: string, options?: any) => string, language: string) => {
    const endsWhen = f.end.type === EndType.NEVER
        ? t('StrategyFlowPage.FrequencyView.untilCompleted')
        : t('StrategyFlowPage.FrequencyView.untilNumberSendouts', {number: f.end.occurrences});

    return humanizeCronExpression(f.cronExpression, t, language) + endsWhen;
}

interface FrequencyChipProps {
    frequency: Frequency;
    onClick?: (e: React.MouseEvent) => void;
}


const FrequencyChip: React.FC<FrequencyChipProps> = ({frequency, onClick}) => {
    const { t } = useTranslation();
    const {language} = useLanguage();

    const label = textifyFrequency(frequency, t, language);

    return (
        <Chip
            label={label}
            onClick={onClick && onClick}
            color="primary"
        />
    )
}

export default FrequencyChip;
