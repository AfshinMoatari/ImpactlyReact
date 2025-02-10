import React, { useState } from "react";
import {Survey} from "../../../../models/Survey";
import SelectTable from "../../../../components/tables/SelectTable";
import HeadItem from "../../../../components/tables/HeadItem";
import { Box, Grid, TableCell, makeStyles } from "@material-ui/core";
import DirectionalButton from "../../../../components/buttons/NextButton";
import { BatchSendoutData } from "../../../../models/cron/Frequency";
import { useQuery } from "react-query";
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import { ProjectStrategyServiceType } from "../../../../services/projectStrategyService";
import BaseTableCell from "../../../../components/tables/BaseTableCell";
import {useTranslation} from "react-i18next";

interface StrategySurveyDialogProps {
    strategyService?: ProjectStrategyServiceType;
    strategyId: string;
    batchSendoutData: BatchSendoutData,
    copyOfBatchSendoutData: BatchSendoutData
    setBatchSendoutData: (data: any) => void;
    activeStep: number,
    setActiveState: (data: number) => void;
    edit: boolean;
}

const StrategySurveyView: React.FC<StrategySurveyDialogProps> = ({
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
    const [isLoading, setIsLoading] = useState(true);

    const surveyQuery = useQuery<Survey[] | any>({
        queryFn: async () => {
            setIsLoading(true);
            try {
                const res = await strategyService?.getStrategySurveys(strategyId);
                if (!res?.success) return ([] as Survey[]);
                return res.value;
            } finally {
                setTimeout(() => {
                    setIsLoading(false);
                }, 200); // 500ms delay
            }
        }
    });
    const [enableReset, toggleEnableReset] = useState(true);

    const heads: HeadItem<Survey>[] = [
        {id: "name", label: t("CommunicationFlowPage.StrategySurveyView.name")}
    ];

    const handleSelect = (surveyIds: string[]) => {
        const surveys = surveyQuery.data.filter((item: any) => surveyIds.includes(item.id));
        setBatchSendoutData({
            ...batchSendoutData,
            surveys: surveys
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
        setBatchSendoutData({
            ...batchSendoutData,
            surveys: copyOfBatchSendoutData.surveys
        });
        toggleEnableReset(true);
    };

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            xs={12}
            style={{gap: 10, width: '700px'}}>
            <Grid item xs={12}>
                <Box style={{height: 440}}>
                    <SelectTable<Survey>
                        endCell={() => (<BaseTableCell align="right" padding="none"/>)}
                        endActions={<TableCell style={{display: 'none'}}/>}
                        heads={heads}
                        elements={surveyQuery.data || []}
                        selected={batchSendoutData.surveys.map(({id}) => id)}
                        setSelected={handleSelect}
                        isLoading={surveyQuery.isLoading || isLoading}
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
                        justifyContent: 'left'
                    }}>
                        <Box>
                            {edit && (
                                <DirectionalButton
                                    disabled={enableReset}
                                    onClick={handleReset}
                                    text={t("CommunicationFlowPage.StrategySurveyView.resetStep")}
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
                                text={t("CommunicationFlowPage.StrategySurveyView.back")}
                                variant="outlined"
                            ></DirectionalButton>
                        </Box>
                        <Box style={{
                            marginLeft: 10,
                        }}>
                            <DirectionalButton
                                onClick={handleNext}
                                disabled={Boolean(batchSendoutData.surveys.length === 0)}
                                text={t("CommunicationFlowPage.StrategySurveyView.next")}
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

export default StrategySurveyView;