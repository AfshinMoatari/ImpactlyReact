import React, { ChangeEvent, useState } from "react";
import { Grid, Box, Avatar, IconButton, Tooltip, DialogActions, DialogContent, Dialog, DialogTitle, TextField, Button } from "@material-ui/core";
import DirectionalButton from "../../../../components/buttons/NextButton";
import { BatchSendoutRegistration, PatientRegistrationDataGrid } from "../../../../models/Registration";
import { DataGrid, GridColDef, GridRenderCellParams, GridTreeNodeWithRender, useGridApiRef } from "@mui/x-data-grid";
import { PStatusRegistration, ProjectRegistration } from "../../../../models/Strategy";
import toInitials from "../../../../lib/string/toInitials";
import theme from "../../../../constants/theme";
import SelectDropDown from "../../../../components/inputs/SelectDropDown";
import { KeyboardDatePicker } from "@material-ui/pickers";
import Message2LineIcon from "remixicon-react/Message2LineIcon";
import { Formik, Form, Field } from "formik";
import { useTranslation } from "react-i18next";
import ValueSelector from "../../../../components/inputs/ValueSelector";
import CloseIcon from '@mui/icons-material/Close';

interface StrategyRegisterationSendoutUpdateProps {
    batchRegistrationData: BatchSendoutRegistration;
    setBatchRegistrationData: (data: any) => void;
    activeStep: number;
    setActiveState: (data: number) => void;
    effects: ProjectRegistration[];
    toggleConfirmationDialog: (data: boolean) => void;
}

const StrategyRegisterationSendoutUpdateView: React.FC<StrategyRegisterationSendoutUpdateProps> = ({
    setActiveState,
    batchRegistrationData,
    setBatchRegistrationData,
    activeStep,
    effects,
    toggleConfirmationDialog
}) => {
    const [showNoteDialog, setNoteDialogOpen] = useState<boolean>(false);
    const { t } = useTranslation();
    const options: { [key: string]: string } = {}
    if (effects && effects.length > 0) {
        effects.map(e => {
            options[e.id] = e.name
        });
    }
    const cols = ([] as GridColDef[])
    const rows = batchRegistrationData.patientRegistrationDataGrid;
    const apiRef = useGridApiRef();

    interface NoteFormValues {
        id: string;
        note: string;
    }

    const handleEffectChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown; }>, p: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
        const id = event.target.value as string;
        const patient = p.row as PatientRegistrationDataGrid;
        if (id != '') {
            const selectedEffect = effects.find(e => e.id == id);
            patient.effectId = selectedEffect?.id as string;
            patient.effectName = selectedEffect?.name as string;
            patient.now = selectedEffect as PStatusRegistration;

            batchRegistrationData.patientRegistrationDataGrid.filter(p => p.patientId == patient.patientId)[0].effectId = selectedEffect?.id as string;
            batchRegistrationData.patientRegistrationDataGrid.filter(p => p.patientId == patient.patientId)[0].effectName = selectedEffect?.name as string;
            batchRegistrationData.patientRegistrationDataGrid.filter(p => p.patientId == patient.patientId)[0].now = selectedEffect as PStatusRegistration;
            apiRef.current.updateRows([batchRegistrationData.patientRegistrationDataGrid.filter(p => p.patientId == patient.patientId)[0]]);
            setBatchRegistrationData({
                ...batchRegistrationData,
                patientRegistrationDataGrid: batchRegistrationData.patientRegistrationDataGrid
            });
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const handleDateChange = (d: Date | null, p: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
        const patient = p.row as PatientRegistrationDataGrid;
        if (d != null) {
            patient.date = d;
            batchRegistrationData.patientRegistrationDataGrid.filter(p => p.patientId == patient.patientId)[0].date = d;
            apiRef.current.updateRows([batchRegistrationData.patientRegistrationDataGrid.filter(p => p.patientId == patient.patientId)[0]]);
            setBatchRegistrationData({
                ...batchRegistrationData,
                patientRegistrationDataGrid: batchRegistrationData.patientRegistrationDataGrid
            });
        }
    };

    const handleNoteChange = (n: string, noteFormValues: NoteFormValues) => {
        const patient = apiRef.current.getRow(noteFormValues.id) as PatientRegistrationDataGrid;
        if (n != null && n != '') {
            patient.note = n;
            batchRegistrationData.patientRegistrationDataGrid.filter(p => p.patientId == patient.patientId)[0].note = n;
            apiRef.current.updateRows([batchRegistrationData.patientRegistrationDataGrid.filter(p => p.patientId == patient.patientId)[0]]);
            setBatchRegistrationData({
                ...batchRegistrationData,
                patientRegistrationDataGrid: batchRegistrationData.patientRegistrationDataGrid
            });
        }
        setNoteDialogOpen(false)
    };
    const [isValid, setIsValid] = useState<boolean>(!(batchRegistrationData.patientRegistrationDataGrid.filter(p => Number.isNaN(p.value)).length > 0));
    const handleValueChange = (n: number | null, p: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
        if (n != null) {
            const patient = p.row as PatientRegistrationDataGrid;
            patient.value = n;
            batchRegistrationData.patientRegistrationDataGrid.filter(p => p.patientId == patient.patientId)[0].value = n;
            apiRef.current.updateRows([batchRegistrationData.patientRegistrationDataGrid.filter(p => p.patientId == patient.patientId)[0]]);
            setBatchRegistrationData({
                ...batchRegistrationData,
                patientRegistrationDataGrid: batchRegistrationData.patientRegistrationDataGrid
            });
        }
        if (n === null || Number.isNaN(n) || batchRegistrationData.patientRegistrationDataGrid.filter(p => Number.isNaN(p.value)).length > 0) {
            setIsValid(false)
        } else {
            setIsValid(true)
        }
    };

    const renderEffectSelector: GridColDef["renderCell"] = (p) => {
        return <SelectDropDown
            defaultValue={(p.row as PatientRegistrationDataGrid).effectId}
            options={options}
            label={t("CommunicationFlowPage.StrategyRegSendoutUpdateView.registrationValue")}
            onChange={(e) => handleEffectChange(e, p)}
            disabled={false}
        />;
    };

    const renderDateSelector: GridColDef["renderCell"] = (p) => {
        return <KeyboardDatePicker
            variant="inline"
            inputVariant="filled"
            margin="none"
            fullWidth={true}
            label={t("CommunicationFlowPage.StrategyRegSendoutUpdateView.registrationDate")}
            format="dd/MM/yyyy"
            value={(p.row as PatientRegistrationDataGrid).date}
            onChange={(d) => handleDateChange(d, p)}
            KeyboardButtonProps={{
                'aria-label': 'ændre dato',
            }}
            style={{ margin: 0, marginTop: 6 }}
        />;
    };

    const [selectedPatientNote, setselectedPatientNote] = useState<NoteFormValues>(
        {
            id: '',
            note: ''
        }
    );

    const renderNoteSelector: GridColDef["renderCell"] = (p) => {
        return <>
            <Tooltip title={(p.row as PatientRegistrationDataGrid).note ? (p.row as PatientRegistrationDataGrid).note : ""} style={{ display: 'flex', margin: '0 auto' }}>
                <IconButton
                    color={(p.row as PatientRegistrationDataGrid).note ? "secondary" : "default"}
                    size="medium"
                    onClick={() => {
                        setselectedPatientNote({
                            id: (p.row as PatientRegistrationDataGrid).patientId as string,
                            note: (p.row as PatientRegistrationDataGrid).note as string
                        } as NoteFormValues);
                        setNoteDialogOpen(true);
                    }}
                >
                    <Message2LineIcon />
                </IconButton>
            </Tooltip>
        </>
    };


    const renderValueSelector: GridColDef["renderCell"] = (p) => {
        return <Formik<{ value: number }>
            onSubmit={() => { }}
            initialValues={{ value: (p.row as PatientRegistrationDataGrid).value }}
        >
            <Form style={{ margin: '0 auto' }}>
                {/* <TextField
                    style={{width: '70px'}}
                    InputProps={{ inputProps: { min: 0 } }}
                    name={t("CommunicationFlowPage.StrategyRegSendoutUpdateView.value")}
                    type={'number'}
                    variant="outlined"
                    error={!isValid}
                    defaultValue={(p.row as PatientRegistrationDataGrid).value}
                    onChange={(e) => {
                        handleValueChange((e.target as HTMLInputElement).valueAsNumber, p);
                    }
                    }
                /> */}
                <ValueSelector
                    p={p}
                    isValid={isValid}
                    handleValueChange={handleValueChange}
                />
            </Form>
        </Formik>
    };

    if (effects[0]?.type === "count") {
        cols.push(
            {
                field: 'patientName',
                headerName: t("CommunicationFlowPage.StrategyRegSendoutUpdateView.name"),
                width: 250,
                editable: false,
                renderCell: (params) => {
                    return <><Avatar style={{
                        width: 35,
                        height: 35,
                        marginRight: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        color: theme.custom.avatarTextColor,
                        backgroundColor: theme.custom.palePrimary,
                    }}>{toInitials(params.value)}</Avatar><Box>{params.value}</Box></>;
                }
            },
            {
                field: 'date',
                headerName: t("CommunicationFlowPage.StrategyRegSendoutUpdateView.registeredDate"),
                width: 200,
                editable: false,
                renderCell: renderDateSelector
            },
            {
                field: 'note',
                headerName: 'Note',
                headerAlign: 'center',
                width: 200,
                editable: false,
                renderCell: renderNoteSelector,
            });
    } else if (effects[0]?.type === "numeric") {
        cols.push(
            {
                field: 'patientName',
                headerName: t("CommunicationFlowPage.StrategyRegSendoutUpdateView.name"),
                width: 150,
                editable: false,
                renderCell: (params) => {
                    return <><Avatar style={{
                        width: 35,
                        height: 35,
                        marginRight: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        color: theme.custom.avatarTextColor,
                        backgroundColor: theme.custom.palePrimary,
                    }}>{toInitials(params.value)}</Avatar><Box>{params.value}</Box></>;
                }
            },
            {
                field: 'value',
                headerName: t("CommunicationFlowPage.StrategyRegSendoutUpdateView.value"),
                width: 150,
                editable: false,
                headerAlign: 'center',
                renderCell: renderValueSelector
            },
            {
                field: 'date',
                headerName: t("CommunicationFlowPage.StrategyRegSendoutUpdateView.registeredDate"),
                width: 200,
                editable: false,
                renderCell: renderDateSelector
            },
            {
                field: 'note',
                headerName: t("CommunicationFlowPage.StrategyRegSendoutUpdateView.note"),
                headerAlign: 'center',
                width: 200,
                hideSortIcons: true,
                editable: false,
                renderCell: renderNoteSelector,
            });
    } else {
        cols.push(
            {
                field: 'patientName',
                headerName: t("CommunicationFlowPage.StrategyRegSendoutUpdateView.name"),
                width: 150,
                editable: false,
                renderCell: (params) => {
                    return <><Avatar style={{
                        width: 35,
                        height: 35,
                        marginRight: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        color: theme.custom.avatarTextColor,
                        backgroundColor: theme.custom.palePrimary,
                    }}>{toInitials(params.value)}</Avatar><Box>{params.value}</Box></>;
                }
            },
            {
                field: 'effectName',
                headerName: t("CommunicationFlowPage.StrategyRegSendoutUpdateView.status"),
                width: 200,
                renderCell: renderEffectSelector,
                editable: false,
                type: "string"
            },
            {
                field: 'date',
                headerName: t("CommunicationFlowPage.StrategyRegSendoutUpdateView.registeredDate"),
                width: 200,
                editable: false,
                renderCell: renderDateSelector
            },
            {
                field: 'note',
                headerName: t("CommunicationFlowPage.StrategyRegSendoutUpdateView.note"),
                headerAlign: 'center',
                width: 200,
                editable: false,
                renderCell: renderNoteSelector,
            });
    }

    const handlePrev = async () => {
        setActiveState(activeStep -= 1);
    };

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            xs={12}
            style={{ gap: 15 }}>
            <Grid item xs={12}>
                <Box style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '500px',
                    width: effects[0]?.type === "count" ? '650px' : effects[0]?.type === "numeric" ? '700px' : '750px'
                }}>
                    <DataGrid
                        getRowId={(row) => row.patientId}
                        rows={rows}
                        columns={cols}
                        pagination={undefined}
                        disableColumnFilter
                        disableColumnMenu
                        disableColumnSelector
                        disableVirtualization
                        disableDensitySelector
                        disableRowSelectionOnClick
                        hideFooter
                        rowHeight={80}
                        style={{ border: 'none' }}
                        apiRef={apiRef}
                        sx={{
                            '.MuiDataGrid-iconButtonContainer, .MuiDataGrid-columnSeparator': {
                                visibility: 'hidden !important'
                            },
                            '.MuiDataGrid-columnHeader:hover .MuiDataGrid-iconButtonContainer': {
                                display: 'none'
                            },
                            '.MuiDataGrid-columnHeaders': {
                                backgroundColor: '#0a08121f !important',
                                borderRadius: '0px !important'
                            },
                            '.MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus-within, .MuiDataGrid-cell:focus-within': {
                                outline: 'none'
                            }
                        }}
                    />
                </Box>
            </Grid>

            <Grid item xs={12}>
                <Box style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>

                    <Box style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'left',
                        alignSelf: 'center',
                        color: theme.palette.primary.main,
                    }}> {!isValid && effects[0]?.type === "numeric" && <>{t("CommunicationFlowPage.StrategyRegSendoutUpdateView.missingValue")}</>}
                    </Box>

                    <Box style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'right'
                    }}>
                        <Box>
                            <DirectionalButton
                                onClick={handlePrev}
                                text={t("CommunicationFlowPage.StrategyRegSendoutUpdateView.back")}
                                variant="outlined"
                            ></DirectionalButton>
                        </Box>
                        <Box style={{
                            marginLeft: 10,
                        }}>
                            <DirectionalButton
                                onClick={() => toggleConfirmationDialog(true)}
                                disabled={!isValid}
                                text={t("CommunicationFlowPage.StrategyRegSendoutUpdateView.next")}
                                aria-label="submit"
                                variant="contained"
                            >
                            </DirectionalButton>
                        </Box>
                    </Box>
                </Box>

                <Formik<NoteFormValues>
                    onSubmit={() => { }}
                    initialValues={selectedPatientNote}
                    enableReinitialize={true}
                >
                    {(formik) => (
                        <Form>
                            <Dialog
                                open={showNoteDialog}
                                onClose={() => {
                                    formik.resetForm();
                                    setNoteDialogOpen(false);
                                    setselectedPatientNote({
                                        id: '',
                                        note: ''
                                    } as NoteFormValues);
                                }}
                            >
                                <IconButton
                                    aria-label="close"
                                    onClick={() => {
                                        formik.resetForm();
                                        setNoteDialogOpen(false);
                                        setselectedPatientNote({
                                            id: '',
                                            note: ''
                                        } as NoteFormValues);
                                    }}
                                    size="small"
                                    style={{
                                        position: 'absolute',
                                        right: 8,
                                        top: 8
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                                <DialogTitle>
                                    {t("CommunicationFlowPage.StrategyRegSendoutUpdateView.addNote")}
                                </DialogTitle>
                                <DialogContent style={{ width: '400px' }}>
                                    <Field
                                        name="note"
                                        type={'note'}
                                        as={TextField}
                                        label={t("CommunicationFlowPage.StrategyRegSendoutUpdateView.note")}
                                        multiline
                                        rows={8}
                                        fullWidth
                                        variant="outlined"
                                        value={formik.values.note}
                                    />
                                </DialogContent>
                                <DialogActions
                                    style={{
                                        background: Boolean(formik?.isValid) ? '#FDF7EC' : '',
                                        marginTop: 8,
                                        padding: '4px 8px'
                                    }}>

                                    <Button
                                        size="large"
                                        onClick={() => {
                                            setNoteDialogOpen(false);
                                            setselectedPatientNote(
                                                {
                                                    id: '',
                                                    note: ''
                                                } as NoteFormValues
                                            );
                                            formik.resetForm()
                                        }}
                                        style={{ fontWeight: 600, color: '#5f6368' }}
                                    >
                                        {t("CommunicationFlowPage.StrategyRegSendoutUpdateView.cancelNote")}
                                    </Button>
                                    <Button
                                        size="large"
                                        type='submit'
                                        aria-label="submit"
                                        onClick={() => {
                                            handleNoteChange(formik.values.note, selectedPatientNote as NoteFormValues)
                                            formik.resetForm()
                                        }}
                                        color={"primary"}
                                        style={{ fontWeight: 600 }}
                                    >
                                        {t("CommunicationFlowPage.StrategyRegSendoutUpdateView.execute")}
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Form>
                    )}
                </Formik>
            </Grid>
        </Grid>
    )
}

export default StrategyRegisterationSendoutUpdateView;
