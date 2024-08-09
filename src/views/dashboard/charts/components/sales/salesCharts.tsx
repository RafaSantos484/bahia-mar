import { useEffect, useState } from "react";
import PaidIcon from "@mui/icons-material/Paid";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { GlobalState } from "../../../../../global-state-context";
import { formatIsoDate } from "../../../../../utils";
import "./salesCharts.scss";
import { DateLineChart } from "../../../../../components/date-line-chart";
import { Collaborator } from "../../../../../types";
import { CustomBarChart } from "../../../../../components/custom-bar-chart";

type Props = {
  globalState: GlobalState;
};

type DateSale = { date: string; value: number };
type LabelSale = { label: string; value: number };

export function SalesCharts({ globalState }: Props) {
  const [salesPerDateDayset, setSalesPerDayDataset] = useState<DateSale[]>([]);
  const [salesPerCollaborator, setSalesPerCollaborator] = useState<LabelSale[]>(
    []
  );

  useEffect(() => {
    const salesPerDay: {
      [day: string]: number;
    } = {};
    for (const sale of globalState.sales) {
      const day = formatIsoDate(sale.createdAt);
      if (!(day in salesPerDay)) {
        salesPerDay[day] = sale.paidValue;
      } else salesPerDay[day] += sale.paidValue;
    }

    setSalesPerDayDataset(
      Object.entries(salesPerDay)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date))
    );
  }, [globalState.sales]);

  useEffect(() => {
    const salesPerCollaboratorId: {
      [id: string]: { name: string; value: number };
    } = {};
    const collaborators: { [id: string]: Collaborator | null } = {};
    for (const sale of globalState.sales) {
      if (!(sale.collaborator in salesPerCollaboratorId)) {
        let collaborator: Collaborator | null = null;
        if (sale.collaborator in collaborators) {
          collaborator = collaborators[sale.collaborator];
        } else {
          collaborator =
            globalState.collaborators.find((c) => c.id === sale.collaborator) ||
            null;
          collaborators[sale.collaborator] = collaborator;
        }

        if (!!collaborator) {
          salesPerCollaboratorId[sale.collaborator] = {
            name: collaborator.name,
            value: sale.paidValue,
          };
        }
      } else salesPerCollaboratorId[sale.collaborator].value += sale.paidValue;
    }

    setSalesPerCollaborator(
      Object.entries(salesPerCollaboratorId)
        .map(([id, { name, value }]) => ({ label: `${name}_${id}`, value }))
        .sort((a, b) => b.label.localeCompare(a.label))
    );
  }, [globalState.collaborators, globalState.sales]);

  return (
    <div className="sales-charts-container">
      <div className="charts-container">
        <DateLineChart
          dataset={salesPerDateDayset}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "date",
              valueFormatter: (value: string) =>
                value.split("-").reverse().join("/"),
            },
          ]}
          series={[
            {
              dataKey: "value",
            },
          ]}
          Title={
            <div className="chart-title">
              <PaidIcon />
              <span>Faturamento</span>
            </div>
          }
        />
        <CustomBarChart
          dataset={salesPerCollaborator}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "label",
              valueFormatter: (value: string) => value.split("_")[0],
            },
          ]}
          series={[
            {
              dataKey: "value",
            },
          ]}
          Title={
            <div className="chart-title">
              <AccountCircleIcon />
              <span>Faturamento por Funcionário</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
