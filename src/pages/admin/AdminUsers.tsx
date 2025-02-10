import React, {useState} from 'react';
import {Box, Container} from "@material-ui/core";
import HeadItem from "../../components/tables/HeadItem";
import BasePageToolbar from "../../components/containers/BasePageToolbar";
import BaseTable from "../../components/tables/BaseTable";
import {nameSearchFilter} from "../../lib/list/searchFilter";
import {useAdminQuery} from "../../hooks/useAdminQuery";
import {OverviewUser, overviewUserSearchFilter} from "../../models/AuthUser";
import Chip from "@material-ui/core/Chip";
import renderPhoneNumber from "../../lib/string/renderPhoneNumber";
import {Link} from "react-router-dom";
import Routes from "../../constants/Routes";

const heads: HeadItem<OverviewUser>[] = [
    {id: "name", numeric: false, disablePadding: false, label: "Navn"},
    {id: "projects", label: "Projekter", render: e => e.projects.map(p => p.name).join(", ")},
    {id: "email", label: "Email"},
    {id: "phoneNumber", label: "Telefonnr.", render: e => renderPhoneNumber(e.phoneNumber)},
    {
        id: "isAdmin",
        label: "Sysadmin",
        render: e => e.isAdmin ? <Chip color="primary" label="ADMIN"/> : null
    },
];

const AdminUsers = () => {
    const adminQuery = useAdminQuery();
    const [search, setSearch] = useState<string>('');
    const filteredUsers: OverviewUser[] = (adminQuery.elements?.users ?? []).filter(overviewUserSearchFilter(search));

    return (
        <Container>
            <Box pt={4} pb={4}>
                <Link to={Routes.adminProjects}>
                    Projekter
                </Link>

                <BasePageToolbar
                    search={search}
                    onSearch={setSearch}
                />
                <div style={{height: 16}}/>
                <BaseTable<OverviewUser>
                    heads={heads}
                    elements={filteredUsers}

                />
            </Box>
        </Container>
    )
}

export default AdminUsers;