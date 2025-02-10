import React from "react";

const renderPhoneNumber = (pn: string | undefined) => {
    if (!pn) return <div/>
    const phoneNumber = pn.replace("+45", "");
    return (
        <div>
            <span style={{paddingRight: 8, opacity: 0.7}}>+45</span>
            <span style={{paddingRight: 4}}>{phoneNumber.slice(0, 2)}</span>
            <span style={{paddingRight: 4}}>{phoneNumber.slice(2, 4)}</span>
            <span style={{paddingRight: 4}}>{phoneNumber.slice(4, 6)}</span>
            <span>{phoneNumber.slice(6, 8)}</span>
        </div>
    )
}

export default renderPhoneNumber;
