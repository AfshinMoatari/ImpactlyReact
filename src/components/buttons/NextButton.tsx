import React from "react";
import Identifyable from "../../models/Identifyable";
import { Button } from "@material-ui/core";

interface DirectionalButtonProps extends Partial<Identifyable>{
    type?: 'submit' | 'reset' | 'button' | undefined;
    text: string;
    onClick: VoidFunction;
    ref?: React.RefObject<HTMLButtonElement>;
    style?: React.CSSProperties;
    disabled?: boolean;
    variant?: 'text' | 'outlined' | 'contained'
}

export const DirectionalButton: React.FC<DirectionalButtonProps> = ({type, text, onClick, ref, style, disabled, variant}) => {

    const handleClick = () => {
        onClick();
        ref?.current?.click && ref.current.click();
    }

    return (
        <Button
        type={type}
        disabled={disabled}
        color='primary'
        variant={variant}
        style={{borderRadius: '32px', minWidth: '92px'}}
        onClick={handleClick}
        >
            {text}
        </Button>
    )
}

export default DirectionalButton;