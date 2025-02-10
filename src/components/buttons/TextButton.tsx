import Button, {ButtonProps} from "@material-ui/core/Button";
import React from "react";

const TextButton: React.FC<ButtonProps> = ({children, ...props}) => {

    return (
        <Button variant="text" {...props}>
            {children}
        </Button>
    )
}

export default TextButton;

