import { Button, IconButton, Tooltip } from "@mui/material";
import { useState, Dispatch, SetStateAction } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import { logout } from "../apis/firebase";

type Props = {
  selectedPage: "table" | "charts";
  setSelectedPage: Dispatch<SetStateAction<"table" | "charts">>;
  isAdmin: boolean;
};

export default function NavBar({
  selectedPage,
  setSelectedPage,
  isAdmin,
}: Props) {
  const [isLeftBarOpen, setIsLeftBarOpen] = useState(false);

  return (
    <div
      className="left-bar-container"
      style={{ width: isLeftBarOpen ? "15vw" : "5vw" }}
    >
      <div className="buttons-container">
        <IconButton
          style={{ alignSelf: "center" }}
          onClick={() => setIsLeftBarOpen(!isLeftBarOpen)}
          color="info"
        >
          <MenuIcon />
        </IconButton>

        <Button
          className="button-container"
          color={selectedPage === "table" ? "info" : "secondary"}
          onClick={() => setSelectedPage("table")}
        >
          <Tooltip title={isLeftBarOpen ? "" : "Cadastros"}>
            <TableChartIcon />
          </Tooltip>
          <span>Cadastros</span>
        </Button>
        {isAdmin && (
          <Button
            className="button-container"
            color={selectedPage === "charts" ? "info" : "secondary"}
            onClick={() => setSelectedPage("charts")}
          >
            <Tooltip title={isLeftBarOpen ? "" : "Relatórios"}>
              <BarChartIcon />
            </Tooltip>
            <span>Relatórios</span>
          </Button>
        )}
      </div>

      <div className="buttons-container">
        <Button className="button-container" onClick={logout} color="error">
          <Tooltip title={isLeftBarOpen ? "" : "Sair"}>
            <MeetingRoomIcon />
          </Tooltip>
          <span>Sair</span>
        </Button>
      </div>
    </div>
  );
}
