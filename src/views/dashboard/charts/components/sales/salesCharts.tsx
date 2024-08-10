import { useEffect, useState } from "react";
import PaidIcon from "@mui/icons-material/Paid";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import { GlobalState } from "../../../../../global-state-context";
import { formatIsoDate } from "../../../../../utils";
import "./salesCharts.scss";
import { DateLineChart } from "../../../../../components/date-line-chart";
import { Collaborator, Product } from "../../../../../types";
import { CustomBarChart } from "../../../../../components/custom-bar-chart";
import dayjs from "dayjs";

type Props = {
  globalState: GlobalState;
};

type DateSale = { date: string; value: number };
type LabelSale = {
  label: { value: string };
  value: any;
};

type TypeDict<T> = {
  [id: string]: T;
};

export function SalesCharts({ globalState }: Props) {
  const [collaboratorsDict, setCollaboratorsDict] = useState<
    TypeDict<Collaborator>
  >({});
  const [productsDict, setProductsDict] = useState<TypeDict<Product>>({});

  const [salesPerDateDayset, setSalesPerDayDataset] = useState<DateSale[]>([]);
  const [salesPerCollaborator, setSalesPerCollaborator] = useState<{
    earning: LabelSale[];
    count: LabelSale[];
  }>({ earning: [], count: [] });
  const [salesPerProduct, setSalesPerProduct] = useState<{
    earning: LabelSale[];
    count: LabelSale[];
  }>({ earning: [], count: [] });

  useEffect(() => {
    const _collaboratorsDict: TypeDict<Collaborator> = {};
    for (const collaborator of globalState.collaborators) {
      _collaboratorsDict[collaborator.id] = collaborator;
    }
    setCollaboratorsDict(_collaboratorsDict);
  }, [globalState.collaborators]);
  useEffect(() => {
    const _productsDict: TypeDict<Product> = {};
    for (const product of globalState.products) {
      _productsDict[product.id] = product;
    }
    setProductsDict(_productsDict);
  }, [globalState.products]);

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
      [id: string]: { name: string; value: { earning: number; count: number } };
    } = {};
    for (const sale of globalState.sales) {
      if (!(sale.collaboratorId in _salesPerCollaborator)) {
        const collaborator = collaboratorsDict[sale.collaboratorId];
        if (!!collaborator) {
          _salesPerCollaborator[sale.collaboratorId] = {
            name: collaborator.name,
            value: { earning: sale.paidValue, count: 1 },
          };
        }
      } else {
        _salesPerCollaborator[sale.collaboratorId].value.earning +=
          sale.paidValue;
        _salesPerCollaborator[sale.collaboratorId].value.count++;
      }
    }

    const earning = Object.values(_salesPerCollaborator)
      .map(({ name, value }) => ({
        label: { value: name },
        value: value.earning,
      }))
      .sort((a, b) => b.value - a.value);
    const count = Object.values(_salesPerCollaborator)
      .map(({ name, value }) => ({
        label: { value: name },
        value: value.count,
      }))
      .sort((a, b) => b.value - a.value);
    setSalesPerCollaborator({ earning, count });
  }, [collaboratorsDict, globalState.sales]);

  useEffect(() => {
    const _salesPerProduct: {
      [id: string]: { name: string; value: { earning: number; count: number } };
    } = {};
    for (const sale of globalState.sales) {
      for (const [id, info] of Object.entries(sale.products)) {
        if (!(id in _salesPerProduct)) {
          const product = productsDict[id];
          if (!!product) {
            _salesPerProduct[id] = {
              name: product.name,
              value: { earning: info.price * info.quantity, count: 1 },
            };
          }
        } else {
          _salesPerProduct[id].value.earning += info.price * info.quantity;
          _salesPerProduct[id].value.count++;
        }
      }
    }

    const earning = Object.values(_salesPerProduct)
      .map(({ name, value }) => ({
        label: { value: name },
        value: value.earning,
      }))
      .sort((a, b) => b.value - a.value);
    const count = Object.values(_salesPerProduct)
      .map(({ name, value }) => ({
        label: { value: name },
        value: value.count,
      }))
      .sort((a, b) => b.value - a.value);
    setSalesPerProduct({ earning, count });
  }, [productsDict, globalState.sales]);

  return (
    <div className="sales-charts-container">
      <div className="charts-container">
        <DateLineChart
          chartProps={{
            dataset: salesPerDateDayset,
            xAxis: [
              {
                scaleType: "band",
                dataKey: "date",
                valueFormatter: (value: string) =>
                  value.split("-").reverse().join("/"),
              },
            ],
            series: [
              {
                dataKey: "value",
              },
            ],
          }}
          Title={
            <div className="chart-title">
              <PaidIcon />
              <span>Faturamento</span>
            </div>
          }
          style={{ width: "98%" }}
        />

        <CustomBarChart
          dataset={salesPerCollaborator.earning as any}
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
        <CustomBarChart
          dataset={salesPerCollaborator.count as any}
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
              <LocalOfferIcon />
              <span>Vendas por Funcionário</span>
            </div>
          }
        />

        <CustomBarChart
          dataset={salesPerProduct.earning as any}
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
              <LocalDrinkIcon />
              <span>Faturamento por Produto</span>
            </div>
          }
        />
        <CustomBarChart
          dataset={salesPerProduct.count as any}
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
              <LocalOfferIcon />
              <span>Vendas por Produto</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
