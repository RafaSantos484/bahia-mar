import { BarChart, BarSeriesType } from "@mui/x-charts";
import {
  AxisConfig,
  AxisScaleConfig,
  ChartsXAxisProps,
  MakeOptional,
} from "@mui/x-charts/internals";
import { CSSProperties } from "react";

type Props = {
  dataset: { label: string; value: number }[];
  xAxis: MakeOptional<
    AxisConfig<keyof AxisScaleConfig, any, ChartsXAxisProps>,
    "id"
  >[];
  series: MakeOptional<BarSeriesType, "type">[];
  Title?: JSX.Element;
  style?: CSSProperties;
};

export function CustomBarChart({
  dataset,
  xAxis,
  series,
  Title,
  style,
}: Props) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        // height: "80%",
        alignItems: "center",
        width: "49%",
        minWidth: "500px",
        height: "50vh",
        ...style,
      }}
    >
      {Title}
      <BarChart dataset={dataset} xAxis={xAxis} series={series} />
    </div>
  );
}
