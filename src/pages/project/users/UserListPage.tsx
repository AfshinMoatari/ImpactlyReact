import HeadItem from "../../../components/tables/HeadItem";
import React, { useState } from "react";
import ProjectUser, { projectUserSearchFilter } from "../../../models/ProjectUser";
import UserCrudDialog from "./UserCrudDialog";
import { useProjectCrudListQuery } from "../../../hooks/useProjectQuery";
import renderPhoneNumber from "../../../lib/string/renderPhoneNumber";
import AvatarName from "../../../components/AvatarName";
import { EmptyConditionElements } from "../../../components/containers/EmptyCondition";
import BasePageToolbar from "../../../components/containers/BasePageToolbar";
import { CreateButton } from "../../../components/buttons/CreateButton";
import BaseTable from "../../../components/tables/BaseTable";
import EmptyButtonView from "../../../components/containers/EmptyView";
import { BaseTableCell } from "../../../components/tables/BaseTableCell";
import ColoredIconButton from "../../../components/buttons/ColoredIconButton";
import { useAppServices } from "../../../providers/appServiceProvider";
import { useAuth } from "../../../providers/authProvider";
import { Tooltip } from "@material-ui/core";
import Permissions, { checkPermission, Roles } from "../../../constants/Permissions";
import HomeBasePage from "../home/HomeBasePage";
import snackbarProvider from "../../../providers/snackbarProvider";
import { isErrorResponse } from "../../../models/rest/RestResponse";
import UserLineIcon from "remixicon-react/UserLineIcon";
import TableCell from "@material-ui/core/TableCell";
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import EditButton from "../../../components/buttons/EditButton";
import FeedbackButton from "../../../components/buttons/FeedbackButton";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

const roleMap: { [p: string]: string } = {
    [Roles.superRole]: "Super",
    [Roles.standardRole]: "Standard",
    [Roles.administratorRole]: "Administrator",
}

const heads = (t: TFunction): HeadItem<ProjectUser>[] => [
    {
        id: "firstName",
        numeric: false,
        disablePadding: false,
        label: t('Users.name'),
        render: AvatarName,
    },
    {
        id: "email",
        numeric: false,
        disablePadding: false,
        label: t('Users.email')
    },
    {
        id: "phoneNumber",
        numeric: false,
        disablePadding: false,
        label: t('Users.phoneNumber'),
        render: e => renderPhoneNumber(e.phoneNumber)
    },
    {
        id: "roleId",
        numeric: false,
        label: t('Users.roleType'),
        render: u => u.roleId !== undefined ? roleMap[u.roleId] : ""
    },
];

export const UserListPage = () => {
    const projectUsers = useProjectCrudListQuery(service => service.projectUsers);
    const auth = useAuth();
    const userService = useAppServices().projectUsers(auth.currentProjectId);
    const currentUserRole = projectUsers?.elements.find((x) => x.id === auth.currentUser?.id)?.roleId
    const { t } = useTranslation();

    const [search, setSearch] = useState<string>('');
    const filteredUsers: ProjectUser[] = projectUsers.elements.filter(projectUserSearchFilter(search));

    const [element, setElement] = useState<Partial<ProjectUser>>();
    const handleCreateClick = () => setElement({ roleId: Roles.standardRole });

    const handleEditUserClick = (e: React.MouseEvent<HTMLTableRowElement>, rowId: string) => {
        const projectUser = projectUsers.elements.find(pu => pu.id === rowId);

        if (projectUser && (currentUserRole === Roles.administratorRole || projectUser.roleId !== Roles.administratorRole)) {
            setElement(projectUser);
        }
    };

    const handleInvite = (userId: string) => async (e: React.MouseEvent) => {
        return await userService.invite(userId);
    }

    const handleSubmit = async (values: Partial<ProjectUser>) => {
        if (values?.id) return await projectUsers.update(values as ProjectUser);

        const res = await projectUsers.create(values)
        if (!isErrorResponse(res)) snackbarProvider.success(t('Users.colleagueInvited'));
    }

    const handleDelete = async (id: string) => {
        if (id) await projectUsers.delete(id);
        setElement(undefined);
    }

    const handleClose = () => setElement(undefined);

    const endCellAction = (pu: ProjectUser) => (
        <BaseTableCell align="right" padding="normal">
            {(currentUserRole !== Roles.superRole || pu.roleId !== Roles.administratorRole) && <EditButton />}
            <Tooltip style={{ marginLeft: "10px" }} title={t('Users.resendInvitation')}>
                <span>
                    <ColoredIconButton
                        flat={true}
                        inverse={true}
                        style={{ width: 35, height: 35, padding: 8, marginRight: 4 }}
                    >
                        <FeedbackButton
                            style={{ marginRight: 8 }}
                            icon={ShareOutlinedIcon}
                            onClick={handleInvite(pu.id)}
                            success={t("Users.snackbarSuccess")}
                        />
                    </ColoredIconButton>
                </span>
            </Tooltip>
        </BaseTableCell>
    )

    const createPermission = checkPermission(Permissions.usersWrite, auth);

    return (
        <HomeBasePage actions={(
            <BasePageToolbar
                search={projectUsers.elements.length > 0 ? search : undefined}
                onSearch={projectUsers.elements.length > 0 ? setSearch : undefined}
                actionEnd={projectUsers.elements.length > 0 &&
                    <CreateButton style={{ borderRadius: '32px', width: '92px' }} text={t('Users.create')}
                        onClick={handleCreateClick} />}
            />
        )}>
            <EmptyConditionElements<ProjectUser>
                isLoading={projectUsers.query.isLoading}
                data={filteredUsers}
                empty={(
                    <EmptyButtonView
                        title={t('Users.noUsers')}
                        icon={UserLineIcon}
                        subTitle={t('Users.noUsersOnProject')}
                        buttonText={t('Users.createUser')}
                        onClick={handleCreateClick}
                    />
                )}
            >
                {(users) =>
                    <BaseTable<ProjectUser>
                        heads={heads(t)}
                        elements={users}
                        endActions={createPermission && <TableCell style={{ background: 'none', display: 'none' }} />}
                        onClick={createPermission && handleEditUserClick}
                        endCell={createPermission && endCellAction}
                    />
                }
            </EmptyConditionElements>
            <UserCrudDialog
                user={element}
                onSubmit={handleSubmit}
                onClose={handleClose}
                onDelete={handleDelete}
            />
        </HomeBasePage>
    )
}
export default UserListPage;