import {Redirect, Route, RouteProps} from 'react-router';
import React from 'react';

type ConditionalRouteProps = RouteProps & {
    condition?: boolean;
    redirect: string;
}

const ConditionalRoute: React.FC<ConditionalRouteProps> = ({condition, redirect, ...rest}) => {
    if (!condition) return (<Redirect to={redirect}/>)
    return (
        <Route {...rest}/>
    )
};

export default ConditionalRoute;
