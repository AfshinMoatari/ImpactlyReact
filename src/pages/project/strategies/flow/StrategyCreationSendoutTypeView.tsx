import React from "react";
import { Grid, Box, Paper, makeStyles } from "@material-ui/core";
import { DropResult } from "react-beautiful-dnd";
import { DragableItem } from "../../../../models/DragableItem";
import { Reorder } from "../../../../components/DragDrop/DraggableHelper";
import DraggableList from "../../../../components/DragDrop/DraggableList";
import DirectionalButton from "../../../../components/buttons/NextButton";
import { SurveyFrequencyFormValues } from "./FrequencyDialog";
import { Survey } from "../../../../models/Survey";
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
    surveyFrequencyFormValues: SurveyFrequencyFormValues;
    setActiveState: (index: number) => void;
    setsurveyFrequencyFormValues: (data: SurveyFrequencyFormValues) => void;
    activeStep: number;
}

const StrategySendoutTypeView: React.FC<StrategySendoutTypeDialogProps> = ({
                                                                               setActiveState,
                                                                               surveyFrequencyFormValues,
                                                                               setsurveyFrequencyFormValues,
                                                                               activeStep
                                                                           }) => {

    const mappedDragableItems = surveyFrequencyFormValues.surveys.map(item => new DragableItem(item.id, item.name, item.description));
    const [dragableItems, setItems] = React.useState(mappedDragableItems);
    const {t} = useTranslation();

    const onDragEnd = ({ destination, source }: DropResult) => {
        // dropped outside the list 
        if (!destination) return;

        const newItems = Reorder(dragableItems, source.index, destination.index);
        const surveys =  newItems.map((i) => surveyFrequencyFormValues.surveys.find((j) => j.id === i.id));
        setItems(newItems);
        setsurveyFrequencyFormValues({
            ...surveyFrequencyFormValues,
            surveys: (surveys as Survey[])
        });
    };

    const classes = useStyles();

    const handleNext = async () => {
        setActiveState(activeStep += 1)
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
            style={{gap: 10}}>
            <Grid
                container
                direction="row"
                justifyContent="center"
                xs={12}
                style={{gap: 10}}>
                <Box>
                    <Paper className={classes.flexPaper}>
                        <DraggableList title={t("StrategyFlowPage.StrategyCreationSendoutTypeView.chosenSurveys")} items={[...dragableItems]} onDragEnd={onDragEnd} />
                    </Paper>
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
                            text={t("StrategyFlowPage.StrategyCreationSendoutTypeView.back")}
                            variant="outlined"
                        ></DirectionalButton>
                    </Box>
                    <Box style={{
                        marginLeft: 10,
                    }}>
                        <DirectionalButton
                            onClick={handleNext}
                            disabled={false}
                            text={t("StrategyFlowPage.StrategyCreationSendoutTypeView.next")}
                            aria-label="submit"
                            variant="contained"
                        >
                        </DirectionalButton>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    )
};

export default StrategySendoutTypeView;
