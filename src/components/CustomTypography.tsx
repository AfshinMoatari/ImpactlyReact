import React from 'react';
import Typography, { TypographyProps } from '@mui/material/Typography';

interface CustomTypographyProps extends TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
  size?: 'small' | 'medium' | 'large' | number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

const CustomTypography: React.FC<CustomTypographyProps> = (props) => {
  const {
    variant = 'body1',
    size = 'medium',
    bold = false,
    italic = false,
    underline = false,
    children,
    fontFamily,
    ...other
  } = props;

  const style: React.CSSProperties = {
    fontSize: size === 'small' ? '0.8rem' : size === 'large' ? '1.2rem' : typeof(size) == "number" ? size :  '1rem',
    fontWeight: bold ? 'bold' : 'normal',
    fontStyle: italic ? 'italic' : 'normal',
    textDecoration: underline ? 'underline' : 'none',
  };

  return (
    <Typography variant={variant} style={style} {...other} fontFamily={fontFamily}>
      {children}
    </Typography>
  );
};

export default CustomTypography;
