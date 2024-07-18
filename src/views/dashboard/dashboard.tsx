import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  createTheme,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import "./dashboard.scss";
import LoadingScreen from "../../components/loading-screen";
import { useGlobalState } from "../../global-state-context";
import {
  Client,
  clientAttrsTranslator,
  Vehicle,
  vehicleAttrsTranslator,
} from "../../types";
import RegisterPopUp from "./register-pop-up";
import CustomAlert, { AlertInfo } from "../../components/custom-alert";
import { deleteDocument } from "../../apis/firebase";

const themes = createTheme({
  palette: {
    primary: {
      main: "#214f6e",
    },
    secondary: {
      main: "#000000",
    },
  },
});

export type DataType = "vehicles" | "clients";
export const dataTypeTranslator = {
  vehicles: "Veículos",
  clients: "Clientes",
};
const attrsTranslator = {
  vehicles: vehicleAttrsTranslator,
  clients: clientAttrsTranslator,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const globalState = useGlobalState();

  const [isWaitingAsync, setIsWaitingAsync] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo | undefined>();

  const [dataType, setDataType] = useState<DataType>("vehicles");
  const [creatingDataType, setCreatingDataType] = useState<
    { dataType: DataType; editingData?: Vehicle | Client } | undefined
  >(undefined);

  useEffect(() => {
    if (globalState === null) navigate("/");
  }, [globalState, navigate]);

  if (!globalState) {
    return (
      <div className="global-fullscreen-container">
        <LoadingScreen />
      </div>
    );
  }

  const slicedDataType = dataTypeTranslator[dataType].slice(0, -1);

  console.log(globalState);

  return (
    <div className="global-fullscreen-container dashboard-container">
      <CustomAlert alertInfo={alertInfo} setAlertInfo={setAlertInfo} />

      {!!creatingDataType && (
        <RegisterPopUp
          close={() => setCreatingDataType(undefined)}
          dataType={creatingDataType.dataType}
          setAlertInfo={setAlertInfo}
          vehicles={globalState.vehicles}
          editingData={creatingDataType.editingData}
        />
      )}

      <ThemeProvider theme={themes}>
        <div className="content-container">
          <div className="upper-table-menu-container">
            <FormControl className="data-type-select-container">
              <InputLabel id="data-type-select-label">
                Dado da tabela
              </InputLabel>
              <Select
                labelId="data-type-select-label"
                label="Dado da tabela"
                value={dataType}
                onChange={(e) => setDataType(e.target.value as DataType)}
              >
                {Object.entries(dataTypeTranslator).map(
                  ([type, translatedType]) => (
                    <MenuItem key={type} value={type}>
                      {translatedType}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              disabled={isWaitingAsync}
              onClick={() => setCreatingDataType({ dataType })}
            >{`Cadastrar ${slicedDataType}`}</Button>
          </div>

          <TableContainer component={Paper}>
            <Table stickyHeader sx={{ borderColor: "secondary" }}>
              <TableHead>
                <TableRow>
                  {Object.values(attrsTranslator[dataType]).map(
                    (translatedAttr) => (
                      <TableCell key={translatedAttr}>
                        {translatedAttr}
                      </TableCell>
                    )
                  )}
                  <Tooltip title="Editar">
                    <TableCell>
                      <EditOutlinedIcon />
                    </TableCell>
                  </Tooltip>
                  <Tooltip title="Deletar">
                    <TableCell>
                      <DeleteOutlineOutlinedIcon color="error" />
                    </TableCell>
                  </Tooltip>
                </TableRow>
              </TableHead>

              <TableBody>
                {globalState[dataType].map((el) => {
                  return (
                    <TableRow key={el.id}>
                      {Object.keys(attrsTranslator[dataType]).map((attr) => {
                        if (attr === "id" || attr === "createdAt") return null;

                        return (
                          <TableCell key={`${el.id} ${attr}`}>
                            {(el as any)[attr]}
                          </TableCell>
                        );
                      })}
                      <Tooltip title="Editar">
                        <TableCell>
                          <Button
                            color="secondary"
                            disabled={isWaitingAsync}
                            onClick={() =>
                              setCreatingDataType({ dataType, editingData: el })
                            }
                          >
                            <EditOutlinedIcon />
                          </Button>
                        </TableCell>
                      </Tooltip>
                      <Tooltip title="Deletar">
                        <TableCell>
                          <Button
                            color="error"
                            disabled={isWaitingAsync}
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "Deseja realmente deletar este item?"
                                )
                              ) {
                                setIsWaitingAsync(true);
                                try {
                                  await deleteDocument(dataType, el.id);
                                  setAlertInfo({
                                    severity: "success",
                                    message: `${slicedDataType} deletado`,
                                  });
                                } catch (e) {
                                  console.log(e);
                                  setAlertInfo({
                                    severity: "error",
                                    message: `Falha ao tentar Deletar ${slicedDataType.toLocaleLowerCase()}`,
                                  });
                                } finally {
                                  setIsWaitingAsync(false);
                                }
                              }
                            }}
                          >
                            <DeleteOutlineOutlinedIcon />
                          </Button>
                        </TableCell>
                      </Tooltip>
                    </TableRow>
                  );
                  /*
                  if (dataType === "vehicles") {
                    el = el as Vehicle;

                    return (
                      <TableRow key={el.id}>
                        <TableCell>{el.type}</TableCell>
                        <TableCell>{el.brand}</TableCell>
                        <TableCell>{el.model}</TableCell>
                        <TableCell>{el.plate}</TableCell>
                      </TableRow>
                    );
                  } else if (dataType === "clients") {
                    el = el as Client;

                    return (
                      <TableRow key={el.id}>
                        <TableCell>{el.type}</TableCell>
                        <TableCell>{el.name}</TableCell>
                        <TableCell>{el.phone}</TableCell>
                        <TableCell>{el.cpfCnpj}</TableCell>
                        <TableCell>{el.cep}</TableCell>
                        <TableCell>{el.city}</TableCell>
                        <TableCell>{el.neighborhood}</TableCell>
                        <TableCell>{el.street}</TableCell>
                        <TableCell>{el.number}</TableCell>
                        <TableCell>{el.complement}</TableCell>
                      </TableRow>
                    );
                  } else return null;
                   */
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </ThemeProvider>
    </div>
  );
}
