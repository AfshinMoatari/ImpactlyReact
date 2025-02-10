import React, {} from "react";
import {ModuleProps} from "../index";
import {Typography} from "@material-ui/core";

const FreeTextView: React.FC<ModuleProps> = ({config}) => {

    const convertStringToHTML = (html: string) => {
        return {__html: html}
    }

    return (
        <div style={{padding: "1rem"}} >
            <Typography variant={"body2"} >
                <div dangerouslySetInnerHTML={convertStringToHTML(config.freeTextContents ?? '')} />
            </Typography >
        </div>
    )
}

export default FreeTextView;
