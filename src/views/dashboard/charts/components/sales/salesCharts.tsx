import { useEffect, useState } from "react";
import PaidIcon from "@mui/icons-material/Paid";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { GlobalState } from "../../../../../global-state-context";
import { formatIsoDate } from "../../../../../utils";
import "./salesCharts.scss";
import { DateLineChart } from "../../../../../components/date-line-chart";
import { Collaborator } from "../../../../../types";
import { CustomBarChart } from "../../../../../components/custom-bar-chart";
import dayjs from "dayjs";

type Props = {
  globalState: GlobalState;
};

type DateSale = { date: string; value: number };
type LabelSale = {
  label: { value: string };
  value: number;
};

export function SalesCharts({ globalState }: Props) {
  const [salesPerDateDayset, setSalesPerDayDataset] = useState<DateSale[]>([]);
  const [salesPerCollaborator, setSalesPerCollaborator] = useState<LabelSale[]>(
    []
  );

  useEffect(() => {
    const salesPerDay: {
      [day: string]: number;
    } = {};
    let minDay = "";
    let maxDay = "";
    for (const sale of globalState.sales) {
      const day = formatIsoDate(sale.createdAt);
      if (!minDay || day < minDay) {
        minDay = day;
      }
      if (!maxDay || day > maxDay) {
        maxDay = day;
      }

      if (!(day in salesPerDay)) {
        salesPerDay[day] = sale.paidValue;
      } else salesPerDay[day] += sale.paidValue;
    }

    if (!!minDay && !!maxDay) {
      let currDay = dayjs(minDay);
      const lastDay = dayjs(maxDay);
      while (!currDay.isSame(lastDay, "day")) {
        const day = currDay.format("YYYY-MM-DD");
        if (!(day in salesPerDay) && ![0, 6].includes(currDay.day())) {
          salesPerDay[day] = 0;
        }
        currDay = currDay.add(1, "day");
      }
    }

    const salesPerDayArr = Object.entries(salesPerDay)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setSalesPerDayDataset(salesPerDayArr);
  }, [globalState.sales]);

  useEffect(() => {
    const _salesPerCollaborator: {
      [id: string]: { name: string; value: number };
    } = {};
    const collaborators: { [id: string]: Collaborator | null } = {};
    for (const sale of globalState.sales) {
      if (!(sale.collaborator in _salesPerCollaborator)) {
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
          _salesPerCollaborator[sale.collaborator] = {
            name: collaborator.name,
            value: sale.paidValue,
          };
        }
      } else _salesPerCollaborator[sale.collaborator].value += sale.paidValue;
    }

    setSalesPerCollaborator(
      Object.values(_salesPerCollaborator)
        .map(({ name, value }) => ({ label: { value: name }, value }))
        .sort((a, b) => b.value - a.value)
    );
  }, [globalState.collaborators, globalState.sales]);

  console.log(salesPerCollaborator);
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
          dataset={salesPerCollaborator as any}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "label",
              valueFormatter: (obj: any) => obj.value,
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
