import {Form} from "formik";
import {FormikFormProps} from "formik/dist/Form";
import React from "react";

const SubmitFreeForm: React.FC<FormikFormProps> = (props) => {

    const handleKeyPress = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
        }
    }
    return <Form onKeyPress={handleKeyPress} {...props}/>
}

export default SubmitFreeForm;
