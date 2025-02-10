import React from "react";
import SelectTable from "../../../../components/tables/SelectTable";
import HeadItem from "../../../../components/tables/HeadItem";
import useStrategyContext from "./DataFlowProvider";
import BaseTableCell from "../../../../components/tables/BaseTableCell";
import { EmptyCondition } from "../../../../components/containers/EmptyCondition";
import ProjectPatient from "../../../../models/ProjectPatient";
import { useTranslation } from "react-i18next";
import { useProjectCrudListQuery } from "../../../../hooks/useProjectQuery";

const SurveyView: React.FC = () => {
    const { state, onChange } = useStrategyContext();

    // Fetching patients
    const patientsQuery1 = useProjectCrudListQuery(services => services.projectPatients);
    const patients1 = patientsQuery1.elements as ProjectPatient[];
    const loading = patientsQuery1.query.isLoading;

    const { t } = useTranslation();

    const heads: HeadItem<ProjectPatient>[] = [
        { id: "name", label: t("StrategyFlowPage.nameLabel") }
    ];

    const selected = state.patients.map(s => s.id);
    const setSelected = (ids: string[]) => {
        const selectedPatients = ids.map(id => patients1.find(s => s.id === id)) as ProjectPatient[];
        onChange({
            ...state,
            patients: selectedPatients,
        });
    }

    return (
        <EmptyCondition isLoading={loading}>
            <SelectTable<ProjectPatient>
                heads={heads}
                elements={Array.isArray(patients1) ? patients1.filter(p => p.strategyId === null && p.isActive === true) : []}
                selected={selected}
                setSelected={setSelected}
                endCell={() =>
                    <BaseTableCell>
                    </BaseTableCell>
                }
            />
        </EmptyCondition>
    );
}

export default SurveyView;
