class Permissions {
    static readonly policyName = "permissions";
    // ADMIN
    static readonly admin = "Permissions.Admin.All";

    // USERS
    static readonly usersRead = "Permissions.Users.Read";
    static readonly usersWrite = "Permissions.Users.Write";

    // SETTINGS
    static readonly settingsRead = "Permissions.Settings.Read";
    static readonly settingsWrite = "Permissions.Settings.Write";
}

export class Roles {
    static readonly standardRole = "standard";
    static readonly superRole = "super";
    static readonly administratorRole = "administrator"
}

export const checkPermission = (need: string, actual: { permissions: string[] } | string[] | undefined ): boolean => {
    if (actual === undefined) return false;

    const permissions = Array.isArray(actual) ? actual : actual.permissions;
    if (permissions.includes(Permissions.admin)) return true;

    return permissions.includes(need);
}

export default Permissions;
