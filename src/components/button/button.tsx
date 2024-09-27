import { ReactNode } from "react";
import ButtonMUI from "@mui/material/Button";

import './button.css'

interface ButtonsProps {
  children?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  type?: "button" | "submit";
  disabled?: boolean;
  size?: string;
  style?: React.CSSProperties;
}


export default function Button({
  children,
  onClick,
  type,
  disabled,
  size,
  style,
}: ButtonsProps) {

  const sizeClass = size === "large" ? "button-large" : "button-medium";

  style = style || {};

  return (
    <ButtonMUI
      variant="contained"
      type={type ? type : "button"}
      disabled={disabled}
      color="primary"
      onClick={onClick}
      className={`button-container ${sizeClass}`}
    >
      {children}
    </ButtonMUI>
  );
}
