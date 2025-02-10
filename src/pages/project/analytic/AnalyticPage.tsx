import React, { useState, useEffect } from "react";
import { EmptyButtonView } from "../../../components/containers/EmptyView";
import { useProjectCrudQuery } from "../../../hooks/useProjectQuery";
import { EmptyConditionElement } from "../../../components/containers/EmptyCondition";
import { useParams } from "react-router-dom";
import { Box } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import LoadingOverlay from "../../../components/feedback/LoadingOverlay";

export const AnalyticPage = () => {
    const { analyticId } = useParams<{ analyticId: string }>();
    const analyticQuery = useProjectCrudQuery(analyticId, service => service.projectAnalytics);
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchPdfUrl = async () => {
            try {
                setIsLoading(true);
                const analytic = analyticQuery.value;
                if (analytic && analytic.downloadURL) {
                    setPdfUrl(analytic.downloadURL);
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error fetching PDF URL:", error);
                setIsLoading(false);
            }
        };

        fetchPdfUrl();
    }, [analyticQuery.value]);

    const handlePdfLoad = () => {
        setIsLoading(false);
    };

    return (
        <>
            {isLoading && <LoadingOverlay />}

            <EmptyConditionElement
                isLoading={analyticQuery.query.isLoading}
                data={analyticQuery.value}
                empty={
                    <EmptyButtonView
                        title={t('AnalyticPage.noAnalytic')}
                        subTitle={t('AnalyticPage.expiredAnalytic')}
                    />
                }
            >
                {(analytic) => (
                    <Box width="100%" height="calc(100vh - 20px)" display="flex" justifyContent="center" alignItems="center">
                        {pdfUrl ? (
                            <iframe
                                src={pdfUrl}
                                width="100%"
                                height="100%"
                                title="PDF"
                                style={{ border: "none" }}
                                scrolling="no"
                                onLoad={handlePdfLoad}
                            ></iframe>
                        ) : (
                            <EmptyButtonView
                                title={t('AnalyticPage.noAnalytic')}
                                subTitle={t('AnalyticPage.expiredAnalytic')}
                            />
                        )}
                    </Box>
                )}
            </EmptyConditionElement>
        </>
    );
};

export default AnalyticPage;
