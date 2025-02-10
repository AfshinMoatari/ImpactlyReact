import { EmptyConditionElement } from "../../components/containers/EmptyCondition";
import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { useAppServices } from "../../providers/appServiceProvider";
import SurveyCode from "../../models/codes/SurveyCode";
import EmotionHappyLineIcon from "remixicon-react/EmotionHappyLineIcon";
import EmotionUnhappyLineIcon from "remixicon-react/EmotionUnhappyLineIcon";
import AnswerSurveyView from "./AnswerSurveyView";
import snackbarProvider from "../../providers/snackbarProvider";
import { EntryBatch, Survey } from "../../models/Survey";
import history from "../../history";
import { Prompt } from "react-router";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import { useTranslation } from "react-i18next";

const SurveyAnswerPage: React.FC = () => {
    const services = useAppServices();
    const { surveyCode } = useParams<{ surveyCode: string }>();
    const [error, setError] = useState<string>("")
    const [success, setSuccess] = useState<boolean>(false)
    const { t } = useTranslation();

    const surveyQuery = useQuery<SurveyCode | unknown>({
        queryKey: surveyCode,
        queryFn: async () => {
            if (!surveyCode) return;
            const res = await services.surveys.readSurveyFromCode(surveyCode);
            if (!res.success) return setError(res.feedback.message)
            return res.value
        },
        staleTime: Infinity,
        cacheTime: Infinity
    });

    // Properties seemed to have the right survey order, but the survey list didn't
    // So we use the order in of the survey properties
    const code = surveyQuery.data as SurveyCode;
    const surveys = (code?.properties.map(prop => code.surveys.find(survey => survey.id === prop.id)) ?? []) as Survey[];

    // TODO CREATE REAL FIELD VALIDAITION NOT JUST
    const requiredFields = surveys.map(s => {
        if (s.parentId === "TEMPLATE")
            return s.fields
                .sort((a, b) => a.index - b.index)
                .map(f => ({ ...f, validation: { required: true } }))
        return s.fields
            .sort((a, b) => a.index - b.index)
            .map(f => ({ ...f, validation: { required: false } }))
    }).flat() ?? [];

    // TODO: Sorting by index, should be moved to backend
    const sortedFields = requiredFields
        .map(f => ({ ...f, choices: f.choices.sort((a, b) => a.index - b.index) }));

    const fieldSurveyIdMap = sortedFields.reduce((prev, curr) => {
        prev[curr.id] = curr.parentId;
        return prev;
    }, {} as Record<string, string>)

    const handleSubmit = async (values: EntryBatch) => {
        // TODO: This should be done in the backend
        let entries: any[] = []
        if (Object.getOwnPropertyNames(values).length > 0) {
            entries = [...values.entries];
            for (let i = 0; i < values.entries.length; i++) {
                if (values.entries[i] != null)
                    values.entries[i].fieldIndex = i;
            }
        }

        await new Promise<void>((resolve) => {
            surveys.forEach(async s => {
                const request = {
                    ...values,
                    entries: entries.filter(e =>
                        e !== undefined && fieldSurveyIdMap[e.parentId] === s.id
                    ),
                    surveyId: s.id,
                    codeId: code.id
                }
                const response = await services.surveys.answerSurvey(request);
                if (!response.success) {
                    setError(response.feedback.message)
                    snackbarProvider.showFeedback(response.feedback);
                }
            })
            resolve()
        })

        // TODO
        setSuccess(true);
    }
    useEffect(() => {
        if (lastLocation && !showDialog && confirmedNavigation) {
            history.push(lastLocation)
        }
    })
    const handleConfirmNavigationClick = () => {
        if (lastLocation) {
            setShowDialog(false);
            setConfirmedNavigation(true);
        }
    }
    const showModal = (location: any) => {
        setShowDialog(true);
        setLastLocation(location);
    }

    const closeModal = () => {
        setShowDialog(false);
    }

    const handleBlockedNavigation = (nextLocation: any, action: any) => {
        if (!confirmedNavigation) {
            showModal(nextLocation)
            return false
        }
        return true
    }

    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<boolean>(true);
    const [lastLocation, setLastLocation] = useState(null)
    const [confirmedNavigation, setConfirmedNavigation] = useState<boolean>(false)
    return (
        <div>
            <Prompt
                when={prompt}
                message={handleBlockedNavigation}
            />
            <ConfirmDialog title={t("AnswerSurveyView.continueWithoutSave")} open={showDialog} onClose={closeModal}
                onConfirm={handleConfirmNavigationClick}><span>{t("AnswerSurveyView.areYouSureSave")}</span></ConfirmDialog>

            <EmptyConditionElement<SurveyCode>
                isLoading={surveyQuery.isLoading}
                data={surveyQuery.data}
                empty={
                    <Box
                        pl={1}
                        pr={1}
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        minHeight="100vh"
                    >
                        <h3 style={{ fontWeight: 500, textAlign: 'center', fontSize: '2em' }}>
                            {error}
                        </h3>
                    </Box>
                }
            >
                {(code) =>
                    <>
                        {success &&
                            <Box
                                pl={1}
                                pr={1}
                                display='flex'
                                flexDirection='column'
                                alignItems='center'
                                justifyContent='center'
                                minHeight="100vh"
                            >
                                {error ?
                                    <>
                                        < EmotionUnhappyLineIcon size={60} />
                                        <h3 style={{ fontWeight: 500, textAlign: 'center', fontSize: '2em', whiteSpace: "pre-line" }}>
                                            {t("AnswerSurveyView.ErrorContactSupport")}
                                        </h3>
                                    </>
                                    :
                                    <>
                                        <EmotionHappyLineIcon size={60} />
                                        <h3 style={{ fontWeight: 500, textAlign: 'center', fontSize: '2em' }}>
                                            {t("AnswerSurveyView.thankYouForAnswering")}<br />{t("AnswerSurveyView.wellDone")}<br/>{t("AnswerSurveyView.success")}
                                        </h3>
                                    </>
                                }</Box>
                        }
                        {!success &&
                            <Box
                                display='flex'
                                flexDirection='column'
                                alignItems='center'
                                justifyContent='center'
                                minHeight="100vh"
                            >
                                <AnswerSurveyView
                                    onSubmit={handleSubmit}
                                    code={code}
                                    fields={sortedFields}
                                />
                            </Box>
                        }
                    </>
                }
            </EmptyConditionElement>
        </div>
    )
}

export default SurveyAnswerPage;
