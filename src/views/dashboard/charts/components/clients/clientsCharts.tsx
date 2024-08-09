import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { LineChart } from "@mui/x-charts";
import { formatIsoDate, getClientDebt } from "../../../../../utils";

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
  const [orderBy, setOrderBy] = useState<"Dia" | "Mês" | "Ano">("Dia");

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
          const salesPerDate: {
            [date: string]: { total: number; count: number };
          } = {};
          for (const sale of clientSales) {
            const dateFormats = {
              Dia: "YYYY-MM-DD",
              Mês: "YYYY-MM",
              Ano: "YYYY",
            };
            const date = formatIsoDate(sale.createdAt, dateFormats[orderBy]);
            if (!(date in salesPerDate)) {
              salesPerDate[date] = { total: 0, count: 0 };
            }

            totalEarning += sale.paidValue;
            salesPerDate[date].total += sale.paidValue;
            salesPerDate[date].count++;
          }

          const salesPerDateDataset = Object.entries(salesPerDate)
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

              <FormControl className="select-order-by-container">
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
                <div className="chart-container">
                  <span>Faturamento</span>
                  <LineChart
                    dataset={salesPerDateDataset}
                    title="Faturamento"
                    xAxis={[
                      {
                        scaleType: "band",
                        dataKey: "date",
                        label: orderBy,
                        valueFormatter: (value: string) =>
                          value.split("-").reverse().join("/"),
                      },
                    ]}
                    series={[
                      {
                        dataKey: "total",
                      },
                    ]}
                  />
                </div>
                <div className="chart-container">
                  <span>Vendas</span>
                  <LineChart
                    dataset={salesPerDateDataset}
                    title="Faturamento"
                    xAxis={[
                      {
                        scaleType: "band",
                        dataKey: "date",
                        label: orderBy,
                        valueFormatter: (value: string) =>
                          value.split("-").reverse().join("/"),
                      },
                    ]}
                    yAxis={[
                      {
                        id: "count",
                        dataKey: "count",
                        tickMinStep: 1,
                        min: 0,
                      },
                    ]}
                    series={[
                      {
                        yAxisId: "count",
                        dataKey: "count",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
