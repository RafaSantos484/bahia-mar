import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { LineChart, LineChartProps } from "@mui/x-charts";
import { DatasetType } from "@mui/x-charts/internals";
import { CSSProperties, useState } from "react";

type Props = {
  chartProps: LineChartProps;
  Title?: JSX.Element;
  style?: CSSProperties;
};

export function DateLineChart({ chartProps, Title, style }: Props) {
  const [orderBy, setOrderBy] = useState<"Dia" | "Mês" | "Ano">("Dia");

  style = style || {};

  chartProps.xAxis = chartProps.xAxis?.map((axis) => ({
    ...axis,
    label: orderBy,
  }));

  let dataset: DatasetType;
  if (!!chartProps.dataset && orderBy !== "Dia") {
    const salesPerDate: {
      [date: string]: number;
    } = {};
    const sliceEnd = orderBy === "Ano" ? 4 : 7;
    for (const data of chartProps.dataset as {
      date: string;
      value: number;
    }[]) {
      const date = data.date.slice(0, sliceEnd);
      if (!(date in salesPerDate)) {
        salesPerDate[date] = data.value;
      } else salesPerDate[date] += data.value;
    }

    dataset = Object.entries(salesPerDate).map(([date, value]) => ({
      date,
      value,
    }));
  } else {
    dataset = chartProps.dataset || [];
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        // flex: 1,
        // height: "80%",
        alignItems: "center",
        width: "49%",
        minWidth: "500px",
        height: "50vh",
        ...style,
      }}
    >
      <FormControl
        style={{
          position: "absolute",
          right: "1vw",
          top: "1vh",
          width: "120px",
          zIndex: 1,
        }}
      >
        <InputLabel id="order-by-select-label">Ordenar por</InputLabel>
        <Select
          labelId="order-by-select-label"
          label="Ordenar por"
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value as any)}
        >
          <MenuItem value={"Dia"}>Dia</MenuItem>
          <MenuItem value={"Mês"}>Mês</MenuItem>
          <MenuItem value={"Ano"}>Ano</MenuItem>
        </Select>
      </FormControl>

      {Title}
      <LineChart {...{ ...chartProps, dataset }} />
    </div>
  );
}
