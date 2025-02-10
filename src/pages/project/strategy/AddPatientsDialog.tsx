import React from "react";
import {useProjectCrudListQuery, useProjectCrudQuery} from "../../../hooks/useProjectQuery";
import CreateDialog from "../../../components/dialogs/CreateDialog";
import Strategy from "../../../models/Strategy";
import SelectTable from "../../../components/tables/SelectTable";
import ProjectPatient from "../../../models/ProjectPatient";
import {FormikHelpers} from "formik/dist/types";
import snackbarProvider from "../../../providers/snackbarProvider";
import {useAppServices} from "../../../providers/appServiceProvider";
import {useAuth} from "../../../providers/authProvider";
import {CircularProgress, Typography} from "@material-ui/core";
import {patientTableHeads} from "../patients/PatientTableHeads";
import BaseTableCell from "../../../components/tables/BaseTableCell";
import LoadingOverlay from "../../../components/feedback/LoadingOverlay";
import {useTranslation} from "react-i18next";

interface AddPatientsDialogProps {
    strategy: Strategy;
    open: boolean;
    onClose: VoidFunction;
}

const AddPatientsDialog: React.FC<AddPatientsDialogProps> = ({strategy, open, onClose}) => {
    const patientsQuery = useProjectCrudListQuery(services => services.projectPatients);
    const strategyQuery = useProjectCrudQuery(strategy.id, service => service.projectStrategies);
    const services = useAppServices();
    const projectId = useAuth().currentProjectId;
    const { t } = useTranslation();

    const handleSubmit = async (patients: ProjectPatient[], helpers: FormikHelpers<ProjectPatient[]>) => {
        if (patients.length === 0 || !strategy) return onClose();

        let success = 0;
        let errors = 0;
        await Promise.all(patients.map(async p => {
            const res = await services.projectPatients(projectId).assignStrategy(p.id, strategy.id);
            if (!res.success) return errors += 1;
            return success += 1
        }));

        if (errors === 0 && success > 0) snackbarProvider.success(t("StrategyPatients.AddPatientsDialog.successSnackbar"));
        else if (errors > 0 && success > 0) snackbarProvider.warning(t("StrategyPatients.AddPatientsDialog.warningSnackbar", {
            error: errors,
            count: patients.length
        }));
        else snackbarProvider.error(t("StrategyPatients.AddPatientsDialog.errorSnackbar"));

        onClose();
        helpers.resetForm();
        await patientsQuery.invalidate();
        await strategyQuery.invalidate();
    }

    const heads = [...patientTableHeads]
    heads.splice(5, 1)

    if (patientsQuery.query.isLoading) return null;

    const patientsWithoutStrategy = patientsQuery.elements.filter(p => p.strategyId === null);

    return (
        <CreateDialog<ProjectPatient[]>
            open={open}
            onClose={onClose}
            initialValues={[]}
            onSubmit={handleSubmit}
            title={t("StrategyPatients.AddPatientsDialog.addCitizens") + strategy.name}
            maxWidth="md"
        >
            {({values, setValues}) => (
                <div>
                    <Typography variant="subtitle2">{t("StrategyPatients.AddPatientsDialog.addCitizensSubtitle")}</Typography>
                    {patientsWithoutStrategy.length > 0 ? (
                        <SelectTable
                            heads={heads}
                            elements={patientsWithoutStrategy}
                            endCell={ () => <BaseTableCell/>}
                            selected={values.map(p => p.id)}
                            setSelected={(ids: string[]) => setValues(patientsWithoutStrategy.filter(p => ids.includes(p.id)))}
                        />
                    ) : (
                        <div style={{padding: "32px 0"}}>
                            <Typography variant="h3" align="center">
                                {t("StrategyPatients.AddPatientsDialog.noCitizensAvailable")}
                            </Typography>
                        </div>
                    )}

                </div>
            )}
        </CreateDialog>
    )
}

export default AddPatientsDialog;
