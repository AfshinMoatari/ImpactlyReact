import React from "react";
import {EmptyButtonView} from "../../../components/containers/EmptyView";
import Routes from "../../../constants/Routes";
import history from "../../../history";
import {useProjectCrudListQuery} from "../../../hooks/useProjectQuery";
import {Grid} from "@material-ui/core";
import {EmptyConditionElements} from "../../../components/containers/EmptyCondition";
import Strategy from "../../../models/Strategy";
import StrategyOverviewCard from "../../../components/cards/StrategyOverviewCard";
import CreateButton from "../../../components/buttons/CreateButton";
import HomeBasePage from "../home/HomeBasePage";
import MindMapIcon from "remixicon-react/MindMapIcon";
import {useTranslation} from "react-i18next";
import {TFunction} from "i18next";
import OrganizationChartIcon from "remixicon-react/OrganizationChartIcon";
import SurveyLineIcon from "remixicon-react/SurveyLineIcon";
import GroupLineIcon from "remixicon-react/GroupLineIcon";
import TimeLineIcon from "remixicon-react/TimeLineIcon";
import FileUserLineIcon from "remixicon-react/FileUserLineIcon";

const secondaryCardText = (s: Strategy, t: TFunction) => {
    const str = []


    str.push({ icon: <SurveyLineIcon />, text: t('StrategiesPage.survey', { count: s.surveys.length })});
    str.push({ icon: <GroupLineIcon />, text: t('StrategiesPage.citizen', { count: s.patients.length })});
    str.push({ icon: <TimeLineIcon />, text: t('StrategiesPage.sendout', { count: s.frequencies.length })});
    str.push({ icon: <FileUserLineIcon />, text: t('StrategiesPage.registration', { count: s.effects.length })});

    return str;
}

export const StrategiesPage = () => {
    const strategiesQuery = useProjectCrudListQuery(service => service.projectStrategies)
    const handleCreateClick = () => history.push(Routes.projectStrategyFlow)
    const handleCardClick = (s: Strategy) => () => history.push(Routes.projectStrategy.replace(":strategyId", s.id))
    const { t } = useTranslation();

    return (
        <HomeBasePage
            actions={strategiesQuery.elements.length > 0 && <CreateButton text={t('StrategiesPage.create')} onClick={handleCreateClick}/>}
        >
            <EmptyConditionElements<Strategy>
                isLoading={strategiesQuery.query.isLoading}
                data={strategiesQuery.elements}
                empty={
                    <EmptyButtonView
                        title={t('StrategiesPage.noStrategies')}
                        icon={MindMapIcon}
                        subTitle={t('StrategiesPage.weHelpYouSetUp')}
                        buttonText={t('StrategiesPage.createStrategy')}
                        onClick={handleCreateClick}
                    />
                }
            >
                {(strategies) =>
                    <Grid container spacing={2}>
                        {strategies.map(strategy => (
                            <Grid item xs={12} sm={6} lg={4}>
                                <StrategyOverviewCard
                                    title={strategy.name}
                                    strategyStats={secondaryCardText(strategy, t)}
                                    onClick={handleCardClick(strategy)}
                                    icon={<OrganizationChartIcon/>}
                                />
                            </Grid>
                        ))}
                    </Grid>
                }
            </EmptyConditionElements>
        </HomeBasePage>
    )
}

export default StrategiesPage;
