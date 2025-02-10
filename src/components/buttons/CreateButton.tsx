import React from "react";
import BlueButton from "./BlueButton";
import Identifyable from "../../models/Identifyable";

interface CreateButtonProps extends Partial<Identifyable>{
    text: string;
    onClick: VoidFunction;
    ref?: React.RefObject<HTMLButtonElement>;
    style?: React.CSSProperties;
    disabled?: boolean; 
}

export const CreateButton: React.FC<CreateButtonProps> = ({text, onClick, ref, style, disabled}) => {

    const handleClick = () => {
        onClick();
        ref?.current?.click && ref.current.click();
    }

    return (
        <BlueButton onClick={handleClick} style={{borderRadius: '32px', minWidth: '92px'}} disabled={disabled}>{text}</BlueButton>
    )
}

export default CreateButton;