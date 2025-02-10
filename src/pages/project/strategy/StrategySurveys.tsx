import React, { useEffect, useState } from "react";
import {
    Backdrop,
    Box,
    DialogActions,
    Grid,
    IconButton,
    Typography,
} from "@material-ui/core";
import NiceOutliner from "../../../components/containers/NiceOutliner";
import Strategy from "../../../models/Strategy";
import { Survey } from "../../../models/Survey";
import useSurveys from "../../../hooks/useSurveys";
import BaseDialog from "../../../components/dialogs/BaseDialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import { EmptyCondition } from "../../../components/containers/EmptyCondition";
import SelectTable from "../../../components/tables/SelectTable";
import HeadItem from "../../../components/tables/HeadItem";
import Chip from "@material-ui/core/Chip";
import CreateButton from "../../../components/buttons/CreateButton";
import snackbarProvider from "../../../providers/snackbarProvider";
import AddLineIcon from "remixicon-react/AddLineIcon";
import { useAppServices } from "../../../providers/appServiceProvider";
import { useAuth } from "../../../providers/authProvider";
import { useTranslation } from "react-i18next";
import DraggableList from "../../../components/DragDrop/DraggableList";
import DraggableListItem from "../../../components/DragDrop/DraggableListItem";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragableItem } from "../../../models/DragableItem";
import { DropResult } from "react-beautiful-dnd";

interface StrategySurveysProps {
    strategy: Strategy;
    edit: boolean;
    edited: Survey[];
    onChange: (surveys: Survey[]) => void;
}

const StrategySurveys: React.FC<StrategySurveysProps> = ({
    strategy,
    edit,
    edited,
    onChange,
}) => {
    const projectId = useAuth().currentProjectId;
    const strategyService = useAppServices().projectStrategies(projectId);
    const { t } = useTranslation();

    interface CRUDSurveyResponse {
        success: boolean;
        message?: string;
        value?: any;
    };
    const [available, loading] = useSurveys();
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const handleClick = () => setOpen(true);

    const ids = edited.map((s) => s?.id);
    const [selected, setSelected] = useState(ids);
    useEffect(() => {
        if (selected.length !== ids.length) {
            setSelected(ids);
        }
    }, [ids.length]);

    const surveysInUse = strategy.frequencies.reduce((prev, curr) => {
        curr.surveys.forEach((survey) => {
            if (!prev.includes(survey.id)) prev.push(survey.id);
        });
        return prev;
    }, [] as string[]);

    const heads: HeadItem<Survey>[] = [
        {
            id: "name",
            label: t("StrategySurveys.name"),
            render: (s) => (!s.validated ? s.longName : `${s.name}: ${s.longName}`),
        },
        {
            id: "validated",
            label: "",
            render: (s) => {
                const validateChip = !s.validated ? null : (
                    <Chip label={t("StrategySurveys.validatedChip")} color="secondary" />
                );
                const inUseChip = surveysInUse.includes(s.id) ? (
                    <Chip label={t("StrategySurveys.inUseChip")} color="primary" />
                ) : null;
                return (
                    <div style={{ display: "flex" }}>
                        {validateChip}
                        {inUseChip}
                    </div>
                );
            },
        },
    ];

    const handleSelect = (selectedIds: string[]) => {
        if (selectedIds.length > ids.length) return setSelected(selectedIds);
        const missingSurvey = surveysInUse.find(
            (surveyInUse) => !selectedIds.includes(surveyInUse)
        );

        if (missingSurvey)
            return snackbarProvider.warning(t("StrategySurveys.surveyErrorMessage"));
        setSelected(selectedIds);
    };
    const handleApplySelected = async () => {
        const selectedSurveys = selected.map((id) =>
            available.find((s) => s.id === id)
        ) as Survey[];
        try {
            handleClose();
            const res: CRUDSurveyResponse = await strategyService.assignSurveys(strategy.id, selectedSurveys);
            if (!res.success) {
                console.error(res.message || 'Failed to create assign surveys');
                return false;
            }
            onChange(res.value as Survey[]);
            snackbarProvider.success(t("StrategySurveys.surveySuccessMessage"))
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };
    strategy.surveys = strategy.surveys.filter((x) => x !== null);
    edited = edited.filter((x) => x != null);
    const surveys = !edit ? strategy.surveys : edited;

    const mappedDragableItems = surveys?.map((item, idx) =>
        new DragableItem(
            item.id,
            item.index === 0 ? idx : item.index, // If index is 0, replace it with the item's position in the list since not all the old surveys on the strategy have indexes
            item.name,
            ''
        )
    );
    const [dragableItems, setItems] = useState(mappedDragableItems);
    const onDragEnd = async ({ destination, source }: DropResult) => {
        if (!destination) return;

        const newItems = Array.from(dragableItems);
        const [reorderedItem] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, reorderedItem);

        const updatedItems = newItems.map((item, index) => ({
            ...item,
            index,
        }));

        setItems(updatedItems);

        const updatedSurveys = updatedItems
            .map(item => edited.find(survey => survey.id === item.id))
            .filter(survey => survey !== undefined);

        try {
            handleClose();
            const res: CRUDSurveyResponse = await strategyService.assignSurveys(strategy.id, updatedSurveys as Survey[]);

            if (res.success) {
                onChange(res.value as Survey[]);
            } else {
                console.error(res.message || "Failed to assign surveys");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <NiceOutliner>
            <Box display='flex' justifyContent='space-between'>
                <div>
                    <Typography variant="h3" style={{ fontWeight: '500' }}>{t("StrategySurveys.surveyHeading")}</Typography>
                    <Typography variant="subtitle2" style={{ paddingBottom: 16 }}>
                        {t("StrategySurveys.surveySubHeading")}
                    </Typography>
                </div>
                <div>
                    <IconButton>
                        <AddLineIcon
                            onClick={handleClick}
                        />
                    </IconButton>
                </div>
            </Box>
            <BaseDialog
                title={t("StrategySurveys.selectSurvey")}
                open={open}
                maxWidth="lg"
                onClose={handleClose}
            >
                <Backdrop style={{ zIndex: 10, color: "white" }} open={false}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                <DialogContent style={{ padding: "0px 24px 32px 24px" }}>
                    <EmptyCondition isLoading={loading}>
                        <SelectTable<Survey>
                            heads={heads}
                            elements={available}
                            selected={selected}
                            setSelected={handleSelect}
                        />
                    </EmptyCondition>
                </DialogContent>
                <DialogActions>
                    <CreateButton text={t("StrategySurveys.applySelected")} onClick={handleApplySelected} />
                </DialogActions>
            </BaseDialog>
            <NiceOutliner>
                <DraggableList
                    items={[...dragableItems]}
                    onDragEnd={onDragEnd}
                >
                    {dragableItems.map((item) => (

                        <Grid
                            container
                            item
                            xs={12}
                            style={{
                                justifyContent: "space-between",
                            }}
                        >
                            <DraggableListItem
                                item={item}
                                index={item.index as number}
                                key={item.id}
                            >
                                <Grid
                                    container
                                    item
                                    xs={10}
                                    style={{
                                        justifyContent: "flex-start",
                                        alignItems: "center"
                                    }}
                                >
                                    <Grid item xs={11}>
                                        <Box style={{ width: "100%", display: "inline-flex", alignItems: "center" }}>
                                            <DragIndicatorIcon
                                                color="disabled"
                                                fontSize="large"
                                                style={{ paddingBottom: 3 }}
                                            />
                                            <Box style={{ paddingLeft: 12 }}>
                                                {item.primary}
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </DraggableListItem>
                        </Grid>
                    ))}
                </DraggableList>
            </NiceOutliner>
        </NiceOutliner>
    );
};

export default StrategySurveys;
