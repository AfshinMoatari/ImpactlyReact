import { Box, IconButton } from "@material-ui/core";
import AddLineIcon from "remixicon-react/AddLineIcon";
import React from "react";
import theme from "../../../constants/theme";

interface ModuleCardProps {
    onClick: () => void;
}

const AddModuleCard: React.FC<ModuleCardProps> = ({ onClick }) => {
    return (
        <div style={{ background: theme.custom.backgroundColor }}>
            <Box
                onClick={onClick}
                style={{
                    height: '100%',
                    minHeight: 240,
                    display: 'flex',
                    border: `1px dashed ${theme.palette.primary.main}`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    cursor: 'pointer',
                    backgroundImage: `linear-gradient(45deg, transparent 41.67%,${theme.palette.primary.light} 41.67%, ${theme.palette.primary.light}, transparent 50%, transparent 91.67%, ${theme.palette.primary.light} 91.67%, ${theme.palette.primary.light} 100%)`,
                    backgroundSize: '8.49px 8.49px'
                }}>
                <IconButton style={{
                    background: 'white',
                    border: 'solid 1px rgba(0,0,0,0.1)',
                    boxShadow: '0 2px 3px rgba(0,0,0,.09)'
                }}>
                    <AddLineIcon color={theme.palette.primary.main} />
                </IconButton>
            </Box>
        </div>
    )
}


export default AddModuleCard;
