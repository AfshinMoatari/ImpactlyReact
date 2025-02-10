import React from "react";
import {Survey} from "../../../../models/Survey";
import SelectTable from "../../../../components/tables/SelectTable";
import HeadItem from "../../../../components/tables/HeadItem";
import Chip from "@material-ui/core/Chip";
import useStrategyContext from "./DataFlowProvider";
import BaseTableCell from "../../../../components/tables/BaseTableCell";
import {EmptyCondition} from "../../../../components/containers/EmptyCondition";
import useSurveys from "../../../../hooks/useSurveys";
import {useTranslation} from "react-i18next";


const SurveyView: React.FC = () => {
    const {state, onChange} = useStrategyContext();
    const [surveys, loading] = useSurveys();
    const {t} = useTranslation();

    const selected = state.surveys.map(s => s.id);
    const setSelected = (ids: string[]) => {
        const selectedSurveys = ids.map(id => surveys.find(s => s.id === id)) as Survey[];
        onChange({
            ...state,
            surveys: selectedSurveys,
        })
    }

    const heads: HeadItem<Survey>[] = [
        {id: "name", label: t("StrategyFlowPage.nameLabel"), render: s => !s.validated ? s.longName : `${s.name}: ${s.longName}`},
        {id: "validated", label: "", render: s => !s.validated ? null : <Chip label={t("StrategyFlowPage.validated")} color="secondary"/>}
    ];

    return (
        <EmptyCondition
            isLoading={loading}>
            <SelectTable<Survey>
                heads={heads}
                elements={surveys}
                selected={selected}
                setSelected={setSelected}
                endCell={() =>
                    <BaseTableCell>
                        {/*<Tooltip title="Forhåndsvisning">*/}
                        {/*    <ColoredIconButton*/}
                        {/*        onClick={() => console.log()}*/}
                        {/*        flat={true}*/}
                        {/*        inverse={true}*/}
                        {/*        style={{width: 35, height: 35, padding: 8}}*/}
                        {/*    >*/}
                        {/*        <EyeLineIcon/>*/}
                        {/*    </ColoredIconButton>*/}
                        {/*</Tooltip>*/}
                    </BaseTableCell>
                }
            />
        </EmptyCondition>
    )
}

export default SurveyView;
