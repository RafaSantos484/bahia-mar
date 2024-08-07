import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  createTheme,
  FormControl,
  IconButton,
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
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import TableChartIcon from "@mui/icons-material/TableChart";

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
    info: {
      main: "#ffffff",
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
  const [isLeftBarOpen, setIsLeftBarOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<"table" | "charts">("table");

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
  const isAdmin = globalState.loggedUser.type === CollaboratorType.Admin;

  return (
    <div className="global-fullscreen-container dashboard-container">
      <CustomAlert alertInfo={alertInfo} setAlertInfo={setAlertInfo} />
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

      {!!creatingDataType && (
        <RegisterPopUp
          close={() => setCreatingDataType(undefined)}
          globalState={globalState}
          dataType={creatingDataType.dataType}
          setAlertInfo={setAlertInfo}
          editingData={creatingDataType.editingData}
        />
      )}

      <ThemeProvider theme={themes}>
        <div className="content-container">
          <div
            className="left-bar-container"
            style={{ width: isLeftBarOpen ? "15vw" : "5vw" }}
          >
            <div className="buttons-container">
              <IconButton
                style={{ alignSelf: "center" }}
                onClick={() => setIsLeftBarOpen(!isLeftBarOpen)}
                color="info"
              >
                <MenuIcon />
              </IconButton>

              <Button
                className="button-container"
                color={selectedPage === "table" ? "info" : "secondary"}
                onClick={() => setSelectedPage("table")}
              >
                <Tooltip title={isLeftBarOpen ? "" : "Cadastros"}>
                  <TableChartIcon />
                </Tooltip>
                <span>Cadastros</span>
              </Button>
            </div>

            <div className="buttons-container">
              {/*<Button className="button-container" color="info">
                <Tooltip title={isLeftBarOpen ? "" : "Opções"}>
                  <SettingsIcon />
                </Tooltip>
                <span>Opções</span>
              </Button> */}
              <Button
                className="button-container"
                onClick={logout}
                color="error"
              >
                <Tooltip title={isLeftBarOpen ? "" : "Sair"}>
                  <MeetingRoomIcon />
                </Tooltip>
                <span>Sair</span>
              </Button>
            </div>
          </div>

          <div className="table-container">
            <div className="upper-table-menu-container">
              {isAdmin && (
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
              )}

              <Button
                variant="contained"
                color="primary"
                style={{ marginLeft: "auto" }}
                disabled={isWaitingAsync}
                onClick={() => setCreatingDataType({ dataType })}
              >{`Cadastrar ${dataTypeTranslator[dataType].singular}`}</Button>
            </div>

            <TableContainer component={Paper}>
              <Table stickyHeader sx={{ borderColor: "secondary" }}>
                <TableHead>
                  <TableRow>
                    {tableCols[dataType].map((attr) => {
                      if (
                        dataType === "sales" &&
                        attr === "collaborator" &&
                        !isAdmin
                      ) {
                        return null;
                      } else if (attr === "photoSrc")
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

                    {isAdmin && (
                      <>
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
                      </>
                    )}
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
                                      if (
                                        !isWaitingAsync &&
                                        !!product.photoSrc
                                      ) {
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
                              value = product.price
                                .toFixed(2)
                                .replace(".", ",");
                            }
                          } else if (dataType === "sales") {
                            if (attr === "collaborator" && !isAdmin) {
                              return null;
                            }

                            const sale = el as Sale;
                            if (attr === "collaborator") {
                              const collaboratorId = sale.collaborator;
                              const collaborator =
                                globalState.collaborators.find(
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
                              value = sale.paidValue
                                .toFixed(2)
                                .replace(".", ",");
                            } else if (attr === "missingValue") {
                              const missingValue =
                                getSaleValue(sale.products) - sale.paidValue;

                              value = missingValue.toFixed(2).replace(".", ",");
                              color = missingValue === 0 ? "green" : "red";
                            }
                          }

                          return (
                            <TableCell
                              key={`${el.id} ${attr}`}
                              style={{ color }}
                            >
                              {value || (el as any)[attr]}
                            </TableCell>
                          );
                        })}

                        {isAdmin && (
                          <>
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
                                        const err = await deleteData(
                                          dataType,
                                          el.id
                                        );
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
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
