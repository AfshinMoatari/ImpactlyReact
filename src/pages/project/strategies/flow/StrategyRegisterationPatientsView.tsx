import React, { useState } from "react";
import SelectTable from "../../../../components/tables/SelectTable";
import HeadItem from "../../../../components/tables/HeadItem";
import { registeredPatientNameSearchFilter } from "../../../../models/ProjectPatient";
import { Grid, Box, TextField, Chip, IconButton, Tooltip } from "@material-ui/core";
import AutocompleteTags from "../../../../components/inputs/AutocompleteTags";
import DirectionalButton from "../../../../components/buttons/NextButton";
import TagChip from "../../../../components/TagChip";
import { useQuery } from "react-query";
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import { ProjectStrategyServiceType } from "../../../../services/projectStrategyService";
import { BatchSendoutRegistration, PatientRegistrationDataGrid, RegistrationStatus } from "../../../../models/Registration";
import ProjectTag from "../../../../models/ProjectTag";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { ProjectRegistration } from "../../../../models/Strategy";
import { useTranslation } from "react-i18next";

interface StrategyRegisterationPatientsProps {
    strategyService: ProjectStrategyServiceType;
    strategyId: string;
    batchRegistrationData: BatchSendoutRegistration;
    setBatchRegistrationData: (data: any) => void;
    activeStep: number;
    setActiveState: (data: number) => void;
    category: string;
    effects: ProjectRegistration[];
}

const StrategyRegisterationPatientsView: React.FC<StrategyRegisterationPatientsProps> = ({
    strategyService,
    strategyId,
    setActiveState,
    batchRegistrationData,
    setBatchRegistrationData,
    activeStep,
    category,
    effects
}) => {
    const { t } = useTranslation();
    const heads: HeadItem<RegistrationStatus>[] = [
        { id: "name", label: t("RegistrationFlowPage.ChooseCitizens.name") },
        {
            id: "status",
            label: t("RegistrationFlowPage.ChooseCitizens.status"),
            render: p => p.status ? <Box style={{ paddingTop: 4, paddingBottom: 4, paddingLeft: 12, paddingRight: 12, borderRadius: 100, width: 'fit-content' }} sx={{ bgcolor: 'rgba(10, 8, 18, 0.08)' }}>{p.status}</Box> : null
        },
        {
            id: "isRegistered",
            label: t("RegistrationFlowPage.ChooseCitizens.registered"),
            render: p => p.isRegistered ? <Chip color="secondary" label={t("RegistrationFlowPage.ChooseCitizens.registered")} /> :
                <Chip color="default" label={t("RegistrationFlowPage.ChooseCitizens.unregistered")} />
        },
        {
            id: "tags",
            numeric: false,
            label: t("RegistrationFlowPage.ChooseCitizens.tags"),
            render: sp =>
                <Box display="flex" maxWidth="160px" flexWrap="wrap">
                    {sp.tags?.map((tag) =>
                        <TagChip key={tag.id} tag={tag} size="small" />)
                    }
                </Box>
        },
        {
            id: "note",
            label: t("RegistrationFlowPage.ChooseCitizens.note"),
            render: p =>
                <Tooltip title={p.note ? p.note : ""} style={{ display: 'flex', margin: '0 auto' }}>
                    <IconButton
                        color={p.note ? "secondary" : "default"}
                        size="small"
                    >
                        <InfoOutlinedIcon />
                    </IconButton>
                </Tooltip>

        },
    ];

    const registrationsQuery = useQuery<RegistrationStatus[] | any>({
        queryFn: async () => {
            const res = await strategyService.getRegisteredPatients(strategyId, category);
            if (!res.success) return ([] as RegistrationStatus[]);
            return res.value;
        }
    });
    const registrations = (registrationsQuery.data as RegistrationStatus[]) ?? ([] as RegistrationStatus[]);

    const handleSelect = (patientsId: string[]) => {
        const patientRegistrationDataGrid = [] as PatientRegistrationDataGrid[]
        patientsId.forEach(patientId => {
            let pname = '';
            (registrations as RegistrationStatus[]).forEach(e => {
                if (e.id === patientId) {
                    pname = e.name
                }
            });

            const registeredPatient = filteredRegisteredPatients.find(rp => rp.id == patientId)

            patientRegistrationDataGrid.push({
                projectId: registeredPatient?.projectId,
                patientId: patientId,
                date: new Date(),
                value: 0,
                note: '',
                patientName: pname,
                effectId: effects[0].id,
                effectName: effects[0].name,
                tags: filteredRegisteredPatients.find(f => f.id == patientId)?.tags.map(({ name }) => name),
                type: effects[0].type,
                category: (effects[0]?.type === "numeric" || effects[0]?.type === "count") ? null : category,
                before: (registeredPatient?.status != null && registeredPatient?.status != '' && registeredPatient?.latestEffect != null) ? registeredPatient?.latestEffect : null,
                now: (effects[0]?.type === "status") ? registeredPatient?.latestEffect : null
            } as PatientRegistrationDataGrid);
        });

        setBatchRegistrationData({
            ...batchRegistrationData,
            ids: patientsId,
            patientRegistrationDataGrid: patientRegistrationDataGrid
        });
    }

    const handleNext = async () => {
        setActiveState(activeStep += 1)
    };
    const handlePrev = async () => {
        setActiveState(activeStep -= 1);
    };

    const handleInput = (v: string) => setInput(v);
    const [input, setInput] = useState("");


    const [tags, setTags] = useState<ProjectTag[]>([]);
    const handleChange = (selectedTags: ProjectTag[]) => {
        setTags(selectedTags);
    };

    const handleDelete = (tag: ProjectTag) => () => handleChange(tags.filter(t => t.id !== tag.id));


    const [searchTerm, setSearch] = useState<string>('');
    let filteredRegisteredPatients = registrations;
    filteredRegisteredPatients = registrations?.filter(registeredPatientNameSearchFilter(searchTerm));
    filteredRegisteredPatients = filteredRegisteredPatients.filter(((data: any) => tags.every((tag: ProjectTag) => data.tags?.some((t: any) => t.name.includes(tag.name)))));

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            xs={12}
            style={{ gap: 15 }}>
            <Grid item xs={12}>
                <Box>
                    <TextField
                        value={searchTerm}
                        onChange={(event) => setSearch(event.target.value)}
                        variant="outlined"
                        label={t("RegistrationFlowPage.ChooseCitizens.filterByName")}
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
                        label={t("RegistrationFlowPage.ChooseCitizens.filterByTags")}
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
                <Box>
                    {registrationsQuery.isLoading && <LoadingOverlay size={30} />}
                    {!registrationsQuery.isLoading &&
                        <Box style={{ height: 480 }}>
                            <SelectTable<RegistrationStatus>
                                heads={heads}
                                elements={filteredRegisteredPatients}
                                selected={batchRegistrationData.ids}
                                setSelected={handleSelect}
                            />
                        </Box>
                    }
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
                    }}>{(batchRegistrationData.ids.length > 0) ? <> {t("RegistrationFlowPage.ChooseCitizens.selectedCitizens",
                        { count: batchRegistrationData.ids.length })}</> : null}
                    </Box>
                    <Box style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'right'
                    }}>
                        <Box>
                            <DirectionalButton
                                onClick={handlePrev}
                                text={t("RegistrationFlowPage.ChooseCitizens.previousButton")}
                                variant="outlined"
                            ></DirectionalButton>
                        </Box>
                        <Box style={{
                            marginLeft: 10,
                        }}>
                            <DirectionalButton
                                onClick={handleNext}
                                disabled={Boolean(batchRegistrationData.ids.length === 0)}
                                text={t("RegistrationFlowPage.ChooseCitizens.nextButton")}
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

export default StrategyRegisterationPatientsView;
