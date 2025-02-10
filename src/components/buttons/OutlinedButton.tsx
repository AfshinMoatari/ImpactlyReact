import React from "react";
import BlueButton from "./BlueButton";
import Identifyable from "../../models/Identifyable";
import ButtonLine from "./ButtonLine";

interface OutlinedButtonProps extends Partial<Identifyable>{
    text: string;
    onClick: VoidFunction;
    ref?: React.RefObject<HTMLButtonElement>;
    style?: React.CSSProperties;
    disabled?: boolean; 
}

export const OutlinedButton: React.FC<OutlinedButtonProps> = ({text, onClick, ref, style, disabled}) => {

    const handleClick = () => {
        onClick();
        ref?.current?.click && ref.current.click();
    }

    return (
        <ButtonLine
            onClick={handleClick}
            style={{
                borderRadius: '32px',
                minWidth: '90px',
                maxHeight: '42.75px',
                backgroundColor: '#ffffff',
                color: 'rgba(237,76,47,1)',
                ...style
            }}
            disabled={disabled}
        >
            {text}
        </ButtonLine>
    )
}

export default OutlinedButton;