import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  createTheme,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
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
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";

import "./dashboard.scss";
import LoadingScreen from "../../components/loading-screen";
import { useGlobalState } from "../../global-state-context";
import {
  Collaborator,
  appUserAttrsTranslator,
  Client,
  clientAttrsTranslator,
  Product,
  productAttrsTranslator,
  CollaboratorType,
  collaboratorTypeLabels,
  Vehicle,
  vehicleAttrsTranslator,
  vehicleTypeLabels,
  VehicleType,
  ClientType,
  clientTypeLabels,
  saleAttrsTranslator,
  Sale,
  paymentMethodLabels,
} from "../../types";
import RegisterPopUp from "./register-pop-up";
import CustomAlert, { AlertInfo } from "../../components/custom-alert";
import { deleteData, logout } from "../../apis/firebase";
import {
  formatAddress,
  formatDate,
  formatVehicle,
  getSaleValue,
} from "../../utils";

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

export type DataType =
  | "vehicles"
  | "clients"
  | "products"
  | "collaborators"
  | "sales";
export const dataTypeTranslator = {
  sales: { plural: "Vendas", singular: "Venda" },
  clients: { plural: "Clientes", singular: "Cliente" },
  collaborators: { plural: "Colaboradores", singular: "Colaborador" },
  products: { plural: "Produtos", singular: "Produto" },
  vehicles: { plural: "Veículos", singular: "Veículo" },
};
const attrsTranslator = {
  vehicles: vehicleAttrsTranslator,
  clients: clientAttrsTranslator,
  products: productAttrsTranslator,
  collaborators: appUserAttrsTranslator,
  sales: saleAttrsTranslator,
};

const tableCols = {
  sales: [
    "collaborator",
    "vehicle",
    "client",
    "paymentMethod",
    "createdAt",
    "products",
    "paidValue",
    "missingValue",
  ],
  clients: ["type", "name", "phone", "cpfCnpj", "address"],
  collaborators: ["name", "email", "cpf", "type"],
  products: ["name", "price", "photoSrc"],
  vehicles: ["type", "brand", "model", "plate"],
};

let photoSrc = "";
export default function Dashboard() {
  const navigate = useNavigate();
  const globalState = useGlobalState();
  const [seePhotoAnchorRef, setSeePhotoAnchorRef] =
    useState<HTMLTableCellElement | null>(null);

  const [isWaitingAsync, setIsWaitingAsync] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo | undefined>();

  const [dataType, setDataType] = useState<DataType>("sales");
  const [creatingDataType, setCreatingDataType] = useState<
    | {
        dataType: DataType;
        editingData?: Vehicle | Client | Product | Collaborator | Sale;
      }
    | undefined
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

  console.log(globalState);

  return (
    <div className="global-fullscreen-container dashboard-container">
      <Popover
        id="mouse-over-popover"
        disableRestoreFocus
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        open={!!seePhotoAnchorRef}
        anchorEl={seePhotoAnchorRef}
        onClose={() => setSeePhotoAnchorRef(null)}
      >
        <img
          src={photoSrc}
          alt="Foto do produto"
          draggable={false}
          style={{
            width: "10vw",
            height: "10vw",
          }}
          onMouseLeave={() => setSeePhotoAnchorRef(null)}
        />
      </Popover>

      <Button
        style={{ position: "absolute", top: "1vh", left: "1vw" }}
        variant="contained"
        color="error"
        onClick={logout}
      >
        SAIR(TEMP)
      </Button>

      <CustomAlert alertInfo={alertInfo} setAlertInfo={setAlertInfo} />

      {!!creatingDataType && (
        <RegisterPopUp
          close={() => setCreatingDataType(undefined)}
          dataType={creatingDataType.dataType}
          setAlertInfo={setAlertInfo}
          editingData={creatingDataType.editingData}
        />
      )}

      <ThemeProvider theme={themes}>
        <div className="content-container">
          <div className="upper-table-menu-container">
            <FormControl
              className="data-type-select-container"
              disabled={isWaitingAsync}
            >
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
                      {translatedType.plural}
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
            >{`Cadastrar ${dataTypeTranslator[dataType].singular}`}</Button>
          </div>

          <TableContainer component={Paper}>
            <Table stickyHeader sx={{ borderColor: "secondary" }}>
              <TableHead>
                <TableRow>
                  {tableCols[dataType].map((attr) => {
                    if (attr === "photoSrc")
                      return (
                        <Tooltip key={attr} title="Foto">
                          <TableCell>
                            <InsertPhotoOutlinedIcon />
                          </TableCell>
                        </Tooltip>
                      );

                    return (
                      <TableCell key={attr}>
                        {(attrsTranslator[dataType] as any)[attr]}
                      </TableCell>
                    );
                  })}

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
                      {tableCols[dataType].map((attr) => {
                        let value = "";
                        let color = "";

                        if (dataType === "clients") {
                          if (attr === "address")
                            value = formatAddress(el as Client);
                          else if (attr === "type")
                            value =
                              clientTypeLabels[
                                (el as Client).type as ClientType
                              ];
                        } else if (dataType === "collaborators") {
                          if (attr === "type")
                            value =
                              collaboratorTypeLabels[
                                (el as Collaborator).type as CollaboratorType
                              ];
                        } else if (dataType === "vehicles") {
                          if (attr === "type")
                            value =
                              vehicleTypeLabels[
                                (el as Vehicle).type as VehicleType
                              ];
                        } else if (dataType === "products") {
                          const product = el as Product;
                          if (attr === "photoSrc") {
                            return (
                              <Tooltip
                                key={`${el.id} ${attr}`}
                                title={
                                  !product.photoSrc
                                    ? "Este produto não possui foto"
                                    : ""
                                }
                              >
                                <TableCell
                                  onMouseEnter={(e) => {
                                    if (!isWaitingAsync && !!product.photoSrc) {
                                      photoSrc = product.photoSrc;
                                      setSeePhotoAnchorRef(e.currentTarget);
                                    }
                                  }}
                                >
                                  {!!product.photoSrc ? (
                                    <InsertPhotoOutlinedIcon />
                                  ) : (
                                    <ImageNotSupportedOutlinedIcon />
                                  )}
                                </TableCell>
                              </Tooltip>
                            );
                          } else if (attr === "price") {
                            value = product.price.toFixed(2).replace(".", ",");
                          }
                        } else if (dataType === "sales") {
                          const sale = el as Sale;
                          if (attr === "collaborator") {
                            const collaboratorId = sale.collaborator;
                            const collaborator = globalState.collaborators.find(
                              (c) => c.id === collaboratorId
                            );
                            value = collaborator?.name || "Não encontrado";
                          } else if (attr === "vehicle") {
                            const vehicleId = sale.vehicle;
                            const vehicle = globalState.vehicles.find(
                              (v) => v.id === vehicleId
                            );
                            value = !!vehicle
                              ? formatVehicle(vehicle)
                              : "Não encontrado";
                          } else if (attr === "client") {
                            if (typeof sale.client === "object") {
                              value = sale.client.name;
                            } else {
                              const clientId = sale.client;
                              const client = globalState.clients.find(
                                (v) => v.id === clientId
                              );
                              value = client?.name || "Não encontrado";
                            }
                          } else if (attr === "paymentMethod") {
                            value = paymentMethodLabels[sale.paymentMethod];
                          } else if (attr === "createdAt") {
                            value = formatDate(sale.createdAt, true);
                          } else if (attr === "products") {
                            value = getSaleValue(sale.products, true);
                          } else if (attr === "paidValue") {
                            value = sale.paidValue.toFixed(2).replace(".", ",");
                          } else if (attr === "missingValue") {
                            const missingValue =
                              getSaleValue(sale.products) - sale.paidValue;

                            value = missingValue.toFixed(2).replace(".", ",");
                            color = missingValue === 0 ? "green" : "red";
                          }
                        }

                        return (
                          <TableCell key={`${el.id} ${attr}`} style={{ color }}>
                            {value || (el as any)[attr]}
                          </TableCell>
                        );
                      })}
                      <Tooltip title="Editar">
                        <TableCell>
                          <Button
                            color="secondary"
                            disabled={isWaitingAsync}
                            onClick={() =>
                              setCreatingDataType({
                                dataType,
                                editingData: el,
                              })
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
                                  /* if ("photoSrc" in el && !!el.photoSrc) {
                                    await deleteFile(el.id, "photo.png");
                                  }
                                  await deleteDocument(dataType, el.id); */
                                  const err = await deleteData(dataType, el.id);
                                  if (!err) {
                                    setAlertInfo({
                                      severity: "success",
                                      message: `${dataTypeTranslator[dataType].singular} deletado`,
                                    });
                                  } else {
                                    setAlertInfo({
                                      severity: "error",
                                      message: err,
                                    });
                                  }
                                } catch (e) {
                                  console.log(e);
                                  setAlertInfo({
                                    severity: "error",
                                    message: `Falha ao tentar Deletar ${dataTypeTranslator[
                                      dataType
                                    ].singular.toLocaleLowerCase()}`,
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
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </ThemeProvider>
    </div>
  );
}
