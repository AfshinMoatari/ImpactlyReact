import React, { useState } from "react";
import NiceOutliner from "../../../components/containers/NiceOutliner";
import { Box, IconButton, Typography, TablePagination } from "@material-ui/core";
import AvatarName from "../../../components/AvatarName";
import AddPatientsDialog from "./AddPatientsDialog";
import Strategy from "../../../models/Strategy";
import history from "../../../history";
import Routes from "../../../constants/Routes";
import { useQueryClient } from "react-query";
import BaseTable from "../../../components/tables/BaseTable";
import ProjectUser from "../../../models/ProjectUser";
import HeadItem from "../../../components/tables/HeadItem";
import BaseTableCell from "../../../components/tables/BaseTableCell";
import AddLineIcon from "remixicon-react/AddLineIcon";
import { useTranslation } from "react-i18next";

interface StrategyPatientsProps {
    strategy: Strategy;
}


const StrategyPatients: React.FC<StrategyPatientsProps> = ({ strategy }) => {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = async () => {
        setOpen(false);
        await queryClient.invalidateQueries()
    }
    const { t } = useTranslation();

    const heads: HeadItem<ProjectUser>[] = [
        {
            id: "name",
            numeric: false,
            disablePadding: false,
            label: t("StrategyPatients.name"),
            render: AvatarName,
        }
    ];

    const handlePatientClick = (e: React.MouseEvent<HTMLTableRowElement>, rowId: string) => {
        history.push(Routes.projectPatient.replace(":projectPatientId", rowId));
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedPatients = strategy.patients.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <NiceOutliner style={{ paddingTop: 16 }}>
            <Box display='flex' justifyContent='space-between'>
                <div>
                    <Typography variant="h3" style={{ fontWeight: '500' }}>{t("StrategyPatients.title")}</Typography>
                    <Typography variant="subtitle2" style={{ paddingBottom: 16 }}>
                        {strategy.patients.length === 0 ?
                            t("StrategyPatients.noPatientsSubtitle") :
                            t("StrategyPatients.hasPatientsSubtitle")}
                    </Typography>
                </div>
                <div>
                    <IconButton>
                        <AddLineIcon
                            onClick={handleOpen}
                        />
                    </IconButton>
                </div>
            </Box>
            <Box style={{
                height: 'auto',
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <BaseTable<ProjectUser>
                    heads={heads}
                    elements={paginatedPatients}
                    onClick={handlePatientClick}
                    endCell={() => (<BaseTableCell align="right" padding="normal" />)}
                />
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={strategy.patients.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    style={{ marginTop: 8 }}
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} ${t("common.Tabel.of")} ${count}`}
                    labelRowsPerPage={t("Common.Tabel.rowsPerPage")}
                />
            </Box>

            <AddPatientsDialog
                strategy={strategy}
                open={open}
                onClose={handleClose}
            />
        </NiceOutliner>
    )
}

export default StrategyPatients;
