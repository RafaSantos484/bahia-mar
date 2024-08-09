import {
  IconButton,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";

import { GlobalState } from "../../../../../global-state-context";
import "./clientsCharts.scss";
import { Client, clientTypeLabels } from "../../../../../types";
import { formatIsoDate, getClientDebt } from "../../../../../utils";
import { DateLineChart } from "../../../../../components/date-line-chart";
import dayjs from "dayjs";

type Props = {
  globalState: GlobalState;
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:active": {
    backgroundColor: theme.palette.action.selected,
  },
}));

export function ClientsCharts({ globalState }: Props) {
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(
    undefined
  );

  return (
    <div className="clients-charts-container">
      {!selectedClient && (
        <>
          <div className="title-container">
            <h1>Clientes</h1>
            <h3>Selecione um cliente</h3>
          </div>
          <div className="global-table-container table-container">
            <TableContainer component={Paper}>
              <Table stickyHeader sx={{ borderColor: "secondary" }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>CPF/CNPJ</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Dívida (R$)</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {globalState.clients.map((client) => {
                    const clientDebt = getClientDebt(
                      globalState.sales,
                      client.id,
                      true
                    );
                    return (
                      <StyledTableRow
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                      >
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.cpfCnpj}</TableCell>
                        <TableCell>{clientTypeLabels[client.type]}</TableCell>
                        <TableCell
                          style={{
                            color: clientDebt === "0,00" ? "green" : "red",
                          }}
                        >
                          {clientDebt}
                        </TableCell>
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}

      {selectedClient &&
        (() => {
          const clientSales = globalState.sales.filter(
            (sale) => sale.client === selectedClient.id
          );

          let totalEarning = 0;
          const salesPerDay: {
            [day: string]: { total: number; count: number };
          } = {};
          let minDay = "";
          let maxDay = "";
          for (const sale of clientSales) {
            const day = formatIsoDate(sale.createdAt);
            if (!minDay || day < minDay) {
              minDay = day;
            }
            if (!maxDay || day > maxDay) {
              maxDay = day;
            }

            if (!(day in salesPerDay)) {
              salesPerDay[day] = { total: 0, count: 0 };
            }

            totalEarning += sale.paidValue;
            salesPerDay[day].total += sale.paidValue;
            salesPerDay[day].count++;
          }

          if (!!minDay && !!maxDay) {
            let currDay = dayjs(minDay);
            const lastDay = dayjs(maxDay);
            while (!currDay.isSame(lastDay, "day")) {
              const day = currDay.format("YYYY-MM-DD");
              if (!(day in salesPerDay) && ![0, 6].includes(currDay.day())) {
                salesPerDay[day] = { total: 0, count: 0 };
              }
              currDay = currDay.add(1, "day");
            }
          }

          const salesPerDayDataset = Object.entries(salesPerDay)
            .map(([date, { total, count }]) => ({ date, total, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
          return (
            <div className="client-report-container">
              <Tooltip title="Voltar">
                <IconButton
                  className="return-btn"
                  color="primary"
                  onClick={() => setSelectedClient(undefined)}
                >
                  <ArrowCircleLeftIcon />
                </IconButton>
              </Tooltip>

              <h1>{selectedClient.name}</h1>

              <div className="info-container">
                <div className="info-card">
                  <span>Vendas</span>
                  <span>{clientSales.length}</span>
                </div>
                <div className="info-card">
                  <span>Faturamento</span>
                  <span>{`R$ ${totalEarning
                    .toFixed(2)
                    .replace(".", ",")}`}</span>
                </div>
              </div>

              <div className="charts-container">
                <DateLineChart
                  chartProps={{
                    dataset: salesPerDayDataset.map((sale) => ({
                      date: sale.date,
                      value: sale.total,
                    })),
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
                  Title={<span>Faturamento</span>}
                />
                <DateLineChart
                  chartProps={{
                    dataset: salesPerDayDataset.map((sale) => ({
                      date: sale.date,
                      value: sale.count,
                    })),
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
                    yAxis: [{ tickMinStep: 1, min: 0 }],
                  }}
                  Title={<span>Pedidos</span>}
                />
              </div>
            </div>
          );
        })()}
    </div>
  );
}
