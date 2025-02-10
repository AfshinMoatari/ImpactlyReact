import React, { useState } from "react";
import { Survey } from "../../../../models/Survey";
import SelectTable from "../../../../components/tables/SelectTable";
import HeadItem from "../../../../components/tables/HeadItem";
import { Box, Grid, TableCell } from "@material-ui/core";
import DirectionalButton from "../../../../components/buttons/NextButton";
import { SurveyFrequencyFormValues } from "./FrequencyDialog";
import BaseTableCell from "../../../../components/tables/BaseTableCell";
import { useTranslation } from "react-i18next";

interface StrategyCreationSurveyDialogProps {
    surveys: Survey[];
    surveyFrequencyFormValues: SurveyFrequencyFormValues;
    copyOfSurveyFrequencyFormValues: SurveyFrequencyFormValues;
    setActiveState: (index: number) => void;
    setsurveyFrequencyFormValues: (data: SurveyFrequencyFormValues) => void;
    activeStep: number;
    edit: boolean;
}

const StrategyCreationSurveyView: React.FC<StrategyCreationSurveyDialogProps> = ({
    surveys,
    setActiveState,
    setsurveyFrequencyFormValues,
    surveyFrequencyFormValues,
    copyOfSurveyFrequencyFormValues,
    activeStep,
    edit
}) => {
    const [enableReset, toggleEnableReset] = useState(true);
    const { t } = useTranslation();
    const heads: HeadItem<Survey>[] = [
        { id: "name", label: t("StrategyFlowPage.StrategyCreationSurveyView.name") }
    ];
    const handleSelect = (surveyIds: string[]) => {
        const selectedSurveys = surveys.filter((item: any) => surveyIds.includes(item.id));
        setsurveyFrequencyFormValues({
            ...surveyFrequencyFormValues,
            surveys: selectedSurveys
        });
        toggleEnableReset(false);
    }

    const handleNext = async () => {
        setActiveState(activeStep += 1)
    };
    const handlePrev = async () => {
        setActiveState(activeStep -= 1)
    };
    const handleReset = async () => {
        setsurveyFrequencyFormValues({
            ...surveyFrequencyFormValues,
            surveys: copyOfSurveyFrequencyFormValues.surveys
        });
        toggleEnableReset(true);
    };

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            xs={12}
            style={{ gap: 10 }}>
            <Grid item xs={12}>
                <Box style={{ height: 440 }}>
                    <Box style={{ height: 440 }}>
                        <SelectTable<Survey>
                            heads={heads}
                            elements={surveys}
                            selected={surveyFrequencyFormValues.surveys.map(({ id }) => id)}
                            setSelected={handleSelect}
                            endCell={() => (<BaseTableCell align="right" padding="none" />)}
                            endActions={<TableCell style={{ display: 'none' }} />}
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
                        justifyContent: 'left'
                    }}>
                        <Box>
                            {edit && (
                                <DirectionalButton
                                    disabled={enableReset}
                                    onClick={handleReset}
                                    text={t("StrategyFlowPage.StrategyCreationSurveyView.resetStep")}
                                    variant="text"
                                ></DirectionalButton>
                            )}
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
                                text={t("StrategyFlowPage.StrategyCreationSurveyView.back")}
                                variant="outlined"
                            ></DirectionalButton>
                        </Box>
                        <Box style={{
                            marginLeft: 10,
                        }}>
                            <DirectionalButton
                                onClick={handleNext}
                                disabled={Boolean(surveyFrequencyFormValues.surveys.length === 0)}
                                text={t("StrategyFlowPage.StrategyCreationSurveyView.next")}
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

export default StrategyCreationSurveyView;