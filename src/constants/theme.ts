import React from "react";
import createSpacing from "@material-ui/core/styles/createSpacing";
import {createTheme, Theme} from "@material-ui/core";

const spacing = createSpacing(8);

export interface CustomTheme extends Theme {
    custom: {
        drawerWidth: number;
        appBarHeight: number;
        boxShadow: React.CSSProperties["boxShadow"];
        backgroundColor: React.CSSProperties["backgroundColor"];
        impactlyBlue: React.CSSProperties["backgroundColor"];
        palePrimary: React.CSSProperties["backgroundColor"];
        cream: React.CSSProperties["backgroundColor"];
        avatarTextColor: React.CSSProperties["color"];
        CallToActionIconBG: React.CSSProperties["backgroundColor"];
        CallToActionIconText: React.CSSProperties["color"];
    }
}

export const theme: CustomTheme = {
    custom: {
        drawerWidth: 232,
        appBarHeight: 64,
        boxShadow: '0 1px 4px rgba(0,0,0,.09)',
        backgroundColor: "rgba(10, 114, 239, 0.08)",
        impactlyBlue: "rgba(28, 22, 50, 0.9)",
        palePrimary: "#1C1632",
        avatarTextColor: "rgba(255,255,255,1)",
        cream: "rgba(255, 252, 245, 1)",
        CallToActionIconText: "rgba(237, 76, 47, 1)",
        CallToActionIconBG: "rgba(255,255,255,1)"
    },
    ...createTheme({
        typography:{
            fontFamily: 'Inter',
            fontSize: 13,
            h1: {
                fontFamily: "Inter",
                marginTop: 16,
                marginBottom: 8,
                fontSize: 30,
            },
            h2: {
                fontFamily: "Inter",
                fontSize: 22,
                fontWeight: 500,
                marginTop: 8,
                marginBottom: 4,
            },
            h3: {
                fontFamily: "Inter",
                fontSize: 18,
                marginTop: 4,
                marginBottom: 8,
            },
            h4: {
                fontFamily: "Inter",
                fontSize: 16,
                marginTop: 4,
                marginBottom: 8,
            },
            subtitle1: {
                fontSize: 13,
                marginTop: 4,
                marginBottom: 4,
                fontWeight: 400,
            },
            subtitle2: {
                fontSize: 12,
                marginTop: 4,
                marginBottom: 4,
                fontWeight: 400,
            }
        },
        palette: {
            type: 'light',
            primary: {
                main: "rgba(237,76,47,1)",
                dark: "rgba(188,42,16,1)",
                light: "rgba(239,93,67,1)",
                contrastText: 'rgba(255,255,255,1)',
            },
            secondary: {
                main: "rgba(28,22,50,1)",
                dark: "rgba(10,8,18,1)",
                light: "rgba(60,47,106,1)",
                contrastText: 'rgba(255,255,255,1)'
            },
            error: {
                main: "rgba(170,34,84,1)",
                dark: "rgba(127,26,63,1)",
                light: "rgba(221,85,135,1)",
                contrastText: 'rgba(255,255,255,1)'
            },
            warning: {
                main: "rgba(204,143,0,1)",
                dark: "rgba(153,107,0,1)",
                light: "rgba(255,194,51,1)",
                contrastText: 'rgba(255,255,255,1)'
            },
            info: {
                main: "rgba(80,62,142,1)",
                dark: "rgba(60,47,106,1)",
                light: "rgba(131,113,193,1)",
                contrastText: 'rgba(255,255,255,1)'
            },
            success: {
                main: "rgba(4,134,115,.3)",
                dark: "rgba(3,99,85,1)",
                light: "rgba(6,198,169,1)",
                contrastText: 'rgba(255,255,255,1)'
            },
            text: {
                primary: "rgba(4, 17, 42, 1)",
            },
            background: {
                default: "rgba(10, 8, 18, 0.12)",
                paper: "rgba(255,255,255,1)",
            }
        },
        overrides: {
            MuiPaper: {
                root: {
                    boxShadow: '0 1px 4px rgba(0,0,0,.09)',
                },
                elevation0: {
                    boxShadow: 'none',
                    border: '1px solid rgba(10, 8, 18, 0.12)',
                },
                elevation1: {
                    boxShadow: '0 1px 4px rgba(0,0,0,.09)'
                },
                elevation2: {
                    boxShadow: '0 1px 4px rgba(0,0,0,.09)'
                },
                elevation3: {
                    boxShadow: '0 1px 4px rgba(0,0,0,.09)'
                },
                elevation4: {
                    boxShadow: '0 1px 4px rgba(0,0,0,.09)'
                },
                elevation8: {
                    boxShadow: '0 4px 8px rgba(0,0,0,.2)'
                },
                rounded: {
                    borderRadius: '8px'
                }
            },
            MuiFilledInput: {
                root: {
                    backgroundColor: "rgba(234, 236, 240, 1)",
                    borderRadius: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                },
            },
            MuiTooltip: {
                tooltip: {
                    fontSize: 14,
                    padding: spacing(1, 2),
                    transition: 'opacity 0.5s cubic-bezier(0.12, 1.04, 0.77, 1.01)',
                },
            },
            MuiListItem: {
                root: {
                    background: 'white',
                    padding: spacing(1)
                }
            },
            MuiTableCell: {
                head: {
                    background: 'none',
                    fontWeight: 'bold',
                },
            },
            MuiButton: {
                root: {
                    textTransform: 'none'
                }
            }
        },
    })
};

export default theme;