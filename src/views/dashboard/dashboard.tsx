import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  createTheme,
  IconButton,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
// import SettingsIcon from "@mui/icons-material/Settings";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";

import "./dashboard.scss";
import LoadingScreen from "../../components/loading-screen";
import { useGlobalState } from "../../global-state-context";

import { logout } from "../../apis/firebase";
import { Registrations } from "./registrations/registrations";
import { Charts } from "./charts/charts";
import { CollaboratorType } from "../../types";

const themes = createTheme({
  palette: {
    primary: {
      main: "#214f6e",
    },
    secondary: {
      main: "#000000",
    },
    info: {
      main: "#ffffff",
    },
  },
});

export default function Dashboard() {
  const navigate = useNavigate();
  const globalState = useGlobalState();

  const [isLeftBarOpen, setIsLeftBarOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<"table" | "charts">("table");

  useEffect(() => {
    if (globalState === null) navigate("/");
  }, [globalState, navigate]);

  if (!globalState) {
    return (
      <div className="global-fullscreen-container">
        <LoadingScreen />
      </div>
    );
  }

  const isAdmin = globalState.loggedUser.type === CollaboratorType.Admin;

  return (
    <div className="global-fullscreen-container dashboard-container">
      <ThemeProvider theme={themes}>
        <div className="content-container">
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
              {/*<Button className="button-container" color="info">
                <Tooltip title={isLeftBarOpen ? "" : "Opções"}>
                  <SettingsIcon />
                </Tooltip>
                <span>Opções</span>
              </Button> */}
              <Button
                className="button-container"
                onClick={logout}
                color="error"
              >
                <Tooltip title={isLeftBarOpen ? "" : "Sair"}>
                  <MeetingRoomIcon />
                </Tooltip>
                <span>Sair</span>
              </Button>
            </div>
          </div>

          {selectedPage === "table" && (
            <Registrations globalState={globalState} />
          )}
          {selectedPage === "charts" && <Charts globalState={globalState} />}
        </div>
      </ThemeProvider>
    </div>
  );
}
