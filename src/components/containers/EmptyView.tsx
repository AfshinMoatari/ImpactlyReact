import AddCircleLineIcon from "remixicon-react/AddCircleLineIcon";
import React from "react";
import {PrimaryIconButton} from "../buttons/BlueButton";
import {Avatar, Typography} from "@material-ui/core";
import theme from "../../constants/theme";
import {RemixiconReactIconComponentType} from "remixicon-react";

interface EmptyViewProps {
    placeholder?: string;
    title: string;
    subTitle?: string;
    size?: "default" | "small";
    icon?: RemixiconReactIconComponentType;
}

export const EmptyView: React.FC<EmptyViewProps> = (props) => {
    const {title, icon, size = 'default', subTitle, children} = props;
    const hack = {icon: icon ? icon : React.Fragment}
    const small = size === "small"
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
            }}>
                {icon &&
                    <Avatar
                        color="primary"
                        style={{
                            width: small ? 80 : 120,
                            height: small ? 80 : 120,
                            marginRight: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            backgroundColor: theme.custom.palePrimary,
                        }}

                    >
                        <hack.icon size={ small ? 30 : 45}/>
                    </Avatar>
                }
                <Typography style={{marginBottom: '16px', textAlign: 'center'}} variant={small ? 'h2' : 'h1'}>{title}</Typography>
                {subTitle && <span style={{color: '#6b7a98', marginBottom: '16px', textAlign: 'center'}}>{subTitle}</span>}
                {children}
            </div>
        </div>
    )
}

interface EmptyButtonView extends EmptyViewProps {
    buttonText?: string;
    onClick?: () => void;
}

export const EmptyButtonView: React.FC<EmptyButtonView> = ({buttonText, onClick, ...rest}) => {
    return (
        <EmptyView {...rest} >
            {Boolean(onClick) && (
                <PrimaryIconButton onClick={onClick} icon={AddCircleLineIcon}>
                    {buttonText}
                </PrimaryIconButton>
            )}
        </EmptyView>
    )
}


export default EmptyButtonView;