import React from "react";
import {QueryClient, QueryClientProvider} from "react-query";
import {AppServiceProvider} from "./appServiceProvider";
import {AuthProvider} from "./authProvider";
import {ReactQueryDevtools} from "react-query/devtools";
import {AppSnackbarProvider} from "./snackbarProvider";

const queryClient = new QueryClient();

export const AppQueryProvider: React.FC = ({children}) =>
    <AppSnackbarProvider>
        <AppServiceProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    {children}
                </AuthProvider>
                <ReactQueryDevtools position='bottom-right'/>
            </QueryClientProvider>
        </AppServiceProvider>
    </AppSnackbarProvider>
