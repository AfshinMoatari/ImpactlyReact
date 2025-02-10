import {EmptyView} from "../../../components/containers/EmptyView";
import {MenuItem, Select} from "@material-ui/core";
import ActionButton from "../../../components/buttons/ActionButton";
import AddCircleLineIcon from "remixicon-react/AddCircleLineIcon";
import React, {ChangeEvent, useState} from "react";
import {useProjectCrudListQuery} from "../../../hooks/useProjectQuery";
import ProjectPatient from "../../../models/ProjectPatient";
import {useAppServices} from "../../../providers/appServiceProvider";
import {useAuth} from "../../../providers/authProvider";
import snackbarProvider from "../../../providers/snackbarProvider";
import MindMapIcon from "remixicon-react/MindMapIcon";
import {useTranslation} from "react-i18next";

interface NoGroupPatientViewProps {
    patient: ProjectPatient;
    onChange: VoidFunction;
}

const NoStrategyPatientView: React.FC<NoGroupPatientViewProps> = ({patient, onChange}) => {
    const strategiesQuery = useProjectCrudListQuery(services => services.projectStrategies);
    const patients = useProjectCrudListQuery(services => services.projectPatients);

    const [selectedStrategy, setSelectedStrategy] = useState(strategiesQuery.elements.length > 0 ? strategiesQuery.elements[0] : undefined)

    const services = useAppServices();
    const projectId = useAuth().currentProjectId;
    const {t} = useTranslation();

    const handleSelect = (e: ChangeEvent<{ value: unknown }>) => {
        const strategy = strategiesQuery.elements.find(g => g.id === e.target.value as string);
        if (strategy) setSelectedStrategy(strategy);
    }

    const handleAssignToGroup = async () => {
        if (!selectedStrategy) return;

        const res = await services.projectPatients(projectId).assignStrategy(patient.id, selectedStrategy.id)
        if (!res.success) {
            return snackbarProvider.showFeedback(res.feedback) // ERROR
        }
        await patients.invalidate()
        onChange();
    }

    return (
        <EmptyView title={t("CitizenPage.noStrategy")} icon={MindMapIcon} subTitle={t("CitizenPage.chooseStrategy")}>
            <div style={{display: "flex", justifyContent: "center", height: 45}}>
                <Select
                    value={selectedStrategy?.id}
                    onChange={handleSelect}
                    variant="outlined"
                    style={{marginRight: 8}}
                >
                    {strategiesQuery.elements.map(s => (
                        <MenuItem value={s.id}>{s.name}</MenuItem>
                    ))}
                </Select>

                <ActionButton
                    disabled={!Boolean(selectedStrategy)}
                    onClick={handleAssignToGroup}
                    style={{
                        height: 45,
                        marginRight: 15,
                    }}
                >
                    {t("CitizenPage.addStrategyButton")}
                    <AddCircleLineIcon style={{marginLeft: 5}}/>
                </ActionButton>
            </div>
        </EmptyView>
    )
}

export default NoStrategyPatientView;
