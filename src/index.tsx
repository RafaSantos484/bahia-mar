import ReactDOM from "react-dom/client";
import "@fontsource/poppins";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import themes from './themes/themes';

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ThemeProvider theme={themes}>
    <App />
  </ThemeProvider>
);