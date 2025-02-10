import { Box, Tooltip } from "@material-ui/core";
import React, { useState } from "react";
import { isDevelopmentMode, isLocalhostMode } from "../../../../services/appServices";
import ProjectPatient from "../../../../models/ProjectPatient";
import { useAppServices } from "../../../../providers/appServiceProvider";
import { Survey } from "../../../../models/Survey";
import HeadItem from "../../../../components/tables/HeadItem";
import SelectTable from "../../../../components/tables/SelectTable";
import { BaseTableCell } from "../../../../components/tables/BaseTableCell";
import DisabledTooltip from "../../../../components/feedback/DisabledTooltip";
import FeedbackButton from "../../../../components/buttons/FeedbackButton";
import SurveyLineIcon from "remixicon-react/SurveyLineIcon";
import SendPlaneFillIcon from "remixicon-react/SendPlaneFillIcon";
import { useAuth } from "../../../../providers/authProvider";
import { useTranslation } from "react-i18next";
import { theme } from "../../../../constants/theme";

interface SurveyRowProps {
    patient: Required<ProjectPatient>;
    surveys: Survey[];
}

const renderSurveyChip = (survey: Survey) =>
    <Box display="flex" maxWidth="160px" flexWrap="wrap">
        {survey.notification?.surveys?.map((val) => {
            if (val.id === survey.id && survey.notification?.answeredAt === null) return (
                <span>{new Date(survey.notification.sendOutDate ?? Date.now())?.toLocaleDateString()}</span>
            )
        })}
    </Box>


const SurveyTable: React.FC<SurveyRowProps> = ({ patient, surveys }) => {
    const patientsService = useAppServices().projectPatients(patient.parentId);
    const [selected, setSelected] = useState<Survey[]>([]);
    const { t } = useTranslation();

    const handleSelect = (sel: string[]) => setSelected(surveys.filter(s => sel.includes(s.id)));

    const handleSendSurvey = async () => {
        const code = await patientsService.sendSurveyCode(patient.id, patient.strategyId, selected);
        setSelected([]);
        if (isDevelopmentMode || isLocalhostMode) console.log(code);
        return code;
    };

    const handleCreateSurvey = async () => {
        const code = await patientsService.createSurveyCode(patient.id, patient.strategyId, selected);
        setSelected([]);
        if (isDevelopmentMode || isLocalhostMode) console.log(code);
        if (!code.success) return code;
        window.open(`${window.location.protocol}//${window.location.host}/s/${code.value.id}`, '_blank');
        return code;
    };

    const heads: HeadItem<Survey>[] = [
        { id: "name", numeric: false, disablePadding: false, label: t("CitizenPage.name") },
        { id: "notification", numeric: false, disablePadding: false, label: t("CitizenPage.sent"), render: renderSurveyChip },
    ];
    console.log(surveys);

    return (
        <SelectTable<Survey>
            heads={heads}
            elements={surveys}
            selected={selected.map(s => s.id)}
            setSelected={handleSelect}
            initialOrderKey=''
            endActions={(
                <>
                    <DisabledTooltip title={t("CitizenPage.inactiveCitizen")} disabled={!patient.isActive}>
                        <FeedbackButton
                            icon={SurveyLineIcon}
                            onClick={handleCreateSurvey}
                            success={t("CitizenPage.submissionCreated")}
                            disabled={selected.length === 0}
                            style={{
                                marginRight: 8,
                                backgroundColor: selected.length === 0 ? theme.custom.cream : theme.custom.CallToActionIconText,
                                color: selected.length === 0 ? theme.custom.CallToActionIconText : theme.custom.CallToActionIconBG,
                                cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {t("CitizenPage.answerButton")}
                        </FeedbackButton>
                    </DisabledTooltip>
                    {patient.isActive ? (
                        (!patient.email && !patient.phoneNumber) ? (
                            <Tooltip title={t("CitizenPage.citizenNoPhoneEmail")}>
                                <span>
                                    <FeedbackButton
                                        icon={SendPlaneFillIcon}
                                        onClick={handleSendSurvey}
                                        success={t("CitizenPage.surveySent")}
                                        disabled={selected.length === 0 || (!patient.email && !patient.phoneNumber)}
                                        style={{
                                            backgroundColor: (selected.length === 0 || (!patient.email && !patient.phoneNumber))
                                                ? theme.custom.cream
                                                : theme.custom.CallToActionIconText,
                                            color: (selected.length === 0 || (!patient.email && !patient.phoneNumber))
                                                ? theme.custom.CallToActionIconText
                                                : theme.custom.CallToActionIconBG,
                                            cursor: (selected.length === 0 || (!patient.email && !patient.phoneNumber))
                                                ? 'not-allowed'
                                                : 'pointer',
                                        }}
                                    >
                                        {t("CitizenPage.sendButton")}
                                    </FeedbackButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <FeedbackButton
                                icon={SendPlaneFillIcon}
                                onClick={handleSendSurvey}
                                success={t("CitizenPage.surveySent")}
                                disabled={selected.length === 0 || (!patient.email && !patient.phoneNumber)}
                                style={{
                                    backgroundColor: selected.length === 0 ? theme.custom.cream : theme.custom.CallToActionIconText,
                                    color: selected.length === 0 ? theme.custom.CallToActionIconText : theme.custom.CallToActionIconBG,
                                    cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {t("CitizenPage.sendButton")}
                            </FeedbackButton>
                        )
                    ) : (
                        <Tooltip title={t("CitizenPage.inactiveCitizen")}>
                            <span>
                                <FeedbackButton
                                    icon={SendPlaneFillIcon}
                                    onClick={handleSendSurvey}
                                    success={t("CitizenPage.surveySent")}
                                    disabled={selected.length === 0 || !patient.isActive}
                                    style={{
                                        backgroundColor: selected.length === 0 ? theme.custom.cream : theme.custom.CallToActionIconText,
                                        color: selected.length === 0 ? theme.custom.CallToActionIconText : theme.custom.CallToActionIconBG,
                                        cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {t("CitizenPage.sendButton")}
                                </FeedbackButton>
                            </span>
                        </Tooltip>
                    )}
                </>
            )}
            endCell={() => (<BaseTableCell align="right" padding="normal" />)}
        />
    );
};

export default SurveyTable;
