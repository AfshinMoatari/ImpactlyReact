import React from "react";
import {useAuth} from "../../providers/authProvider";
import {LoginForm, LoginFormValues} from "../../components/forms/LoginForm";
import {Box, Container} from "@material-ui/core";
import BG from "../../assets/auth_bg.png";

const AdminAuth = () => {
    const auth = useAuth();
    const handleSubmit = (values: LoginFormValues) =>
        auth.signInAdmin(values.email, values.password);
    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, rgba(28,22,55,1) 0%, rgba(28,22,55,0.5) 100%), url(${BG})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
            }}
        >
            <Container maxWidth='xs'>
                <Box p={2} borderRadius={8} style={{
                    background: '#F6F8FA',
                    boxShadow: '0 20px 50px 0 rgb(22 21 34 / 20%)'
                }}>
                    <LoginForm onSubmit={handleSubmit}/>
                </Box>
            </Container>
        </div>
    )
}

export default AdminAuth;