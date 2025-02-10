import React, {useState} from "react";
import {Box, Container} from "@material-ui/core";
import {Link, useParams} from "react-router-dom";
import Routes from "../../constants/Routes";
import {Field, Form, Formik} from "formik";
import {FormikHelpers} from "formik/dist/types";
import {UpdateSroiRequest} from "../../models/SROIReport";
import {useAppServices} from "../../providers/appServiceProvider";
import {useCrudListQuery} from "../../hooks/useCrudListQuery";


const AdminProjectInput = () => {
    const services = useAppServices();
    const {projectId} = useParams<{ projectId: string }>();
    const projects = useCrudListQuery(services => services.projects);
    const currentProject = projects.elements.find(x => x.id === projectId);

    const [saved, setSaved] = useState(false);

    const confirmation = saved ? "URL saved" : "";

    const handleSubmit = async (values: UpdateSroiRequest, formikHelpers: FormikHelpers<UpdateSroiRequest>) => {
        await services.admin.setSroiURL(projectId, values);
        formikHelpers.resetForm();
        setSaved(true);
    };

    return (
        <Container>
            <Box pt={4} pb={4}>
                <Link to={Routes.adminProjects}>
                    Projekter
                </Link>
                <div style={{height: 16}}/>
                <div>{currentProject?.name}</div>
            </Box>
            <Formik<UpdateSroiRequest>
                initialValues={{Url: ''}}
                onSubmit={handleSubmit}
            >
                <Form>
                    <label htmlFor="SROI report url">SROI report url</label>
                    <Field id="LinkAddress" name="Url" placeholder="Paste url" style={{marginLeft: 10}}/>
                    <button type="submit" style={{marginLeft: 20}}>Submit</button>
                    <div style={{color: "green"}}>{confirmation}</div>
                </Form>
            </Formik>
        </Container>
    )
};

export default AdminProjectInput;