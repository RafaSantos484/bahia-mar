import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useState } from "react";

import { GlobalState } from "../../../global-state-context";
import "./charts.scss";
import { CollaboratorsCharts } from "./components/collaborators/collaboratorsCharts";
import { ClientsCharts } from "./components/clients/clientsCharts";
import { SalesCharts } from "./components/sales/salesCharts";

import LogoHeader from "../../../components/logo-header";

type ReportType = "Vendas" | "Clientes" | "Funcionários";
const ReportTypeArr: ReportType[] = ["Vendas", "Clientes", "Funcionários"];

type Props = {
  globalState: GlobalState;
};

export function Charts({ globalState }: Props) {
  const [selectedReport, setSelectedReport] = useState<ReportType>("Vendas");

  return (
    <div className="charts-container">
      <LogoHeader />
      <div className="upper-menu-container">
        <FormControl className="report-type-select-container">
          <InputLabel id="report-type-select-label">Relatório</InputLabel>
          <Select
            labelId="data-type-select-label"
            label="Relatório"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value as ReportType)}
          >
            {ReportTypeArr.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      {selectedReport === "Vendas" && <SalesCharts globalState={globalState} />}
      {selectedReport === "Clientes" && (
        <ClientsCharts globalState={globalState} />
      )}
      {selectedReport === "Funcionários" && (
        <CollaboratorsCharts globalState={globalState} />
      )}
    </div>
  );
}
