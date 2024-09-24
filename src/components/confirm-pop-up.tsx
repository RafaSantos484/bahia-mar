import { CheckCircleOutline, HighlightOffOutlined } from "@mui/icons-material";
import Button from "./button";

export type ConfirmPopUpInfo = {
  type: "success" | "error";
  text: string;
  close: () => any;
};
/*
type Props = {
  type: "success" | "error";
  text: string;
};*/

const typesIcons = {
  success: CheckCircleOutline,
  error: HighlightOffOutlined,
};

const typesTitles = {
  success: "Sucesso!",
  error: "Erro",
};

export default function ConfirmPopUp({ type, text, close }: ConfirmPopUpInfo) {
  const Icon = typesIcons[type];

  return (
    <div
      className="global-absolute-fullscreen-container"
      style={{ backdropFilter: "blur(5px)", backgroundColor: "transparent" }}
    >
      <div
        style={{
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid black",
          borderRadius: "10px",
          width: "35vw",
          height: "65vh",
        }}
      >
        <Icon color={type} sx={{ fontSize: "10rem" }} />

        <h2 style={{ margin: "0 0 2.5rem 0" }}>{typesTitles[type]}</h2>

        <span style={{ width: "80%", textAlign: "center", fontWeight: "bold" }}>
          {text}
        </span>

        <Button
          style={{
            width: "60%",
            height: "fit-content",
            fontSize: "1.5rem",
            borderRadius: "5px",
          }}
          onClick={close}
        >
          OK
        </Button>
      </div>
    </div>
  );
}
