import React, { useState } from 'react';
import {Select, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, useTheme, MenuItem} from '@material-ui/core';
import {useCrudListQuery} from "../../../hooks/useCrudListQuery";


export interface CopySurveyDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (id: string) => void;
}

const CopySurveyDialog : React.FC<CopySurveyDialogProps> = ({open, onClose, onConfirm}) => {
    const projects = useCrudListQuery(services => services.projects);
    const [value, setValue] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>, child: React.ReactNode) => {
        setValue(e.target.value as string);
    };

    const onSubmitClick = () =>{
        if(value){
            onConfirm(value);
        }
    }
  
    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={onClose}
        >
            <Typography variant="h2" style={{padding: "8px 16px"}}>Vælg projekt du vil kopiere spørgeskemaet til</Typography>
            <DialogContent>
            <Select onChange={handleChange}>
                { projects.elements.map(project => <MenuItem value={project.id}>{project.name}</MenuItem>)}
            </Select>
            </DialogContent>
            <DialogActions
                style={{
                    background: '#FDF7EC',
                    marginTop: 8,
                    padding: '4px 8px'
                }}
            >
                <Button size="large" onClick={onClose}
                        style={{fontWeight: 600, color: '#5f6368'}}>
                    Annuller
                </Button>
                <Button
                    size="large"
                    type='submit'
                    aria-label="submit"
                    onClick={onSubmitClick}
                    color={"primary"}
                    style={{fontWeight: 600}}
                >
                    Kopier spørgeskema
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default CopySurveyDialog;