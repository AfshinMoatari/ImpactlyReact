import BasePageToolbar from "../../../../components/containers/BasePageToolbar";
import BaseTable from "../../../../components/tables/BaseTable";
import React, { useState } from "react";
import Registration, { registrationSearchFilter } from "../../../../models/Registration";
import HeadItem from "../../../../components/tables/HeadItem";
import ProjectPatient from "../../../../models/ProjectPatient";
import Strategy from "../../../../models/Strategy";
import NiceOutliner from "../../../../components/containers/NiceOutliner";
import { CreateButton } from "../../../../components/buttons/CreateButton";
import { useQuery } from "react-query";
import { useQueryClient } from "react-query";
import { useAppServices } from "../../../../providers/appServiceProvider";
import RegistrationsContainer from "./RegistrationsContainer";
import RegisterDialog from "./RegisterDialog";
import BaseTableCell from "../../../../components/tables/BaseTableCell";
import DeleteButton from "../../../../components/buttons/DeleteButton";
import EditButton from "../../../../components/buttons/EditButton";
import { useTranslation } from "react-i18next";
import { TableCell } from "@material-ui/core";


interface PatientRegistrationsProps {
    patient: Required<ProjectPatient>;
    strategy: Strategy;
}

interface DeleteRegistrationResponse {
    success: boolean;
    message?: string;
};

const PatientRegistrations: React.FC<PatientRegistrationsProps> = ({ patient, strategy }) => {
    const [search, setSearch] = useState<string>('');
    const [registration, setRegistration] = useState<Partial<Registration>>();
    const queryClient = useQueryClient();
    const patientsService = useAppServices().projectPatients(patient.parentId);
    const { t } = useTranslation();

    const query = useQuery<Registration[]>({
        queryKey: `${patient.id}/registrations`,
        queryFn: async () => {
            const res = await patientsService.getRegistrations(patient.id);
            if (!res.success) return []
            return res.value;
        },
        staleTime: Infinity,
        cacheTime: Infinity
    });

    const dataIn = query.data ?? [];
    const filteredRegistrations: Registration[] = dataIn.filter(registrationSearchFilter(search)) ?? [];
    const [open, setOpen] = useState(false);
    const handleClose = () => {
        setOpen(false);
        setRegistration(undefined);
    };

    const heads: HeadItem<Registration>[] = [
        { id: "date", label: t("CitizenPage.date"), render: e => new Date(e.date).toLocaleDateString() },
        {
            id: "effectName", label: t("CitizenPage.registration"), render: e => {
                if (e?.type === "status" && (e.now !== undefined || e.now !== null)) return `${e?.now?.category ?? ""}: ${e.before ? (e.before.name + " -> ") : ""}${e?.now?.name ?? ""}`;
                if (e?.type === "numeric") return `${e.effectName}: ${e.value}`;
                return e.effectName;
            }
        },
        { id: "note", label: t("CitizenPage.note") }
    ]

    const handleDeleteRegistration = async (reg: Registration) => {
        try {
            const res: DeleteRegistrationResponse = await patientsService.deleteRegistration(patient.id, reg.id);
            if (!res.success) {
                console.error(res.message || 'Failed to delete registration');
                return false;
            }

            await queryClient.invalidateQueries(`${patient.id}/registrations`);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleEditRegistration = (reg: Registration) => {
        setOpen(true);
        setRegistration(reg);
    };

    return (
        <NiceOutliner>
            <RegistrationsContainer
                strategy={strategy}
                registrations={filteredRegistrations}
            />
            <BasePageToolbar
                search={search}
                onSearch={setSearch}
                actionEnd={
                    <CreateButton text={t("CitizenPage.register")} onClick={() => setOpen(true)} />
                }
            />
            <div style={{ width: "100%", flex: 1, paddingTop: 16 }}>
                <BaseTable<Registration>
                    heads={heads}
                    elements={filteredRegistrations}
                    initialOrderKey="date"
                    initialOrder="desc"
                    endActions={<TableCell style={{ background: 'none', display: 'none' }} />}
                    endCell={(reg) => (
                        <BaseTableCell align="right" style={{ padding: 10, whiteSpace: "nowrap", paddingRight: 0 }}>
                            <EditButton
                                onClick={() => handleEditRegistration(reg)}
                                title={t("CitizenPage.editRegistration")}
                            />
                            <DeleteButton
                                onConfirm={() => handleDeleteRegistration(reg)}
                                message={t("CitizenPage.areYouSureDelete")}
                                title={t("CitizenPage.deleteRegistration")}
                            />
                        </BaseTableCell>
                    )}
                />
            </div>
            <RegisterDialog
                patient={patient}
                strategy={strategy}
                registrations={dataIn}
                currentReg={registration}
                onClose={handleClose}
                open={open}
            />
        </NiceOutliner>
    )
}

export default PatientRegistrations;
