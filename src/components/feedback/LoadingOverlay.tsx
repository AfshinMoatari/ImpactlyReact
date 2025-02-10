import React, {CSSProperties} from "react";
import {CircularProgress} from "@material-ui/core";


interface LoadingOverlayProps {
    size?: number;
    style?: CSSProperties;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({size = 20, style}) => {

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1200,
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                ...style
            }}
        >
            <CircularProgress size={size}/>
        </div>
    )
}

export default LoadingOverlay;