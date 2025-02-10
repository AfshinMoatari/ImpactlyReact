import React, {ChangeEvent, ReactNode, useState} from "react";
import {Grid, Box, Paper, makeStyles} from "@material-ui/core";
import {DropResult} from "react-beautiful-dnd";
import {DragableItem} from "../../../../models/DragableItem";
import SelectDropDown from "../../../../components/inputs/SelectDropDown";
import {Reorder} from "../../../../components/DragDrop/DraggableHelper";
import DraggableList from "../../../../components/DragDrop/DraggableList";
import DirectionalButton from "../../../../components/buttons/NextButton";
import {BatchSendoutData} from "../../../../models/cron/Frequency";
import {useTranslation} from "react-i18next";

const useStyles = makeStyles({
    flexPaper: {
        flex: 1,
        minWidth: 570
    },
    root: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    dropDownContainer: {
        width: '100%',
        marginTop: 25
    }
});

interface StrategySendoutTypeDialogProps {
    batchSendoutData: BatchSendoutData,
    setBatchSendoutData: (data: any) => void;
    activeStep: number,
    edit: boolean,
    setActiveState: (data: number) => void;
    toggleConfirmationDialog: (data: boolean) => void;
}


const StrategySendoutTypeView: React.FC<StrategySendoutTypeDialogProps> = ({
                                                                               setActiveState,
                                                                               batchSendoutData,
                                                                               setBatchSendoutData,
                                                                               activeStep,
                                                                               toggleConfirmationDialog,
                                                                               edit
                                                                           }) => {

    const mappedDragableItems = batchSendoutData.surveys.map(item => new DragableItem(item.id, item.name, item.description));
    const [dragableItems, setItems] = React.useState(mappedDragableItems);
    const {t} = useTranslation();

    const options: { [key: string]: string } = {
        ["frequency"]: t("CommunicationFlowPage.StrategySendoutTypeView.frequency"),
        ["immediate"]: t("CommunicationFlowPage.StrategySendoutTypeView.immediate")
    }

    const onDragEnd = ({destination, source}: DropResult) => {
        // dropped outside the list 
        if (!destination) return;

        const newItems = Reorder(dragableItems, source.index, destination.index);
        const surveys = newItems.map((i) => batchSendoutData.surveys.find((j) => j.id === i.id));
        setItems(newItems);
        setBatchSendoutData({
            ...batchSendoutData,
            surveys: surveys
        });
    };

    const classes = useStyles();

    const handleSelect = (event: ChangeEvent<{ name?: string | undefined; value: unknown; }>, child: ReactNode) => {
        const type = event.target.value as string;
        setBatchSendoutData({
            ...batchSendoutData,
            type: type
        });
    }

    const handleNext = async () => {
        if (batchSendoutData.type === "immediate") {
            toggleConfirmationDialog(true)
        } else {
            setActiveState(activeStep += 1)
        }
    };
    const handlePrev = async () => {
        setActiveState(activeStep -= 1)
    };

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            xs={12}
            style={{gap: 10, width: '700px'}}>
            <Grid
                container
                direction="row"
                justifyContent="center"
                xs={12}
                style={{gap: 10}}>
                <Box style={{width: '100%'}}>
                    <Paper className={classes.flexPaper}>
                        <DraggableList title={t("CommunicationFlowPage.StrategySendoutTypeView.selectedSurveys")} items={[...dragableItems]}
                                       onDragEnd={onDragEnd}/>
                    </Paper>
                </Box>
                <Box className={classes.dropDownContainer}>
                    <SelectDropDown
                        defaultValue={batchSendoutData.type}
                        options={options}
                        label={t("CommunicationFlowPage.StrategySendoutTypeView.chooseSendoutType")}
                        onChange={handleSelect}
                        disabled={edit}/>
                </Box>
            </Grid>

            <Grid item xs={12}>
                <Box style={{
                    padding: '20px 0',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'right'
                }}>
                    <Box>
                        <DirectionalButton
                            onClick={handlePrev}
                            text={t("CommunicationFlowPage.StrategySendoutTypeView.back")}
                            variant="outlined"
                        ></DirectionalButton>
                    </Box>
                    <Box style={{
                        marginLeft: 10,
                    }}>
                        <DirectionalButton
                            onClick={handleNext}
                            disabled={false}
                            text={t("CommunicationFlowPage.StrategySendoutTypeView.next")}
                            aria-label="submit"
                            variant="contained"
                        >
                        </DirectionalButton>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    )
}

export default StrategySendoutTypeView;
