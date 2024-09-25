import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";

import "./dashboard.scss";
import LoadingScreen from "../../components/loading-screen";
import { useGlobalState } from "../../global-state-context";

import { Registrations } from "./registrations/registrations";
import { Charts } from "./charts/charts";
import { CollaboratorType } from "../../types";
import NavBar from "../../components/nav-bar";

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

  return (
    <div className="global-fullscreen-container dashboard-container">
      <ThemeProvider theme={themes}>
        <div className="content-container">
          <NavBar
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
            isAdmin={globalState.loggedUser.type === CollaboratorType.Admin}
          />

          {selectedPage === "table" && (
            <Registrations globalState={globalState} />
          )}
          {selectedPage === "charts" && <Charts globalState={globalState} />}
        </div>
      </ThemeProvider>
    </div>
  );
}
