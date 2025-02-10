import React from "react";
import {ModuleProps} from "../index";

const UploadPictureView: React.FC<ModuleProps> = ({config}) => {
    const img = typeof(config.file) == "string" ? config.file as string : URL.createObjectURL(config.file as File);
    return (
        <div style={{height: "100%", width: "100%"}}>
            <img src={img} alt="Uploaded" style={{width: "100%", height: "100%"}} />
        </div>
    )
}


export default UploadPictureView;
