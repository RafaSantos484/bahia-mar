import { CircularProgress } from "@mui/material";

type Props = { size?: string | number };

export default function LoadingScreen({ size }: Props) {
  size = size || "10vw";

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size={size} />
    </div>
  );
}
