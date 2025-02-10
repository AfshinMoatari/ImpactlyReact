import React, { useState } from "react";
import NiceOutliner from "../../../components/containers/NiceOutliner";
import { Box, Chip, Dialog, IconButton, Menu, MenuItem, Typography, useTheme } from "@material-ui/core";
import CommunicationDialog from "./CommunicationDialog";
import { BatchSendoutData, End, Frequency, defaultFrequency } from "../../../models/cron/Frequency";
import { textifyFrequency } from "../../../components/FrequencyChip";
import { useAppServices } from "../../../providers/appServiceProvider";
import { useAuth } from "../../../providers/authProvider";
import { Survey } from "../../../models/Survey";
import { SendoutfrequencyToFrequencyExpression } from "../../../lib/cron";
import snackbarProvider from "../../../providers/snackbarProvider";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import AddLineIcon from "remixicon-react/AddLineIcon";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../LanguageContext";
import moment from 'moment';
import { DialogTitle, DialogContent } from "@material-ui/core";
import { Table, TableBody, TableCell, TablePagination, TableRow } from "@material-ui/core";
import { useProjectCrudListQuery } from "../../../hooks/useProjectQuery";
import { useHistory } from "react-router-dom";
import { Routes } from "../../../routes/Routes";

interface StrategyCommunicationProp {
    strategyId: string;
    frequencies: Frequency[];
    onChange: (frequencies: Frequency[]) => void;
}

interface DeleteFrequencyResponse {
    success: boolean;
    message?: string;
};

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
}

const StrategyCommunication: React.FC<StrategyCommunicationProp> = ({
    strategyId,
    frequencies,
    onChange }) => {
    const [selectedFrequency, setSelectedFrequency] = useState<Frequency | null>(null);
    const { t } = useTranslation();
    const theme = useTheme();
    const [open, setDialogOpen] = useState(false);
    const [activeStep, setActiveStep] = React.useState<number>(0);
    const handleDialogOpen = () => { setDialogOpen(true); setActiveStep(0); handleCloseMenu(); }
    const handleClose = () => { setDialogOpen(false); }
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const [showEditImmidateDialog, setEditImmidateDialogOpen] = useState<boolean>(false);
    const { language } = useLanguage();


    const projectId = useAuth().currentProjectId;
    const strategyService = useAppServices().projectStrategies(projectId);

    const printFrequencyDetail = (frequency: Frequency): JSX.Element => {
        const end = (frequency.end as End);
        if (end.type.toString() === "IMMEDIATE") {
            const date = moment(frequency.createdAt).format('DD/MM/YYYY');
            return (
                <div style={{ textAlign: 'center' }}>
                    <div>{t('StrategyCommunication.sent')}</div>
                    <div>{date}</div>
                </div>
            );
        } else {
            return (
                <div style={{ textAlign: 'center' }}>
                    {textifyFrequency(frequency, t, language)}
                </div>
            );
        }
    };

    const printFrequencySurvays = (surveys: Survey[]): JSX.Element => {
        return (
            <Box
                style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}
            >
                {surveys.map((survey, index) => (
                    <React.Fragment key={survey.id}>
                        <Box style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                            <Chip
                                label={`${index + 1}. ${survey.name}`}
                                color="default"
                                style={{ marginRight: 6 }}
                            />
                            {index < surveys.length - 1 && (
                                <Typography
                                    style={{ marginRight: 6, lineHeight: 1, display: 'flex', alignItems: 'center' }}
                                >
                                    +
                                </Typography>
                            )}
                        </Box>
                    </React.Fragment>
                ))}
            </Box>
        );
    };

    const [batchSendoutData, setBatchSendoutData] = useState<BatchSendoutData>({
        id: '',
        surveys: ([] as Survey[]),
        patientsId: [],
        type: "frequency",
        frequencyFormValues: {
            expression: SendoutfrequencyToFrequencyExpression(defaultFrequency),
            end: defaultFrequency.end,
            id: ""
        }
    });

    const [copyOfBatchSendoutData, makeAcopy] = useState<BatchSendoutData>({
        id: '',
        surveys: ([] as Survey[]),
        patientsId: [],
        type: "frequency",
        frequencyFormValues: {
            expression: SendoutfrequencyToFrequencyExpression(defaultFrequency),
            end: defaultFrequency.end,
            id: ""
        }
    });

    const [editSendout, setEdit] = useState<boolean>(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleClick = (frequency: Frequency) => (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedFrequency(frequency);
        setAnchorEl(e.currentTarget);
    }
    const handleCloseMenu = () => {
        setAnchorEl(null);
    }

    const handleEditClick = () => {
        if (selectedFrequency) {
            if (selectedFrequency.end.type.toString().toUpperCase() === "IMMEDIATE") {
                setEditImmidateDialogOpen(true);
            } else {
                const batchSendoutData: BatchSendoutData = {
                    id: selectedFrequency.id,
                    surveys: selectedFrequency.surveys,
                    patientsId: selectedFrequency.patientsId,
                    type: "frequency",
                    frequencyFormValues: {
                        expression: SendoutfrequencyToFrequencyExpression(selectedFrequency),
                        end: selectedFrequency.end,
                        id: selectedFrequency.id
                    }
                }
                setBatchSendoutData(batchSendoutData);
                makeAcopy(batchSendoutData);
                handleDialogOpen();
                setEdit(true);
            }
        }
        handleCloseMenu();
    }

    const handleCreateClick = () => {
        setBatchSendoutData({
            id: '',
            surveys: ([] as Survey[]),
            patientsId: [],
            type: "frequency",
            frequencyFormValues: {
                expression: SendoutfrequencyToFrequencyExpression(defaultFrequency),
                end: defaultFrequency.end,
                id: ""
            }
        });
        setEdit(false);
        handleDialogOpen();
    }

    const handleDeleteFrequency = async () => {
        if (selectedFrequency) {
            try {
                const res: DeleteFrequencyResponse = await strategyService.deleteFrequency(strategyId, selectedFrequency.id);
                if (!res.success) {
                    console.error(res.message || 'Failed to delete the frequency');
                    return false;
                }
                const index = frequencies.map(f => f.id).indexOf(selectedFrequency.id);
                frequencies.splice(index, 1);
                onChange(frequencies);
                snackbarProvider.success(t("StrategyCommunication.sendoutRemoved"))
                setShowDeleteDialog(false);
                setSelectedFrequency(null);
                return true;
            } catch (error) {
                console.error(error);
                setShowDeleteDialog(false);
                setSelectedFrequency(null);
                return false;
            }
        }

        handleCloseMenu();
    }

    const handleChange = (freq: Frequency) => {
        if (freq.id) {
            const frequencyIndex = frequencies.findIndex(f => f.id === freq.id)
            if (frequencyIndex !== -1) (frequencies[frequencyIndex] = freq as Frequency);
            return onChange(frequencies);
        }
    }

    const [showCitizensListDialog, setCitizensListDialog] = useState<boolean>(false);
    const [citizensPage, setCitizensPage] = useState(0);
    const [citizensRowsPerPage, setCitizensRowsPerPage] = useState(10);

    const handleCitizensPageChange = (_: unknown, newPage: number) => {
        setCitizensPage(newPage);
    };

    const handleCitizensRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCitizensRowsPerPage(parseInt(event.target.value, 10));
        setCitizensPage(0);
    };

    const handleCitizensListClick = () => {
        setCitizensListDialog(true);
        handleCloseMenu();
    }

    const patientIds = selectedFrequency?.patientsId || [];
    const patientsList = useProjectCrudListQuery(services => services.projectPatients);

    const filteredPatients = patientsList.elements?.filter(patient =>
        patientIds.includes(patient.id)
    );

    return (
        <NiceOutliner>
            <Box display='flex' justifyContent='space-between   '>
                <div>
                    <Typography variant="h3" style={{ fontWeight: '500' }}>
                        {t("StrategyCommunication.frequencies")}
                    </Typography>
                    <Typography variant="subtitle2" style={{ paddingBottom: 16 }}>
                        {t("StrategyCommunication.subtitleFrequency")}
                    </Typography>
                </div>
                <div>
                    <IconButton>
                        <AddLineIcon
                            onClick={handleCreateClick}
                        />
                    </IconButton>
                </div>
            </Box>
            <CommunicationDialog
                strategyId={strategyId}
                open={open}
                onClose={handleClose}
                onChange={handleChange}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                strategyService={strategyService}
                onNewValue={onChange}
                edit={editSendout}
                setBatchSendoutData={setBatchSendoutData}
                batchSendoutData={batchSendoutData}
                copyOfBatchSendoutData={copyOfBatchSendoutData}
                frequencies={frequencies}
            />
            {frequencies.map(f => (
                <NiceOutliner
                    key={f.id}
                    innerStyle={{
                        marginBottom: 12,
                        display: "flex",
                        justifyContent: "space-between", // Ensures space between the items
                        alignItems: "center"
                    }}
                >
                    <Box
                        style={{ display: "flex", alignItems: "center" }}
                    >
                        {/* First Box - Frequency Detail */}
                        <Box style={{ marginRight: 20 }}>
                            <span style={{ fontSize: 16 }}>{printFrequencyDetail(f)}</span>
                        </Box>

                        {/* Second Box - Surveys */}
                        <Box style={{ flex: 1 }}>
                            {printFrequencySurvays(f.surveys)}
                        </Box>
                    </Box>

                    {/* Last Box - Icon Button */}
                    <Box style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
                        <IconButton
                            style={{ color: theme.palette.error.dark, width: 45, height: 45, padding: 8 }}
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                            onClick={handleClick(f)}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            keepMounted
                            id="simple-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleCloseMenu}>
                            {selectedFrequency && selectedFrequency.end.type.toString().toUpperCase() === "IMMEDIATE" ? (
                                <MenuItem key="citizensList" onClick={handleCitizensListClick}>
                                    {t("StrategyCommunication.citizens")}
                                </MenuItem>
                            ) : (
                                <MenuItem key="editPatient" onClick={handleEditClick}>
                                    {t("StrategyCommunication.edit")}
                                </MenuItem>
                            )}
                            <MenuItem key="createReg" onClick={() => { handleCloseMenu(); setShowDeleteDialog(true) }}>
                                {t("StrategyCommunication.delete")}
                            </MenuItem>
                        </Menu>
                        <ConfirmDialog
                            title={t("StrategyCommunication.delete")}
                            open={showDeleteDialog}
                            onClose={() => setShowDeleteDialog(false)}
                            onConfirm={() => handleDeleteFrequency()}
                        >
                            {t("StrategyCommunication.confirmDeleteMessage")}
                        </ConfirmDialog>
                        <Dialog
                            title={t("StrategyCommunication.delete")}
                            open={showEditImmidateDialog}
                            onClose={() => setEditImmidateDialogOpen(false)}
                        >
                            {t("StrategyCommunication.sendoutsNonEditable")}
                        </Dialog>
                    </Box>
                </NiceOutliner>
            ))}
            <Dialog
                open={showCitizensListDialog}
                onClose={() => setCitizensListDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>{t("StrategyCommunication.citizensListTitle")}</DialogTitle>
                <DialogContent>
                    {selectedFrequency && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '60vh',
                                gap: 2
                            }}
                        >
                            <Box
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box sx={{ flex: 1, overflow: 'auto' }}>
                                    <Table>
                                        <TableBody>
                                            {patientsList.query.isLoading ? (
                                                <TableRow>
                                                    <TableCell>
                                                        {t("common.loading")}
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredPatients
                                                ?.slice(
                                                    citizensPage * citizensRowsPerPage,
                                                    citizensPage * citizensRowsPerPage + citizensRowsPerPage
                                                )
                                                .map((patient) => (
                                                    <TableRow key={patient.id}>
                                                        <TableCell>
                                                            {patient.name}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                                <TablePagination
                                    component="div"
                                    rowsPerPageOptions={[10, 25, 50]}
                                    count={filteredPatients?.length || 0}
                                    rowsPerPage={citizensRowsPerPage}
                                    page={citizensPage}
                                    onPageChange={handleCitizensPageChange}
                                    onRowsPerPageChange={handleCitizensRowsPerPageChange}
                                    labelDisplayedRows={({ from, to, count }) =>
                                        `${from}-${to} ${t("Common.Tabel.of")} ${count}`}
                                    labelRowsPerPage={t("Common.Tabel.rowsPerPage")}
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </NiceOutliner>
    )
}

export default StrategyCommunication;