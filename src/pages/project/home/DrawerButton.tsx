import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ListItem from "@material-ui/core/ListItem";
import { matchPath } from "react-router";
import { alpha, Theme } from "@material-ui/core";
import { RemixiconReactIconComponentType } from "remixicon-react";
import history from "../../../history";

interface DrawerButtonStyleProps {
  selected: boolean;
  iconColor?: string;
  textColor?: string;
}

const useStyles = makeStyles<Theme, DrawerButtonStyleProps>((theme) => ({
  text: {
    height: "32px",
    lineHeight: "32px",
    flex: 1,
    fontWeight: 500,
    color: ({ selected }) =>
      selected ? theme.palette.secondary.light : theme.palette.text.primary,
  },
  icon: {
    display: "flex",
    marginLeft: 0,
    marginRight: theme.spacing(1.5),
  },
  button: {
    borderRadius: 8,
    backgroundColor: ({ selected }) =>
      selected ? alpha(theme.palette.secondary.light, 1) : "transparent",
    "&:hover": {
      backgroundColor: ({ selected }) =>
        selected
          ? alpha(theme.palette.secondary.light, 0.60)
          : "rgba(0, 0, 0, 0.04)",
    },
  },
}));

export interface DrawerButtonProps {
  item: {
    name: string | JSX.Element;
    icon: RemixiconReactIconComponentType;
    path?: string;
    external?: boolean;
    showRedDot?: boolean;
    notificationAmount?: number;
  };
  onClick?: VoidFunction;
  onToggle?: VoidFunction;
  textColor?: string;
  iconColor?: string;
  pathname?: string;
}

export const DrawerButton: React.FC<DrawerButtonProps> = ({
  item,
  onClick,
  onToggle,
  textColor,
  iconColor,
  pathname,
}) => {
  const handleItemClick = () => {
    if (item.external) {
      window.open(item.path, "_blank");
      return;
    }
    if (item.path) history.push(item.path);
    onToggle && onToggle();
  };

  const selected =
    !!item.path &&
    !!matchPath(pathname ?? "", {
      path: item.path,
    });

  const classes = useStyles({ selected, iconColor, textColor });
  return (
    <ListItem
      button
      onClick={onClick || handleItemClick}
      className={classes.button}
    >
      <item.icon className={classes.icon} size={21} />
      <span style={{ color: textColor }} className={classes.text}>
        {item.name}
      </span>
      {item.showRedDot && (
        <div style={{backgroundColor: "#503e8e", minWidth: 10, minHeight: 10, borderRadius: 100, display: "flex", justifyContent: "center", alignItems: "center"}}/>
      )}
    </ListItem>
  );
};

export default DrawerButton;
