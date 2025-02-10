import RequestFeedback from "./ResponseFeedback";

export const HttpFeedbackMap: { [p: string]: RequestFeedback } = {
    200: {
        severity: 'success',
        errorCode: 'success/ok',
        message: 'Success', // 'OK',
    },
    201: {
        severity: 'success',
        errorCode: 'success/created',
        message: 'Succesfuldt oprettet', // 'Created',

    },
    202: {
        severity: 'success',
        errorCode: 'success/accepted',
        message: 'Succesfuldt accepteret', // 'Accepted',
    },
    400: {
        severity: 'warning',
        errorCode: 'client/bad-request',
        message: 'Der skete noget, der ikke fungerede', // 'Bad Request',
    },
    401: {
        severity: 'warning',
        errorCode: 'client/unauthorized',
        message: 'Du har ikke den rigtige tilladelse', // 'Unauthorized',
    },
    402: {
        severity: 'warning',
        errorCode: 'client/payment-required',
        message: 'Betaling er påkrævet', // 'Payment Required',
    },
    403: {
        severity: 'warning',
        errorCode: 'client/forbidden',
        message: 'Du har ikke tilladelse til denne handling',
    },
    404: {
        severity: 'warning',
        errorCode: 'client/not-found',
        message: 'Der var noget her, som ikke blev fundet', // 'Not Found',
    },
    408: {
        severity: 'error',
        errorCode: 'client/request-timeout',
        message: 'Vi kunne ikke oprette forbindelse til serveren, prøv igen',
    },
    426: {
        severity: 'warning',
        errorCode: 'client/update-required',
        message: 'Opdatering påkrævet', // 'Update Required',
    },
    429: {
        severity: 'warning',
        errorCode: 'client/too-many-requests',
        message: 'For mange handlinger', // 'Too Many Requests',
    },
    451: {
        severity: 'warning',
        errorCode: 'client/unavailable-for-legal-reasons',
        message: 'Ikke tilgængelig pga. juridiske årsager', // 'Unavailable For Legal Reasons',
    },
    500: {
        severity: 'error',
        errorCode: 'server/internal-server-error',
        message: 'Serverfejl', // 'Internal Server Error',
    },
    501: {
        severity: 'error',
        errorCode: 'server/not-implemented',
        message: 'Serverfejl: Ikke implementeret', // 'Not Implemented',
    },
    502: {
        severity: 'error',
        errorCode: 'server/bad-gateway',
        message: 'Serverfejl: Dårlig gateway', // 'Bad Gateway',
    },
    503: {
        severity: 'error',
        errorCode: 'server/service-unavailable',
        message: 'Service er ikke tilgængelig', // 'Service Unavailable',
    },
    504: {
        severity: 'error',
        errorCode: 'server/gateway-timeout',
        message: 'Server timeout', // 'Gateway Timeout',
    },
    505: {
        severity: 'error',
        errorCode: 'server/http-version-not-supported',
        message: 'Server fejl: HTTP version ikke supporteret', // 'HTTP Version Not Supported',
    },
    511: {
        severity: 'error',
        errorCode: 'server/network-authentication-required',
        message: 'Serverfejl: Netværksgodkendelse påkrævet', // 'Network Authentication Required',
    }

};

export default HttpFeedbackMap;
