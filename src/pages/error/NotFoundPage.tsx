import React from 'react';
import {Box, Button} from "@material-ui/core";
import FullCenterPage from "../../components/containers/FullCenterPage";
import Routes from "../../constants/Routes";
import history from "../../history";
import {useTranslation} from "react-i18next";

const NotFoundPage: React.FC = () => {
    const onBackClick = () => history.push(Routes.project)
    const {t} = useTranslation();
    return (
        <Box style={{
            width: '100%',
            height: '100%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <FullCenterPage>
                <Box p={2}>
                    <h1>{t("PageNotFound.notFound")}</h1>
                    <p>{t("PageNotFound.notFoundDescription")}</p>
                    <Button color='primary' onClick={onBackClick}>
                        {t("PageNotFound.back")}
                    </Button>
                </Box>
            </FullCenterPage>
        </Box>
    );
};

export default NotFoundPage;
