import React from "react";
import ColorCard from "./ColorCard";

interface PrettyNumberCardProps {
    number: number;
    of: string;
    color?:"primary" | "secondary"
}

const PrettyNumberCard: React.FC<PrettyNumberCardProps> = ({number, of, color = "primary" }) => {
    const text = number === 1 ? of : `${of}e`;

    return (
        <ColorCard color={color}>
            <div style={{ padding: 16 }}>
                <div style={{ fontSize: 64 }}>
                    {number}
                </div>
                <div style={{
                    textAlign: "end",
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {text}
                </div>
            </div>
        </ColorCard>
    )
}

export default PrettyNumberCard;
