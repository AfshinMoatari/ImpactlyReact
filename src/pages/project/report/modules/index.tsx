import React, { FunctionComponent } from "react";
import { ReportModuleConfig } from "../../../../models/Report";
import MethodGraphView from "./method_graph/MethodGraphView";
import MethodGraphConfig from "./method_graph/MethodGraphConfig";
import CustomDistributionView from "./custom_distribution/CustomDistributionView";
import CustomDistributionConfig from "./custom_distribution/CustomDistributionConfig";
import AggregatedCountView from "./aggregated_count/AggregatedCountView";
import AggregatedCountConfig from "./aggregated_count/AggregatedCountConfig";
import NumericalAverageView from "./numerical_average/NumericalAverageView";
import NumericalAverageConfig from "./numerical_average/NumericalAverageConfig";
import StatusDistributionView from "./status_distribution/StatusDistributionView";
import StatusDistributionConfig from "./status_distribution/StatusDistributionConfig";
import PictureUploadConfig from "./Picture_Upload/UploadPictureConfig";
import PictureUploadView from "./Picture_Upload/UploadPictureView";
import FreeTextView from "./free_text/FreeTextView";
import FreeTextConfig from "./free_text/FreeTextConfig";
import { Trans } from 'react-i18next'
import { RiFileList3Line, RiImageLine, RiLineChartLine, RiPieChartLine, RiShieldCheckLine, RiTaskLine, RiBarChart2Line } from "react-icons/ri";
import CorrelativeDistributionConfig from "./correlative_distribution/CorrelativeDistributionConfig";
import CorrelativeDistributionView from "./correlative_distribution/CorrelativeDistributionView";

export interface ModuleProps {
    config: ReportModuleConfig;
    mode: string;
}

export interface ConfigModuleProps {
    onSubmit: (values: Partial<ReportModuleConfig>) => void;
    submitRef: React.RefObject<HTMLButtonElement>;
    editModuleConfig?: ReportModuleConfig;
    setDateRangesValid: (valid: boolean) => void;
}

export interface CorrelativeDistributionStatsTabel {
    id: string;
    question: string;
    period: string;
    N: number;
    n: number;
    answerRate: string;
}

export const moduleTypes = {
    // change
    methodGraph: "surveyStats",
    customDistribution: "customDistribution",
    correlativeDistribution: "correlativeDistribution",
    // changePercent: 'changePercent',
    // changeChart: 'changeChart',
    // changeTable: 'changeTable',
    //
    // //impact
    // impactChart: 'impactChart',
    // impactMap: 'impactMap',
    // scbr: 'scbr',
    // keyNumbers: 'keyNumbers',
    //
    // // other
    // markdown: 'markdown',
    // image: 'image',
    statusDistribution: "statusDistribution",
    PictureUpload: "pictureUpload",
    freeText: "freeText",
    numericalAverage: "numericalAverage",
    aggregatedCount: "aggregatedCount",
};

export const pointSystemTypeMap = {
    "Point": <Trans i18nKey="ReportsIndex.pointSystemTypeMap.absoluteNumbers" />,
    "Percentage": <Trans i18nKey="ReportsIndex.pointSystemTypeMap.percentage" />,
};

export const graphTypeMap = {
    1: <Trans i18nKey="ReportsIndex.graphTypeMap.bar" />,
    2: <Trans i18nKey="ReportsIndex.graphTypeMap.pie" />,
};

export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface Module {
    type: string;
    icon: React.ReactNode;
    title: string | React.ReactNode;
    description: string | React.ReactNode;
    viewComponent?: FunctionComponent<ModuleProps>;
    configComponent?: FunctionComponent<ConfigModuleProps>;
    layout: {
        minW: ColSpan,
        minH: number,
    }
}

export const methodGraph: Module = {
    type: moduleTypes.methodGraph,
    icon: <RiShieldCheckLine color="#ED4C2F" size={24} />,
    title: <Trans i18nKey="ReportsIndex.surveyStats.title" />,
    description: <Trans i18nKey="ReportsIndex.surveyStats.description" />,
    viewComponent: MethodGraphView,
    configComponent: MethodGraphConfig,
    layout: {
        minW: 4,
        minH: 4,
    }
};

export const pictureUpload: Module = {
    type: moduleTypes.PictureUpload,
    icon: <RiImageLine color="#503E8E" size={24} />,
    title: <Trans i18nKey="ReportsIndex.pictureUpload.title" />,
    description: <Trans i18nKey="ReportsIndex.pictureUpload.description" />,
    viewComponent: PictureUploadView,
    configComponent: PictureUploadConfig,
    layout: {
        minW: 3,
        minH: 2,
    }
};

export const freeText: Module = {
    type: moduleTypes.freeText,
    icon: <RiFileList3Line color="#503E8E" size={24} />,
    title: <Trans i18nKey="ReportsIndex.freeText.title" />,
    description: <Trans i18nKey="ReportsIndex.freeText.description" />,
    viewComponent: FreeTextView,
    configComponent: FreeTextConfig,
    layout: {
        minW: 2,
        minH: 2,
    }
};

export const customDistribution: Module = {
    type: moduleTypes.customDistribution,
    icon: <RiTaskLine color="#ED4C2F" size={24} />,
    title: <Trans i18nKey="ReportsIndex.customDistribution.title" />,
    description: <Trans i18nKey="ReportsIndex.customDistribution.description" />,
    viewComponent: CustomDistributionView,
    configComponent: CustomDistributionConfig,
    layout: {
        minW: 4,
        minH: 4,
    }
};

export const correlativeDistribution: Module = {
    type: moduleTypes.correlativeDistribution,
    icon: <RiTaskLine color="#ED4C2F" size={24} />,
    title: <Trans i18nKey="ReportsIndex.correlativeDistribution.title" />,
    description: <Trans i18nKey="ReportsIndex.correlativeDistribution.description" />,
    viewComponent: CorrelativeDistributionView,
    configComponent: CorrelativeDistributionConfig,
    layout: {
        minW: 4,
        minH: 4,
    }
};

export const statusDistribution: Module = {
    type: moduleTypes.statusDistribution,
    icon: <RiPieChartLine color="048673" size={24} />,
    title: <Trans i18nKey="ReportsIndex.statusDistribution.title" />,
    description: <Trans i18nKey="ReportsIndex.statusDistribution.description" />,
    viewComponent: StatusDistributionView,
    configComponent: StatusDistributionConfig,
    layout: {
        minW: 4,
        minH: 4,
    }
};

export const numericalAverage: Module = {
    type: moduleTypes.numericalAverage,
    icon: <RiLineChartLine color="048673" size={24} />,
    title: <Trans i18nKey="ReportsIndex.numericalAverage.title" />,
    description: <Trans i18nKey="ReportsIndex.numericalAverage.description" />,
    viewComponent: NumericalAverageView,
    configComponent: NumericalAverageConfig,
    layout: {
        minW: 4,
        minH: 4,
    }
};

export const aggregatedCount: Module = {
    type: moduleTypes.aggregatedCount,
    icon: <RiBarChart2Line color="048673" size={24} />,
    title: <Trans i18nKey="ReportsIndex.aggregatedCount.title" />,
    description: <Trans i18nKey="ReportsIndex.aggregatedCount.description" />,
    viewComponent: AggregatedCountView,
    configComponent: AggregatedCountConfig,
    layout: {
        minW: 4,
        minH: 4,
    }
};

// export const image: Module = {
//     type: moduleTypes.image,
//     icon: TBoxLineIcon,
//     title: 'Billede',
//     description: 'Indsæt et vilkårligt billede',
//     grid: { xs: 3},
//     viewComponent: undefined,
//     configComponent: undefined,
//     layout: {
//         minW: 1,
//         minH: 1,
//     }
// }
//
// export const markdown: Module = {
//     type: moduleTypes.markdown,
//     icon: TBoxLineIcon,
//     title: 'Fritekst',
//     description: 'Indsæt en vilkårlig fritekst',
//     grid: {xs: 3},
//     layout: {
//         minW: 1,
//         minH: 1,
//     }
//     // component: MarkdownBox,
// }
//
// export const changePercent: Module = {
//     type: moduleTypes.changePercent,
//     icon: PercentLineIcon,
//     title: 'Forandringsprocent',
//     description: 'Antallet af borgere der har opnået et outcome ud af det totale antal borgere',
//     grid: {xs: 3},
//     layout: {
//         minW: 1,
//         minH: 1,
//     }
//     // component: EffectPercent,
// }
//
// export const changeChart: Module = {
//     type: moduleTypes.changeChart,
//     icon: LineChartLineIcon,
//     title: 'Forandringsgraf',
//     description: 'Antallet af borgere der har opnået et outcome ud af det totale antal borgere',
//     grid: {xs: 3},
//     layout: {
//         minW: 1,
//         minH: 1,
//     }
//     // component: EffectChart,
// }
//
// export const scbr: Module = {
//     type: moduleTypes.scbr,
//     icon: MoneyDollarCircleLineIcon,
//     title: 'SCBR',
//     description: 'Social cost-benifit ratio for perioden',
//     grid: {xs: 3},
//     layout: {
//         minW: 1,
//         minH: 1,
//     }
//     // component: SocialCostBenefitRatio,
// }
//
// export const keyNumbers: Module = {
//     type: moduleTypes.keyNumbers,
//     icon: Number1Icon,
//     title: 'Nøgletalstabel',
//     description: 'Tabel over nøgletal',
//     grid: {xs: 3},
//     layout: {
//         minW: 1,
//         minH: 1,
//     }
//     // component: KeyNumberTable,
// }
//
// export const changeTable: Module = {
//     type: moduleTypes.changeTable,
//     icon: TableLineIcon,
//     title: 'Effekttabel',
//     description: 'Tabel over forventede kontra aktuelle forandringer',
//     grid: {xs: 3},
//     layout: {
//         minW: 1,
//         minH: 1,
//     }
//     // component: EffectTable,
// }
//
// export const impactChart: Module = {
//     type: moduleTypes.impactChart,
//     icon: LineChartLineIcon,
//     title: 'Impactgraf',
//     description: 'Graf over impact per måned',
//     grid: {xs: 3},
//     layout: {
//         minW: 1,
//         minH: 1,
//     }
//     // component: ImpactLineChart,
// }
//
// export const impactMap: Module = {
//     type: moduleTypes.impactMap,
//     icon: TableLineIcon,
//     title: 'Impactkort',
//     description: 'Tabel over impact map værdier',
//     grid: {xs: 3},
//     layout: {
//         minW: 1,
//         minH: 1,
//     }
//     // component: ImpactTable,
// }

const modulesMap = {
    [moduleTypes.statusDistribution]: statusDistribution,
    [moduleTypes.numericalAverage]: numericalAverage,
    [moduleTypes.aggregatedCount]: aggregatedCount,
    [moduleTypes.methodGraph]: methodGraph,
    [moduleTypes.customDistribution]: customDistribution,
    [moduleTypes.correlativeDistribution]: correlativeDistribution,
    [moduleTypes.PictureUpload]: pictureUpload,
    [moduleTypes.freeText]: freeText,

    // [moduleTypes.changeChart]: changeChart,
    // [moduleTypes.changeTable]: changeTable,
    // [moduleTypes.changePercent]: changePercent,
    //
    // [moduleTypes.impactMap]: impactMap,
    // [moduleTypes.impactChart]: impactChart,
    // [moduleTypes.keyNumbers]: keyNumbers,
    // [moduleTypes.scbr]: scbr,
    //
    // [moduleTypes.image]: image,
    // [moduleTypes.markdown]: markdown,
};

export const modules = Object.values(modulesMap);

export default modulesMap;