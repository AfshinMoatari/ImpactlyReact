import * as Yup from "yup";
import {Validators} from "../../../lib/Validators";
import {Field} from "formik";
import {TextField} from "@material-ui/core";
import CreateDialog from "../../../components/dialogs/CreateDialog";
import React from "react";
import {FormikConfig} from "formik/dist/types";
import {useTranslation} from "react-i18next";

export interface NameForm { name: string }

interface NameStrategyDialogProps {
    onSubmit: FormikConfig<NameForm>["onSubmit"];
    open: boolean;
    onClose: VoidFunction;
}

const NameStrategyDialog: React.FC<NameStrategyDialogProps> = ({ onSubmit, open, onClose}) => {
    const {t} = useTranslation();
    return (
        <CreateDialog<NameForm>
            onSubmit={onSubmit}
            initialValues={{name: ""}}
            title={t("StrategyFlowPage.namePrompt")}
            open={open}
            validationSchema={Yup.object().shape({name: Validators.required()})}
            onClose={onClose}
            validateOnMount
        >
            {({errors, touched}) => (
                <Field
                    as={TextField}
                    name="name"
                    label={t("StrategyFlowPage.nameLabel")}
                    type="text"
                    variant='filled'
                    fullWidth
                    autoFocus
                    error={errors.name && touched.name}
                    helperText={touched.name && errors.name}
                />
            )}
        </CreateDialog>
    )
}

export default NameStrategyDialog;
