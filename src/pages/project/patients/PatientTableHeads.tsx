import React from "react";
import HeadItem from "../../../components/tables/HeadItem";
import ProjectPatient from "../../../models/ProjectPatient";
import AvatarName from "../../../components/AvatarName";
//import MailFillIcon from "remixicon-react/MailFillIcon";
//import PhoneFillIcon from "remixicon-react/PhoneFillIcon";
import { Box, Chip } from "@material-ui/core";
import theme from "../../../constants/theme";
import TagChip from "../../../components/TagChip";
import toAge from "../../../lib/date/toAge";
import { toTimeAgo } from "../../../lib/date/toTimeAgo";
import { Trans } from 'react-i18next';
import MailFillIcon from "remixicon-react/MailFillIcon";
import PhoneFillIcon from "remixicon-react/PhoneFillIcon";



const renderStatusChip = (pp: ProjectPatient) =>
    <Chip
        label={pp.isActive ? <Trans i18nKey="PatientTableHeads.active" /> : <Trans i18nKey="PatientTableHeads.inactive" />}
        color={pp.isActive ? "secondary" : "primary"}
    />


const renderTagChips = (pp: ProjectPatient) =>
    <Box display="flex" width="100%" flexWrap="wrap">
        {pp.tags?.map((tag) =>
            <TagChip key={tag.id} tag={tag} size="small" />)
        }
    </Box>

const renderLastAnswered = ({ lastAnswered }: ProjectPatient) => {
    if (lastAnswered === undefined || new Date(lastAnswered).getTime() < 0) return "";
    return toTimeAgo(lastAnswered);
}

export const patientTableHeads: HeadItem<ProjectPatient>[] = [
    { id: "name", numeric: false, disablePadding: false, label: <Trans i18nKey="PatientTableHeads.name" />, render: AvatarName },
    { id: "sex", numeric: false, disablePadding: false, label: <Trans i18nKey="PatientTableHeads.gender" /> },
    { id: "birthDate", numeric: false, disablePadding: false, label: <Trans i18nKey="PatientTableHeads.age" />, render: (e) => toAge(e.birthDate) },
    { id: "municipality", numeric: false, disablePadding: false, label: <Trans i18nKey="PatientTableHeads.municipality" /> },
    { id: "lastAnswered", numeric: false, disablePadding: false, label: <Trans i18nKey="PatientTableHeads.lastAnswered" />, render: renderLastAnswered },
    { id: "strategyName", label: <Trans i18nKey="PatientTableHeads.strategy" /> },
    { id: "isActive", label: <Trans i18nKey="PatientTableHeads.status" />, render: renderStatusChip },
    { id: "tags", numeric: false, label: <Trans i18nKey="PatientTableHeads.tags" />, render: renderTagChips }
];