import { useEffect, useState } from "react";
import PaidIcon from "@mui/icons-material/Paid";

import { GlobalState } from "../../../../../global-state-context";
import { formatIsoDate } from "../../../../../utils";
import "./salesCharts.scss";
import { DateLineChart } from "../../../../../components/date-line-chart";

type Props = {
  globalState: GlobalState;
};

type DateSale = { date: string; value: number };

export function SalesCharts({ globalState }: Props) {
  const [salesPerDateDayset, setSalesPerDayDataset] = useState<DateSale[]>([]);

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
      </div>
    </div>
  );
}
