import React from "react";

const NiceDivider: React.FC<{style?: React.CSSProperties, className?: string}> = ({style, className}) => {
    return <div style={{ height: 2, width: "100%", marginLeft: "8px", marginRight: "8px", ...style }} className={className} />
}
export default NiceDivider;