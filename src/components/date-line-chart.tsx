import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { LineChart, LineSeriesType } from "@mui/x-charts";
import {
  AxisConfig,
  AxisScaleConfig,
  ChartsXAxisProps,
  MakeOptional,
} from "@mui/x-charts/internals";
import { CSSProperties, useState } from "react";
import { formatIsoDate } from "../utils";

type Props = {
  dataset: any[];
  xAxis: MakeOptional<
    AxisConfig<keyof AxisScaleConfig, any, ChartsXAxisProps>,
    "id"
  >[];
  series: MakeOptional<LineSeriesType, "type">[];
  Title?: JSX.Element;
  style?: CSSProperties;
};

export function DateLineChart({ dataset, xAxis, series, Title, style }: Props) {
  const [orderBy, setOrderBy] = useState<"Dia" | "Mês" | "Ano">("Dia");

  style = style || {};

  xAxis = xAxis.map((axis) => ({ ...axis, label: orderBy }));
  if (orderBy === "Mês") {
    dataset = dataset.map((value) => ({
      ...value,
      date: value.date.slice(0, 7),
    }));
  }
  console.log(dataset);

  if (orderBy !== "Dia") {
    const salesPerDate: {
      [date: string]: number;
    } = {};
    const sliceEnd = orderBy === "Ano" ? 4 : 7;
    for (const data of dataset) {
      const date = data.date.slice(0, sliceEnd);
      if (!(date in salesPerDate)) {
        salesPerDate[date] = data.total;
      } else salesPerDate[date] += data.total;
    }

    dataset = Object.entries(salesPerDate).map(([date, total]) => ({
      date,
      total,
    }));
  }

  console.log(dataset);
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "80%",
        alignItems: "center",
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
      <LineChart dataset={dataset} xAxis={xAxis} series={series} />
    </div>
  );
}
