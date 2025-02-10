import React, { useEffect, useState } from "react";
import ProjectPatient, { patientSearchFilter } from "../../../models/ProjectPatient";
import BasePageToolbar from "../../../components/containers/BasePageToolbar";
import history from "../../../history";
import Routes from "../../../constants/Routes";
import { useProjectBulkActionQuery, useProjectCrudListQuery } from "../../../hooks/useProjectQuery";
import { CreateButton } from "../../../components/buttons/CreateButton";
import HomeBasePage from "../home/HomeBasePage";
import { EmptyConditionElements } from "../../../components/containers/EmptyCondition";
import EmptyButtonView from "../../../components/containers/EmptyView";
import PatientCrudDialog from "./PatientCrudDialog";
import UserLineIcon from "remixicon-react/UserLineIcon";
import Switch from '@material-ui/core/Switch';
import { FormControlLabel, IconButton } from '@material-ui/core';
import { Grid, Typography } from "@material-ui/core";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Menu, MenuItem } from '@mui/material';
import RegisterDialog from "../patient/registrations/RegisterDialog";
import Strategy from "../../../models/Strategy";
import { useQuery } from "react-query";
import Registration from "../../../models/Registration";
import { useAppServices } from "../../../providers/appServiceProvider";
import { ImportDialog } from "./ImportDialog";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import { useAuth } from "../../../providers/authProvider";
import { Roles } from "../../../constants/Permissions";
import { DataGrid, daDK, enUS, GridFilterModel, GridFilterOperator, GridColDef, getGridSingleSelectOperators, GridComparatorFn, GridFilterItem, GridCellParams, GridRenderCellParams, GridColumnMenu, GridColumnMenuProps, GridRowParams, GridRowSelectionModel, GridLocaleText } from '@mui/x-data-grid';
import EyeOffLineIcon from "remixicon-react/EyeOffLineIcon";
import { Box, Chip } from "@material-ui/core";
import theme from "../../../constants/theme";
import TagChip from "../../../components/TagChip";
import toAge from "../../../lib/date/toAge";
import ProjectTag from "../../../models/ProjectTag";
import { PATHS } from "../../../services/appServices";
import useInvalidate from "../../../hooks/useInvalidate";
import OutlinedButton from "../../../components/buttons/OutlinedButton";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../LanguageContext";
import moment from "moment";

interface AnonymizedPatient {
    patientId: string;
    anonymity: boolean;
}

interface DeactivatedPatient {
    patientId: string;
    isActive: boolean;
}

export const PatientListPage = () => {
    const patientsQuery = useProjectCrudListQuery(services => services.projectPatients);
    const projectUsers = useProjectCrudListQuery(service => service.projectUsers);
    const auth = useAuth();
    const currentUserRole = projectUsers?.elements.find((x) => x.id === auth.currentUser?.id)?.roleId
    const anonPatientsQuery = useProjectBulkActionQuery<ProjectPatient>(services => services.projectAnonPatients);
    const activationPatientsQuery = useProjectBulkActionQuery<ProjectPatient>(services => services.projectActivationPatients);
    const [search, setSearch] = useState<string>('');
    const [filter, setFilter] = useState<string>('');
    const [areSelectedPatientsAnonymized, setAreSelectedPatientsAnonymized] = useState<boolean>(false);
    const [element, setElement] = useState<Partial<ProjectPatient>>();
    const [openImport, setOpenImport] = useState<boolean>(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [onlyShowActive, setOnlyShowActive] = useState<boolean>(true)
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 25,
        page: 0
    });
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);

    useEffect(() => {
        const savedPage = localStorage.getItem("patientsPage");
        if (savedPage) {
            setPaginationModel((prev) => ({
                ...prev,
                page: Number(savedPage),
            }));
        }
    }, []);

    const handlePageChange = (newPage: any) => {
        setPaginationModel((prev) => ({ ...prev, page: newPage }));
        localStorage.setItem("patientsPage", newPage.toString());
    };

    let localeText: Partial<GridLocaleText> | undefined;

    switch (language) {
        case 'da':
            localeText = daDK.components.MuiDataGrid.defaultProps.localeText;
            break;
        case 'en':
            localeText = enUS.components.MuiDataGrid.defaultProps.localeText;
            break;
        default:
            localeText = enUS.components.MuiDataGrid.defaultProps.localeText;
    }

    const filteredPatients: ProjectPatient[] = patientsQuery.elements
        .filter(patientSearchFilter(search))
        .filter(e => e.isActive || !onlyShowActive)
        .sort((a, b) => a.name.localeCompare(b.name));

    const handleOnlyShowActive = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOnlyShowActive(!onlyShowActive);
    };

    const handleCloseClick = () => {
        setElement(undefined);
    };

    const handleSubmit = async (values: Partial<ProjectPatient>) => {
        values.firstName = values.firstName?.trim()
        values.lastName = values.lastName?.trim()
        if (values?.id) return await patientsQuery.update(values as ProjectPatient);
        values.name = `${values.firstName} ${values.lastName}`;
        return await patientsQuery.create(values);
    }

    const handleCreateClick = () => setElement({ isActive: true });

    const handlePatientClick = (params: GridRowParams) =>
        history.push(Routes.projectPatient.replace(":projectPatientId", params.row.id));

    const handleDelete = async (id: string) => {
        if (id) return await patientsQuery.delete(id);
    }

    const refetchPatients = () => {
        patientsQuery.invalidate(); // Invalidate the query to trigger a refetch
    }

    const handleImportBulk = () => {
        setOpenImport(true);
    }

    const handleCloseImport = () => {
        setOpenImport(false)
    }

    const handleConfirmAnon = async () => {
        const patientAnonUpdates: AnonymizedPatient[] = selected.map(id => ({
            patientId: id,
            anonymity: true
        }));

        await anonPatientsQuery.anonPatients(patientAnonUpdates);
        refetchPatients();
        setSelected([]);
        setAreSelectedPatientsAnonymized(false);
    };

    const handleConfirmDeAnonymize = async () => {
        const patientDeAnonUpdates: AnonymizedPatient[] = selected.map(id => ({
            patientId: id,
            anonymity: false
        }));

        await anonPatientsQuery.anonPatients(patientDeAnonUpdates);
        refetchPatients();
        setSelected([]);
        setAreSelectedPatientsAnonymized(false);
    };

    const handleConfirmDeactivate = async () => {
        const patientDeactivateUpdates: DeactivatedPatient[] = selected.map(id => ({
            patientId: id,
            isActive: false
        }));

        await activationPatientsQuery.activatePatients(patientDeactivateUpdates);
        refetchPatients();
        setSelected([]);
    };

    const handleConfirmReactivate = async () => {
        const patientReactivateUpdates: DeactivatedPatient[] = selected.map(id => ({
            patientId: id,
            isActive: true
        }));

        await activationPatientsQuery.activatePatients(patientReactivateUpdates);
        refetchPatients();
        setSelected([]);
    };

    const renderStatusChip = (pp: GridRenderCellParams<ProjectPatient>) =>
        <Chip
            label={pp.row.isActive ? t('PatientListPage.active') : t('PatientListPage.inactive')}
            color={pp.row.isActive ? "default" : "primary"}
            style={pp.row.isActive ? { backgroundColor: theme.palette.success.main, color: "rgba(10, 8, 18, 8.7)" } : { backgroundColor: theme.palette.error.light, color: "rgba(10, 8, 18, 8.7)" }}
        />


    const renderTagChips = (pp: GridRenderCellParams<ProjectPatient>) =>
        <Box display="flex" width="100%" height="100%" alignItems="center" >
            <Box display="flex" flexWrap="wrap" height="100%" alignItems="center" flexGrow={1}>
                {pp.row.tags?.map((tag: ProjectTag) =>
                    <TagChip key={tag.id} tag={tag} size="small" />)
                }
            </Box>
        </Box>

    const renderLastAnswered = (params: GridRenderCellParams<ProjectPatient>) => {
        const { lastAnswered } = params.row;
        if (lastAnswered === undefined || new Date(lastAnswered).getTime() < 0) return "";
        const formattedDate = moment(lastAnswered).format('DD/MM/YY HH:mm');
        return formattedDate;
    }

    const renderSubmissionDate = (params: GridRenderCellParams<ProjectPatient>) => {
        const { submissionDate } = params.row;
        if (submissionDate === undefined || new Date(submissionDate).getTime() < 0) return "";
        if (submissionDate === null) return renderLastAnswered(params);

        const formattedDate = moment(submissionDate).format('DD/MM/YY');
        return formattedDate;
    }

    const unique = (fn: (pp: ProjectPatient) => string | string[]) => patientsQuery.elements.map(fn).flat().filter(Boolean).sort().filter((value, index, array) => array.indexOf(value) === index) as string[]

    const CustomColumnMenu = (props: GridColumnMenuProps) =>
        <GridColumnMenu
            {...props}
            slots={{
                // Hide `columnMenuColumnsItem`
                columnMenuColumnsItem: null,
            }}
        />;

    const tagsSortComparator: GridComparatorFn = (tags1: ProjectTag[], tags2: ProjectTag[]) => {
        return tags1.length - tags2.length
    };

    const tagsFilterOperators = getGridSingleSelectOperators()
        .filter((operator: GridFilterOperator) => operator.value === "isAnyOf")
        .map((operator: GridFilterOperator) => {
            const newOperator = { ...operator }
            const newGetApplyFilterFn = (filterItem: GridFilterItem, column: GridColDef) => {
                return (params: GridCellParams): boolean => {
                    let isOk = true
                    filterItem?.value?.forEach((fv: any) => {
                        isOk = isOk && (params.row.tags || []).some((tag: ProjectTag) => fv === tag.name)
                    })
                    return isOk
                }
            }
            newOperator.getApplyFilterFn = newGetApplyFilterFn
            return newOperator
        });


    const columns: GridColDef<ProjectPatient>[] = [
        {
            field: "name", filterable: false,
            headerName: (t('PatientListPage.name')),
            flex: 3,
            renderCell: (pp: GridRenderCellParams<ProjectPatient>) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {pp.row.name}
                    {pp.row.anonymity ? <EyeOffLineIcon style={{ marginLeft: 10 }} size="1rem" /> : null}
                </div>
            ),
        },
        { field: "sex", flex: 1, headerName: (t('PatientListPage.sex')), type: 'singleSelect', valueOptions: unique((e: ProjectPatient) => e.sex || '') },
        { field: "birthDate", filterable: false, flex: 1, headerName: (t('PatientListPage.age')), renderCell: (pp: GridRenderCellParams<ProjectPatient>) => <div> {toAge(pp.row.birthDate)} </div> },
        { field: "municipality", flex: 2, headerName: (t('PatientListPage.municipality')), type: 'singleSelect', valueOptions: unique((e: ProjectPatient) => e.municipality || '') },
        { field: "lastAnswered", filterable: false, flex: 2, headerName: (t('PatientListPage.lastAnswered')), renderCell: renderLastAnswered },
        { field: "submissionDate", filterable: false, flex: 2, headerName: (t('PatientListPage.submissionDate')), renderCell: renderSubmissionDate },
        { field: "strategyName", flex: 2, headerName: (t('PatientListPage.strategy')), type: 'singleSelect', valueOptions: unique((e: ProjectPatient) => e.strategyName || '') },
        { field: "isActive", filterable: false, flex: 1, headerName: (t('PatientListPage.status')), type: 'boolean', renderCell: renderStatusChip },
        {
            field: "tags", flex: 3, headerName: (t('PatientListPage.tags')), type: "singleSelect",
            valueOptions: unique((e: ProjectPatient) => e.tags?.map((tag: ProjectTag) => tag.name) || ''),
            sortComparator: tagsSortComparator,
            filterOperators: tagsFilterOperators,
            renderCell: renderTagChips
        },
        {
            field: 'actions',
            headerName: '',
            sortable: false,
            filterable: false,
            width: 50,
            hideable: false,
            disableColumnMenu: true,
            renderHeader: () => <HeaderMenu
                selected={selected}
                setSelected={setSelected}
                areSelectedPatientsAnonymized={areSelectedPatientsAnonymized}
                handleConfirmDeAnonymize={handleConfirmDeAnonymize}
                handleConfirmAnon={handleConfirmAnon}
                handleConfirmDeactivate={handleConfirmDeactivate}
                handleConfirmReactivate={handleConfirmReactivate}
                setRowSelectionModel={setRowSelectionModel}
            />,
            renderCell: (params) => (
                <Box display="flex" justifyContent="center" width="100%">
                    {ThreeDotsMenu(params, refetchPatients)}
                </Box>
            )
        }
    ];

    const handleRowSelectionModelChange = (rowSelectionModel: GridRowSelectionModel) => {
        setSelected(rowSelectionModel as string[]);

        if (rowSelectionModel.length === 0) {
            setAreSelectedPatientsAnonymized(false);
        } else {
            const allAnonymized = rowSelectionModel.every(id => {
                const patient = patientsQuery.elements.find(p => p.id === id);
                return patient && patient.anonymity;
            });

            setAreSelectedPatientsAnonymized(allAnonymized);
        }
    }

    const handleFilterModelChange = (filterModel: GridFilterModel) => {
        const field = filterModel.items[0]?.field;
        const value = filterModel.items[0]?.value;
        if (!field || !value) {
            setFilter('');
            return;
        }
        setFilter(columns.find(c => c.field === field)?.headerName || '');
    }

    return (

        <HomeBasePage actions={(
            <BasePageToolbar
                search={patientsQuery.elements.length > 0 ? search : undefined}
                onSearch={patientsQuery.elements.length > 0 ? setSearch : undefined}
                actionStart={patientsQuery.elements.length > 0 && (
                    <OutlinedButton text={t('PatientListPage.create')} onClick={handleCreateClick} />
                )}
                actionEnd={<Box display="flex" gridColumnGap="8px">
                    {patientsQuery.elements.length > 0 && (
                        <CreateButton text={t('PatientListPage.importData')} onClick={handleImportBulk} />
                    )}
                </Box>}
            />
        )}>
            <Grid container>
                {<Grid item xs={6}>
                    <FormControlLabel
                        control={<Switch checked={!onlyShowActive} onChange={handleOnlyShowActive} />}
                        label={onlyShowActive ? t('PatientListPage.showAllCitizens') : t('PatientListPage.showOnlyActive')}
                        labelPlacement="start"
                    />
                </Grid>}
                <Grid item xs={6} style={{ textAlign: "right" }}>
                    {filter && <Typography>
                        Filtrerer på {filter}
                    </Typography>}
                </Grid>
            </Grid>
            <EmptyConditionElements<ProjectPatient>
                isLoading={patientsQuery.query.isLoading}
                data={filteredPatients}
                empty={
                    <EmptyButtonView
                        title={t('PatientListPage.noCitizens')}
                        icon={UserLineIcon}
                        subTitle={t('PatientListPage.createACitizen')}
                        buttonText={t('PatientListPage.createACitizenButton')}
                        onClick={handleCreateClick}
                    />
                }
            >
                {(patients) =>
                    <DataGrid initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                    }}
                        onPaginationModelChange={(newModel) => {
                            setPaginationModel(newModel);
                            handlePageChange(newModel.page);
                        }}
                        paginationModel={paginationModel}
                        pageSizeOptions={[25, 50, 100]}
                        hideFooterSelectedRowCount
                        onFilterModelChange={handleFilterModelChange}
                        onRowClick={handlePatientClick}
                        slots={{ columnMenu: CustomColumnMenu }}
                        disableRowSelectionOnClick
                        localeText={localeText}
                        checkboxSelection={currentUserRole === Roles.administratorRole}
                        style={{ width: "100%" }}
                        rows={patients}
                        columns={columns}
                        sx={{
                            '.MuiDataGrid-columnSeparator': {
                                visibility: 'none !important'
                            },
                            'div.MuiDataGrid-cell--withRenderer::nth-of-type(2)::before': {
                                content: 'url("data:image/svg+xml; utf8, <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiDataGrid-iconSeparator css-i4bv87-MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SeparatorIcon"><path d="M11 19V5h2v14z"></path></svg>")',
                                color: 'blue'
                            }
                        }}
                        rowSelectionModel={selected}
                        onRowSelectionModelChange={handleRowSelectionModelChange} />
                }
            </EmptyConditionElements>
            <PatientCrudDialog
                patient={element}
                onSubmit={handleSubmit}
                onClose={handleCloseClick}
                onDelete={handleDelete}
            />
            <ImportDialog open={openImport} onClose={handleCloseImport} refetch={refetchPatients} />

        </HomeBasePage>
    )
}

const ThreeDotsMenu = (pp: GridRenderCellParams<ProjectPatient>, refetchPatients: () => void) => {
    const invalidate = useInvalidate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [element, setElement] = useState<Partial<ProjectPatient>>();
    const [openReg, setOpenReg] = useState(false);
    const [patient, setPatient] = useState<ProjectPatient>(pp.row)
    const { t } = useTranslation();
    const patientsQuery = useProjectCrudListQuery(services => services.projectPatients);
    const reportQuery = useProjectCrudListQuery(services => services.projectReports);
    const [registration, setRegistration] = useState<Partial<Registration>>();
    const [patientStrategy, setPatientStrategy] = useState<Strategy>()
    const strategiesQuery = useProjectCrudListQuery(services => services.projectStrategies);
    const appServices = useAppServices();
    const patientsService = appServices.projectPatients(patient?.parentId ?? '');
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
    const resetProject = async () => {
        await strategiesQuery.invalidate();
        await reportQuery.invalidate();
        await patientsQuery.invalidate();
        await invalidate(PATHS.projectStrategy((element?.parentId as string), (element?.strategyId as string)));
        await invalidate(PATHS.projectStrategies);
    }

    const handleDelete = async (id: string) => {
        if (id) {
            resetProject();
            return await patientsQuery.delete(id);
        }
    }
    const handleSubmit = async (values: Partial<ProjectPatient>) => {
        values.firstName = values.firstName?.trim()
        values.lastName = values.lastName?.trim()
        if (values?.id) return await patientsQuery.update(values as ProjectPatient);
        values.name = `${values.firstName} ${values.lastName}`;
        return await patientsQuery.create(values);
    }
    const handleEditPatientClick = (pp: ProjectPatient) => (e: React.MouseEvent) => {
        handleClose()
        setElement(pp);
        e.preventDefault();
        e.stopPropagation();
    }
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    }
    const handleCreateReg = (pp: ProjectPatient) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleClose()
        setPatient(pp)
        const currentStrategy = strategiesQuery.elements.find(s => s.id === patient.strategyId);
        setPatientStrategy(currentStrategy)
        setOpenReg(true)
    }
    const handleClose = () => {
        setAnchorEl(null);
    }
    const handleCloseClick = () => {
        setElement(undefined);
        refetchPatients();
    };
    const handleCloseReg = () => {
        setOpenReg(false);
        setRegistration(undefined);
    };
    const data = pp.row;

    return (
        <React.Fragment>
            <IconButton
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}>
                <MoreVertIcon />
            </IconButton>
            <Menu
                keepMounted
                id="simple-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem
                    key="editPatient"
                    onClick={handleEditPatientClick(data)}>
                    {t('PatientListPage.editCitizen')}
                </MenuItem>
                <MenuItem
                    key="createReg"
                    onClick={handleCreateReg(data)}
                    disabled={
                        !data.strategyId ||
                        !strategiesQuery.elements.some(
                            (strategy) => strategy.id === data.strategyId && strategy.effects && strategy.effects.length > 0
                        )
                    }>
                    {t('PatientListPage.createRegistration')}
                </MenuItem>
            </Menu>
            <PatientCrudDialog
                patient={element}
                onSubmit={handleSubmit}
                onClose={handleCloseClick}
                onDelete={handleDelete}
            />
            <RegisterDialog
                patient={patient}
                strategy={patientStrategy}
                registrations={dataIn}
                currentReg={registration}
                onClose={handleCloseReg}
                open={openReg}
                patientName={patient?.name}
            />
        </React.Fragment>
    )
}

const HeaderMenu = ({
    selected,
    setSelected,
    areSelectedPatientsAnonymized,
    handleConfirmDeAnonymize,
    handleConfirmAnon,
    handleConfirmDeactivate,
    handleConfirmReactivate,
    setRowSelectionModel,
}: {
    selected: string[],
    setSelected: (selected: string[]) => void,
    areSelectedPatientsAnonymized: boolean,
    handleConfirmDeAnonymize: () => void,
    handleConfirmAnon: () => void,
    handleConfirmDeactivate: () => void,
    handleConfirmReactivate: () => void,
    setRowSelectionModel: (model: GridRowSelectionModel) => void,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openDeactivate, setOpenDeactivate] = useState(false);
    const [openReactivate, setOpenReactivate] = useState(false);
    const [openAnonymize, setOpenAnonymize] = useState(false);
    const [openDeAnonymize, setOpenDeAnonymize] = useState(false);
    const { t } = useTranslation();
    const auth = useAuth();
    const projectUsers = useProjectCrudListQuery(service => service.projectUsers);
    const currentUserRole = projectUsers?.elements.find((x) => x.id === auth.currentUser?.id)?.roleId;

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleCloseDeactivate = () => setOpenDeactivate(false);
    const handleCloseReactivate = () => setOpenReactivate(false);
    const handleCloseAnonymize = () => setOpenAnonymize(false);
    const handleCloseDeAnonymize = () => setOpenDeAnonymize(false);

    const handleAnonClick = () => {
        setOpenAnonymize(true);
        handleClose();
    };

    const handleConfirmAnonAndClose = async () => {
        await handleConfirmAnon();
        setOpenAnonymize(false);
        setSelected([]);
    };

    const handleConfirmDeAnonymizeAndClose = async () => {
        await handleConfirmDeAnonymize();
        setOpenDeAnonymize(false);
        setSelected([]);
    };

    const handleConfirmDeactivateAndClose = async () => {
        await handleConfirmDeactivate();
        setOpenDeactivate(false);
        setSelected([]);
    };

    const handleConfirmReactivateAndClose = async () => {
        await handleConfirmReactivate();
        setOpenReactivate(false);
        setSelected([]);
    };

    const handleDeAnonymizeClick = () => {
        setOpenDeAnonymize(true);
        handleClose();
    };

    const handleDeactivateClick = () => {
        setOpenDeactivate(true);
        handleClose();
    };

    const handleReactivateClick = () => {
        setOpenReactivate(true);
        handleClose();
    };

    return (
        <>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                {currentUserRole === Roles.administratorRole && (
                    <>
                        <MenuItem onClick={handleAnonClick} disabled={selected.length === 0}>
                            {t('PatientListPage.anonymize')}
                        </MenuItem>
                        <MenuItem onClick={handleDeAnonymizeClick} disabled={selected.length === 0}>
                            {t('PatientListPage.deAnonymize')}
                        </MenuItem>
                        <MenuItem onClick={handleDeactivateClick} disabled={selected.length === 0}>
                            {t('PatientListPage.deactivate')}
                        </MenuItem>
                        <MenuItem onClick={handleReactivateClick} disabled={selected.length === 0}>
                            {t('PatientListPage.activate')}
                        </MenuItem>
                    </>
                )}
            </Menu>
            <ConfirmDialog
                open={openDeactivate}
                onClose={handleCloseDeactivate}
                onConfirm={handleConfirmDeactivateAndClose}
                title={t('PatientListPage.areYouSure')}
            >
                <span>
                    {t('PatientListPage.deactivateWarning')}
                    <br />
                </span>
                <h4>{t('PatientListPage.requestedActionPatients', { count: selected.length, selectedNumber: selected.length })}</h4>
            </ConfirmDialog>
            <ConfirmDialog
                open={openReactivate}
                onClose={handleCloseReactivate}
                onConfirm={handleConfirmReactivateAndClose}
                title={t('PatientListPage.areYouSure')}
            >
                <span>
                    {t('PatientListPage.reactivateWarning')}
                    <br />
                </span>
                <h4>{t('PatientListPage.requestedActionPatients', { count: selected.length, selectedNumber: selected.length })}</h4>
            </ConfirmDialog>
            <ConfirmDialog
                open={openAnonymize}
                onClose={handleCloseAnonymize}
                onConfirm={handleConfirmAnonAndClose}
                title={t('PatientListPage.areYouSure')}
            >
                <span>
                    {t('PatientListPage.anonymizeWarning')}
                    <br />
                </span>
                <h4>{t('PatientListPage.requestedActionPatients', { count: selected.length, selectedNumber: selected.length })}</h4>
            </ConfirmDialog>
            <ConfirmDialog
                open={openDeAnonymize}
                onClose={handleCloseDeAnonymize}
                onConfirm={handleConfirmDeAnonymizeAndClose}
                title={t('PatientListPage.areYouSure')}
            >
                <span>
                    {t('PatientListPage.deAnonymizeWarning')}
                    <br />
                </span>
                <h4>{t('PatientListPage.requestedActionPatients', { count: selected.length, selectedNumber: selected.length })}</h4>
            </ConfirmDialog>
        </>
    );
};

export default PatientListPage;