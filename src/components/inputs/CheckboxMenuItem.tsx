import React, {useEffect, useState} from "react";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import { FieldObject } from "../dialogs/ExportDialog";
interface CheckboxMenuItemProps {
    name: string;
    id: string;
    tagsObj: FieldObject[]
}

export const CheckboxMenuItem: React.FC<CheckboxMenuItemProps> =
    ({name, id, tagsObj}) => {
        const [checked, setChecked] = useState<boolean>(false)
        useEffect(() => {
            setChecked(tagsObj.find(x => x.id === id)?.checked ?? false)
        })
        const handleClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
            const id = event.currentTarget.dataset.tagId;
            if (id) {
                if (!checked) {
                    setChecked(true);
                    tagsObj.push({id: id, checked: true})
                } else {
                    setChecked(false);
                    const index = tagsObj.findIndex(x => x.id === id)
                    if (index > -1) {
                        tagsObj.splice(index, 1);
                    }
                }
            }
        }
        return (
            <MenuItem data-tag-id={id} onClick={handleClick} key={id} value={id}>
                <Checkbox
                    checked={checked}
                />
                <ListItemText primary={name}/>
            </MenuItem>
        )
    }
export default CheckboxMenuItem