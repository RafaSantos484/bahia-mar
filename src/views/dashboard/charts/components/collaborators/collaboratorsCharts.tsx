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
import "./collaboratorsCharts.scss";
import { Collaborator, collaboratorTypeLabels } from "../../../../../types";
import { formatIsoDate } from "../../../../../utils";
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

export function CollaboratorsCharts({ globalState }: Props) {
  const [selectedCollaborator, setSelectedCollaborator] = useState<
    Collaborator | undefined
  >(undefined);

  return (
    <div className="collaborators-charts-container">
      {!selectedCollaborator && (
        <>
          <div className="title-container">
            <h1>Funcionários</h1>
            <h3>Selecione um funcionário</h3>
          </div>
          <div className="global-table-container table-container">
            <TableContainer component={Paper}>
              <Table stickyHeader sx={{ borderColor: "secondary" }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell>Tipo</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {globalState.collaborators.map((collaborator) => {
                    return (
                      <StyledTableRow
                        key={collaborator.id}
                        onClick={() => setSelectedCollaborator(collaborator)}
                      >
                        <TableCell>{collaborator.name}</TableCell>
                        <TableCell>{collaborator.cpf}</TableCell>
                        <TableCell>{collaborator.email}</TableCell>
                        <TableCell>
                          {collaboratorTypeLabels[collaborator.type]}
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

      {selectedCollaborator &&
        (() => {
          const collaboratorSales = globalState.sales.filter(
            (sale) => sale.collaborator === selectedCollaborator.id
          );

          let totalEarning = 0;
          const salesPerDay: {
            [day: string]: { total: number; count: number };
          } = {};

          let minDay = "";
          let maxDay = "";
          for (const sale of collaboratorSales) {
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
            <div className="collaborator-report-container">
              <Tooltip title="Voltar">
                <IconButton
                  className="return-btn"
                  color="primary"
                  onClick={() => setSelectedCollaborator(undefined)}
                >
                  <ArrowCircleLeftIcon />
                </IconButton>
              </Tooltip>

              <h1>{selectedCollaborator.name}</h1>

              <div className="info-container">
                <div className="info-card">
                  <span>Vendas</span>
                  <span>{collaboratorSales.length}</span>
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
