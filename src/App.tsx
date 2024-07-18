import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./global.scss";
import Login from "./views/login/login";
import Dashboard from "./views/dashboard/dashboard";
import { GlobalStateProvider } from "./global-state-context";

function App() {
  return (
    <GlobalStateProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Login />} path="/" />
          <Route element={<Dashboard />} path="/dashboard" />
        </Routes>
      </BrowserRouter>
    </GlobalStateProvider>
  );
}

export default App;
