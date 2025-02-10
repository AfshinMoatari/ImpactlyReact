import React, { useState } from "react";
import { Box, Container, Typography } from "@material-ui/core";
import { useParams } from "react-router-dom";
import { useAppServices } from "../providers/appServiceProvider";
import Report, { breakpoints as bps, columns as cols } from "../models/Report";
import ModulePaper from "../components/containers/ModulePaper";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useQuery } from "react-query";
import { EmptyConditionElement } from "../components/containers/EmptyCondition";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const ExternalReport: React.FC = () => {

    const { reportCode } = useParams<{ reportCode: string | undefined }>();
    const services = useAppServices();
    const [error, setError] = useState<string>()

    const reportQuery = useQuery<Report | unknown>({
        queryKey: reportCode,
        queryFn: async () => {
            if (!reportCode) return;
            const res = await services.reports.readReportFromCode(reportCode);
            if (!res.success) return setError(res.feedback.message)
            return res.value
        },
        refetchInterval: 20000,
        staleTime: Infinity,
        cacheTime: Infinity
    });

    return (
        <EmptyConditionElement<Report>
            isLoading={reportQuery.isLoading}
            data={reportQuery.data}
            empty={
                <Box
                    pl={1}
                    pr={1}
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    height='100vh'
                >
                    <h3 style={{ fontWeight: 500, textAlign: 'center', fontSize: '2em' }}>
                        {error}</h3>
                </Box>
            }
        >
            {(report) =>
                <Container maxWidth='lg'>
                    <Box pt={1} pb={2}>
                        <Typography variant="h2">
                            {report.name}
                        </Typography>
                    </Box>
                    <ResponsiveReactGridLayout
                        className="layout"
                        breakpoints={bps}
                        cols={cols}
                        rowHeight={80}
                        layouts={report?.layouts}
                        isDraggable={false}
                        isResizable={false}
                    >
                        {report?.moduleConfigs.map(config =>
                            <ModulePaper key={config.layout.i} config={config} isShared={true} />
                        )}
                    </ResponsiveReactGridLayout>
                </Container>
            }
        </EmptyConditionElement>
    )
}

export default ExternalReport;
