import {
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { GlobalState } from "../../../../../global-state-context";
import "./collaboratorsCharts.scss";
import { Collaborator, collaboratorTypeLabels } from "../../../../../types";
import { useState } from "react";

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
  console.log(globalState);
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

      {selectedCollaborator && <div>{selectedCollaborator.name}</div>}
    </div>
  );
}
