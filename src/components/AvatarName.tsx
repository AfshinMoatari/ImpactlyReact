import {Avatar, Box} from "@material-ui/core";
import React from "react";
import {UserIdentification} from "../models/AuthUser";
import theme from "../constants/theme";

const AvatarName = (e: UserIdentification) => {
    return (
        <Box
            display='flex'
            alignItems='center'
        >
            <Avatar
                style={{
                    width: 35,
                    height: 35,
                    marginRight: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: theme.custom.avatarTextColor,
                    backgroundColor: theme.custom.palePrimary,
                }}

            >
                    {e.name.toUpperCase()[0]}
            </Avatar>
            {e.name}
        </Box>
    )
}

export default AvatarName;