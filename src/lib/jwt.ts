import Permissions from "../constants/Permissions";
import { Buffer } from 'buffer';

export const parseJwt = (token?: string): Record<string, string | string[]> | undefined => {
    if (!token) return;
    let base64Payload = token.split('.')[1];
    let payload = Buffer.from(base64Payload, 'base64');
    return JSON.parse(payload.toString());
}

export const parseJwtPermissions = (parsedJwt: Record<string, string | string[]>): string[] => {
    const permissions = parsedJwt[Permissions.policyName];
    if (permissions === undefined) return [];
    return Array.isArray(permissions) ? permissions : [permissions];
}
