import React, { FunctionComponent } from "react";
import { Trans } from 'react-i18next'
import { SroiFlow } from "../../../../models/SROIFlow";
import SROIFlowPage from "../flow/SROIFlowPage";
import { TbReportAnalytics, TbReportMedical, TbReport } from "react-icons/tb";

export interface ConfigModuleProps {
    onSubmit: (values: Partial<Module>) => void;
    submitRef: React.RefObject<HTMLButtonElement>;
    setDateRangesValid: (valid: boolean) => void;
}

export const moduleTypes = {
    sroi: "SROI",
    mhaw: "MHAW",
    welby: "Welby",
};

export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface Module {
    type: string;
    icon: React.ReactNode;
    title: string | React.ReactNode;
    description: string | React.ReactNode;
    viewComponent?: FunctionComponent<SroiFlow>;
    layout: {
        minW: ColSpan,
        minH: number,
    }
}

export const sroi: Module = {
    type: moduleTypes.sroi,
    icon: <TbReportAnalytics color="#ED4C2F" size={24} />,
    title: <Trans i18nKey="AnalyticsPage.sroi.title" />,
    description: <Trans i18nKey="AnalyticsPage.sroi.description" />,
    viewComponent: SROIFlowPage,
    layout: {
        minW: 4,
        minH: 4,
    }
};

export const mhaw: Module = {
    type: moduleTypes.mhaw,
    icon: <TbReportMedical color="#ED4C2F" size={24} />,
    title: <Trans i18nKey="AnalyticsPage.mhaw.title" />,
    description: <Trans i18nKey="AnalyticsPage.mhaw.description" />,
    viewComponent: undefined,
    layout: {
        minW: 4,
        minH: 4,
    }
};

export const welby: Module = {
    type: moduleTypes.welby,
    icon: <TbReport color="#ED4C2F" size={24} />,
    title: <Trans i18nKey="AnalyticsPage.welby.title" />,
    description: <Trans i18nKey="AnalyticsPage.welby.description" />,
    viewComponent: undefined,
    layout: {
        minW: 4,
        minH: 4,
    }
};

const modulesMap = {
    [moduleTypes.sroi]: sroi,
    [moduleTypes.mhaw]: mhaw,
    [moduleTypes.welby]: welby,
};

export const modules = Object.values(modulesMap);

export default modulesMap;