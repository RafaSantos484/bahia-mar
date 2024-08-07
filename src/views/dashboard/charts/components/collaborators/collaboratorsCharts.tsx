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
import { LineChart } from "@mui/x-charts";
import { Timestamp } from "firebase/firestore";
import { formatDate, formatIsoDate } from "../../../../../utils";

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
          <div className="table-container">
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
            [month: string]: { total: number; count: number };
          } = {};
          for (const sale of collaboratorSales) {
            const day = formatIsoDate(sale.createdAt);
            if (!(day in salesPerDay)) {
              salesPerDay[day] = { total: 0, count: 0 };
            }

            totalEarning += sale.paidValue;
            salesPerDay[day].total += sale.paidValue;
            salesPerDay[day].count++;
          }

          const salesPerDayDataset = Object.entries(salesPerDay)
            .map(([day, { total, count }]) => ({ day, total, count }))
            .sort((a, b) => a.day.localeCompare(b.day));
          console.log(salesPerDayDataset);
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
                <div className="chart-container">
                  <span>Faturamento</span>
                  <LineChart
                    dataset={salesPerDayDataset}
                    title="Faturamento"
                    xAxis={[
                      {
                        scaleType: "band",
                        dataKey: "day",
                        label: "Dia",
                        valueFormatter: (value: string) => formatDate(value),
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
                    dataset={salesPerDayDataset}
                    title="Faturamento"
                    xAxis={[
                      {
                        scaleType: "band",
                        dataKey: "day",
                        label: "Dia",
                        valueFormatter: (value: string) => formatDate(value),
                      },
                    ]}
                    yAxis={[
                      {
                        id: "count",
                        dataKey: "count",
                        tickMinStep: 1,
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
