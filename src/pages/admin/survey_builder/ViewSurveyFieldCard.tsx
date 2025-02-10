import {Card, CardProps, Grid, TextField, Typography} from "@material-ui/core";
import {SurveyField} from "../../../models/Survey";
import React from "react";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import IconItem from "./IconItem";

type SurveyFieldCardProps = CardProps & {
    field: SurveyField;
    fi: number;
}

const ViewSurveyFieldCard: React.FC<SurveyFieldCardProps> = ({fi, field, ...props}) => {
    const convertStringToHTML = (html: string) => {
        return {__html: html}
    }
    return (
        <Card
            style={{padding: "16px 8px", marginBottom: 16}}
            {...props}
        >
            <Grid container spacing={2} item xs={12}>
                <Grid item xs={10} style={{
                    paddingLeft: 32,
                    fontSize: 18,
                }}>
                    {`${fi + 1}. ${field.text}`}
                </Grid>

                {field.type === "choice" && field.choices.map((choice) => (
                    <Grid key={choice.id} container item xs={12}>
                        <IconItem>
                            <CheckboxBlankCircleLineIcon/>
                        </IconItem>
                        <Grid item xs={9}>
                            {choice.text}
                        </Grid>
                    </Grid>
                ))}
                {field.type === "text" && (
                    <>
                        <Grid item xs={1}/>
                        <Grid item xs={9}>
                            <TextField disabled fullWidth label="Fritekstfelt"/>
                        </Grid>
                    </>
                )}
                {field.type === "skiller" && (
                    <div style={{padding: "1rem", width: "90%", margin: "0 auto"}}>
                        <Typography variant={"body2"}>
                            <div dangerouslySetInnerHTML={convertStringToHTML(field.choices[0].text ?? '')}/>
                        </Typography>
                    </div>
                )}
            </Grid>
        </Card>
    )
}

export default ViewSurveyFieldCard;
