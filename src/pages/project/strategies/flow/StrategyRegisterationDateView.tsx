import React, { ChangeEvent } from "react";
import { Grid, Box } from "@material-ui/core";
import DirectionalButton from "../../../../components/buttons/NextButton";
import { BatchSendoutRegistration } from "../../../../models/Registration";
import { PStatusRegistration, ProjectRegistration } from "../../../../models/Strategy";
import { KeyboardDatePicker } from "@material-ui/pickers";
import SelectDropDown from "../../../../components/inputs/SelectDropDown";
import {useTranslation} from "react-i18next";

interface StrategyRegisterationDateProps {
    batchRegistrationData: BatchSendoutRegistration;
    setBatchRegistrationData: (data: any) => void;
    activeStep: number;
    setActiveState: (data: number) => void;
    effects: ProjectRegistration[];
}

const StrategyRegisterationDateView: React.FC<StrategyRegisterationDateProps> = ({
                                                                                     setActiveState,
                                                                                     batchRegistrationData,
                                                                                     setBatchRegistrationData,
                                                                                     activeStep,
                                                                                     effects
                                                                                 }) => {
    const { t } = useTranslation();

    const options: {[key: string]: string} = { }
    if(effects && effects.length > 0){
        effects.map(e => {
            options[e.id] = e.name
        });
    }

    const handleNext = async () => {
        setActiveState(activeStep += 1)
    };
    const handlePrev = async () => {
        setActiveState(activeStep -= 1);
    };
    const handleDateChange = (date: Date | null) => {
        if(date != null){
            batchRegistrationData.patientRegistrationDataGrid.forEach(p => {
                p.date = date as Date
            });
        }
        setBatchRegistrationData({
            ...batchRegistrationData,
            registrationDate: date,
            patientRegistrationDataGrid: batchRegistrationData.patientRegistrationDataGrid
        });
    }
    const handleEffectChange  = (event: ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
        if(event.target.value as string != ''){
            batchRegistrationData.patientRegistrationDataGrid.forEach(p => {
                p.effectId = event.target.value as string;
                p.effectName = (effects.find(e => e.id === event.target.value as string) as ProjectRegistration).name;
                p.now = effects.find(e => e.id === event.target.value as string) as PStatusRegistration;
            });
        }
        const id = event.target.value as string;
        setBatchRegistrationData({
            ...batchRegistrationData,
            effectId: id,
            patientRegistrationDataGrid: batchRegistrationData.patientRegistrationDataGrid
        });
    }

    const IsValidData = (batchRegistrationData: BatchSendoutRegistration): boolean => {
        if(batchRegistrationData == null) return true;
        if(effects[0]?.type != "numeric" && effects[0]?.type != "count"){
            if(batchRegistrationData.effectId == '') return true;
            if(batchRegistrationData.registrationDate == null) return true;
        }else{
            if(batchRegistrationData.registrationDate == null) return true;
        }
        return false;
    }

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            xs={12}
            style={{gap: 15}}>
            <Grid item xs={12}>
                <Box style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <KeyboardDatePicker
                        variant="static"
                        margin="normal"
                        fullWidth={true}
                        label={t("RegistrationFlowPage.AddDate.registrationDate")}
                        format="MM/dd/yyyy"
                        value={batchRegistrationData.registrationDate}
                        onChange={(date) => handleDateChange(date)}
                        KeyboardButtonProps={{
                            'aria-label': t("RegistrationFlowPage.AddDate.changeDate"),
                        }}
                    />
                    {(effects[0]?.type != "numeric" && effects[0]?.type != "count") &&
                        <Box style={{width: '100%', margin: '5px 0 10px 0'}}>
                            <SelectDropDown
                                defaultValue={batchRegistrationData?.effectId}
                                options={options}
                                label={t("RegistrationFlowPage.AddDate.registrationValue")}
                                onChange={handleEffectChange}
                                disabled={false}
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
                        justifyContent: 'left'
                    }}>
                    </Box>
                    <Box style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'right'
                    }}>
                        <Box>
                            <DirectionalButton
                                onClick={handlePrev}
                                text={t("RegistrationFlowPage.AddDate.back")}
                                variant="outlined"
                            ></DirectionalButton>
                        </Box>
                        <Box style={{
                            marginLeft: 10,
                        }}>
                            <DirectionalButton
                                onClick={handleNext}
                                disabled={IsValidData(batchRegistrationData)}
                                text={t("RegistrationFlowPage.AddDate.next")}
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

export default StrategyRegisterationDateView;
