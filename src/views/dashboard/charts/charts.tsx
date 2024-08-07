import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useState } from "react";

import { GlobalState } from "../../../global-state-context";
import "./charts.scss";
import { CollaboratorsCharts } from "./components/collaborators/collaboratorsCharts";

type ReportType = "Funcionários";
const ReportTypeArr: ReportType[] = ["Funcionários"];

type Props = {
  globalState: GlobalState;
};

export function Charts({ globalState }: Props) {
  const [selectedReport, setSelectedReport] =
    useState<ReportType>("Funcionários");
  const [isWaitingAsync, setIsWaitingAsync] = useState(false);

  return (
    <div className="charts-container">
      <div className="upper-menu-container">
        <FormControl
          className="report-type-select-container"
          disabled={isWaitingAsync}
        >
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

      {selectedReport === "Funcionários" && (
        <CollaboratorsCharts globalState={globalState} />
      )}
    </div>
  );
}
