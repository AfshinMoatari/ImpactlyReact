import React, { useState } from "react";
import SelectTable from "../../../../components/tables/SelectTable";
import HeadItem from "../../../../components/tables/HeadItem";
import ProjectPatient, { patientNameSearchFilter } from "../../../../models/ProjectPatient";
import { Grid, Box, TextField, TableCell, Chip, TablePagination, Switch, FormControlLabel } from "@material-ui/core";
import AutocompleteTags from "../../../../components/inputs/AutocompleteTags";
import ProjectTag from "../../../../models/ProjectTag";
import DirectionalButton from "../../../../components/buttons/NextButton";
import { BatchSendoutData } from "../../../../models/cron/Frequency";
import TagChip from "../../../../components/TagChip";
import { useQuery } from "react-query";
import { ProjectStrategyServiceType } from "../../../../services/projectStrategyService";
import BaseTableCell from "../../../../components/tables/BaseTableCell";
import { useTranslation } from "react-i18next";


interface StrategyPatientsDialogProps {
    strategyService?: ProjectStrategyServiceType;
    strategyId: string;
    batchSendoutData: BatchSendoutData,
    copyOfBatchSendoutData: BatchSendoutData
    setBatchSendoutData: (data: any) => void;
    activeStep: number,
    setActiveState: (data: number) => void;
    edit: boolean;
}

const StrategyPatientsView: React.FC<StrategyPatientsDialogProps> = ({
    strategyService,
    strategyId,
    setActiveState,
    batchSendoutData,
    copyOfBatchSendoutData,
    setBatchSendoutData,
    activeStep,
    edit
}) => {
    const { t } = useTranslation();

    const heads: HeadItem<ProjectPatient>[] = [
        { id: "name", label: t("CommunicationFlowPage.StrategyPatientsView.name") },
        {
            id: "isActive",
            label: t("CommunicationFlowPage.StrategyPatientsView.status"),
            render: p => p.isActive ? <Chip color="secondary" label={t("CommunicationFlowPage.StrategyPatientsView.active")} /> :
                <Chip color="default" label={t("CommunicationFlowPage.StrategyPatientsView.inactive")} />
        },
        {
            id: "tags", numeric:
                false, label: t("CommunicationFlowPage.StrategyPatientsView.tags"),
            render: sp =>
                <Box display="flex" maxWidth="160px" flexWrap="wrap">
                    {sp.tags?.map((tag) =>
                        <TagChip key={tag.id} tag={tag} size="small" />)
                    }
                </Box>
        }
    ];

    const [enableReset, toggleEnableReset] = useState(true);

    const handleSelect = (newSelectedIds: string[]) => {
        const currentPageIds = paginatedPatients.map((p: ProjectPatient) => p.id);

        const selectionsFromOtherPages = batchSendoutData.patientsId.filter(
            id => !currentPageIds.includes(id)
        );

        setBatchSendoutData({
            ...batchSendoutData,
            patientsId: [...selectionsFromOtherPages, ...newSelectedIds]
        });

        toggleEnableReset(false);
    };

    const handleNext = async () => {
        setActiveState(activeStep += 1)
    };
    const handlePrev = async () => {
        if (edit) {
            handleReset();
        }
        setActiveState(activeStep -= 1);
    };

    const handleReset = async () => {
        setBatchSendoutData({
            ...batchSendoutData,
            patientsId: copyOfBatchSendoutData.patientsId
        });
        toggleEnableReset(true);
    };

    const handleInput = (v: string) => setInput(v);
    const [input, setInput] = useState("");


    const [tags, setTags] = useState<ProjectTag[]>([]);
    const handleChange = (selectedTags: ProjectTag[]) => {
        setTags(selectedTags);
    };

    const handleDelete = (tag: ProjectTag) => () => handleChange(tags.filter(t => t.id !== tag.id));

    const [isLoading, setIsLoading] = useState(true);

    const patientsQuery = useQuery<ProjectPatient[] | any>({
        queryFn: async () => {
            setIsLoading(true);
            try {
                const res = await strategyService?.getStrategyPatients(strategyId);
                if (!res?.success) return ([] as ProjectPatient[]);
                return res.value;
            } finally {
                setTimeout(() => {
                    setIsLoading(false);
                }, 200); // 500ms delay like in the survey component
            }
        }
    });

    const [searchTerm, setSearch] = useState<string>('');
    let filteredPatients = patientsQuery.data;
    filteredPatients = patientsQuery.data?.filter(patientNameSearchFilter(searchTerm));
    filteredPatients = filteredPatients.filter(((data: any) => tags.every((tag: ProjectTag) => data.tags?.some((t: any) => t.name.includes(tag.name)))));

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedPatients = filteredPatients?.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAllSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setSelectAll(checked);
        if (checked) {
            const allPatientIds = filteredPatients.map((p: ProjectPatient) => p.id);
            setBatchSendoutData({
                ...batchSendoutData,
                patientsId: allPatientIds
            });
        } else {
            setBatchSendoutData({
                ...batchSendoutData,
                patientsId: []
            });
        }
        toggleEnableReset(false);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        setPage(0);
    };

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            xs={12}
            style={{ gap: 15, width: '700px' }}>
            <Grid item xs={12}>
                <Box>
                    <TextField
                        value={searchTerm}
                        onChange={handleSearch}
                        variant="outlined"
                        label={t("CommunicationFlowPage.StrategyPatientsView.filterName")}
                        defaultValue=""
                        fullWidth={true}
                        style={{ marginTop: 8, marginBottom: 8 }}
                    />
                </Box>
                <Box>
                    <AutocompleteTags
                        input={input}
                        onInputChange={handleInput}
                        tags={tags}
                        onChange={handleChange}
                        label={t("CommunicationFlowPage.StrategyPatientsView.filterTag")}
                        variant="outlined"
                    />
                    <Box style={{
                        marginTop: 10,
                    }}>
                        {tags && tags.map(tag => <TagChip tag={tag} onDelete={handleDelete(tag)} />)}
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box style={{height: 'auto', minHeight: 300}}>
                    <SelectTable<ProjectPatient>
                        heads={heads}
                        elements={paginatedPatients || []}
                        selected={paginatedPatients
                            .filter((p: ProjectPatient) => batchSendoutData.patientsId.includes(p.id))
                            .map((p: ProjectPatient) => p.id)}
                        setSelected={handleSelect}
                        endCell={() => (<BaseTableCell align="right" padding="none" />)}
                        endActions={<TableCell style={{ display: 'none' }} />}
                        isLoading={patientsQuery.isLoading || isLoading}
                    />
                    <Box display="flex" alignItems="center">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={selectAll}
                                    onChange={handleSelectAllSwitch}
                                    disabled={isLoading || patientsQuery.isLoading || !filteredPatients?.length}
                                    color="primary"
                                />
                            }
                            label={t("CommunicationFlowPage.StrategyPatientsView.selectAll")}
                            style={{ marginRight: 'auto' }}
                        />
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={filteredPatients?.length || 0}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            style={{ 
                                marginTop: 8,
                                pointerEvents: (isLoading || patientsQuery.isLoading) ? 'none' : 'auto',
                                opacity: (isLoading || patientsQuery.isLoading) ? 0.5 : 1
                            }}
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} ${t("Common.Tabel.of")} ${count}`}
                            labelRowsPerPage={t("Common.Tabel.rowsPerPage")}
                        />
                    </Box>
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
                        alignItems: 'center'
                    }}>{edit && (
                        <Box style={{ marginRight: 20 }}>
                            <DirectionalButton
                                disabled={enableReset}
                                onClick={handleReset}
                                text={t("CommunicationFlowPage.StrategyPatientsView.reset")}
                                variant="text"
                            ></DirectionalButton>
                        </Box>
                    )}
                        {(batchSendoutData.patientsId.length > 0) ? <>{t("CommunicationFlowPage.StrategyPatientsView.selectedCitizens", { count: batchSendoutData.patientsId.length })}</> : null}<Box>
                        </Box>
                    </Box>
                    <Box style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'right'
                    }}>
                        <Box>
                            <DirectionalButton
                                onClick={handlePrev}
                                text={t("CommunicationFlowPage.StrategyPatientsView.back")}
                                variant="outlined"
                            ></DirectionalButton>
                        </Box>
                        <Box style={{
                            marginLeft: 10,
                        }}>
                            <DirectionalButton
                                onClick={handleNext}
                                disabled={Boolean(batchSendoutData.patientsId.length === 0)}
                                text={t("CommunicationFlowPage.StrategyPatientsView.next")}
                                aria-label="submit"
                                variant="contained"
                            >
                            </DirectionalButton>
                        </Box>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    )
}

export default StrategyPatientsView;
