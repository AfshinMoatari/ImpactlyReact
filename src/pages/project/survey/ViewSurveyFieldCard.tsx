import {
  Card,
  CardProps,
  Collapse,
  Grid,
  IconButton,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { SurveyField } from "../../../models/Survey";
import React from "react";
import { ListItemButton } from "@mui/material";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
type SurveyFieldCardProps = CardProps & {
  field: SurveyField;
  fi: number;
};

const ViewSurveyFieldCard: React.FC<SurveyFieldCardProps> = ({
  fi,
  field,
  ...props
}) => {
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };
  const convertStringToHTML = (html: string) => {
    return { __html: html };
  };
  return (
    <Card {...props} style={{ overflow: "unset" }}>
      <div style={{
        borderLeft: "1px solid #D5D4DA", borderRight: "1px solid #D5D4DA", borderBottom: open ? "1px solid #D5D4DA" : "0",
      }}>
        <ListItemButton
          style={{
            backgroundColor: open ? "#F1F0F6" : "#FFFFFF",
            borderBottom: "1px solid #D5D4DA",
          }}
          onClick={handleClick}
        >
          <ListItemText
            disableTypography
            primary={
              <Typography style={{ fontWeight: 600, margin: "8px 0" }} variant="h3">{`${fi + 1}. ${field.text
                }`}</Typography>
            }
          />
          <IconButton color="secondary" size="small">
            {open ? (
              <RiArrowDropUpLine size="24" color="#503E8E" />
            ) : (
              <RiArrowDropDownLine size="24" color="#503E8E" />
            )}
          </IconButton>
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          {(field.type === "choice" || field.type === "likert") &&
            field.choices.map((choice, index) => (
              <ListItem
                key={choice.id}
                style={{
                  padding: "6px 0 6px 20px",
                  borderBottom: index + 1 >= field.choices.length ? "0" : "1px solid #D5D4DA",
                  height: 60,
                }}
              >
                <ListItemText primary={choice.text} />
              </ListItem>
            ))}
          {field.type === "text" && (
            <>
              <Grid item xs={9} style={{ padding: 20, height: 60 }}>
                <ListItemText primary="Fritekstfelt" />
              </Grid>
            </>
          )}
          {field.type === "skiller" && (
            <div
              style={{
                padding: "6px 0 6px 20px",
                width: "90%",
                minHeight: 60,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant={"body1"}>
                <div
                  dangerouslySetInnerHTML={convertStringToHTML(
                    field.choices[0].text ?? ""
                  )}
                />
              </Typography>
            </div>
          )}
        </Collapse>
      </div>
    </Card>
  );
};

export default ViewSurveyFieldCard;
