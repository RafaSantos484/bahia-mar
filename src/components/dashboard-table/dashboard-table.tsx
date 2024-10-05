import {
  Button,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import {
  CreatingDataType,
  DataType,
  dataTypeTranslator,
} from "../../views/dashboard/registrations/registrations";
import {
  DeleteOutlineOutlined,
  EditOutlined,
  ImageNotSupportedOutlined,
  InsertPhotoOutlined,
} from "@mui/icons-material";
import {
  appUserAttrsTranslator,
  Client,
  clientAttrsTranslator,
  ClientType,
  clientTypeLabels,
  Collaborator,
  CollaboratorType,
  collaboratorTypeLabels,
  PaymentMethodAttrsTranslator,
  Product,
  productAttrsTranslator,
  Sale,
  saleAttrsTranslator,
  Vehicle,
  vehicleAttrsTranslator,
  VehicleType,
  vehicleTypeLabels,
} from "../../types";
import {
  formatAddress,
  formatDate,
  formatVehicle,
  getSaleValue,
} from "../../utils";
import { GlobalState } from "../../global-state-context";
import { useState } from "react";
import { deleteData } from "../../apis/firebase";
import { AlertInfo } from "../custom-alert";

import './dashboard-table.scss'

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
  paymentMethods: ["name"],
};
const attrsTranslator = {
  vehicles: vehicleAttrsTranslator,
  clients: clientAttrsTranslator,
  products: productAttrsTranslator,
  collaborators: appUserAttrsTranslator,
  paymentMethods: PaymentMethodAttrsTranslator,
  sales: saleAttrsTranslator,
};

type Props = {
  dataType: DataType;
  isAdmin: boolean;
  globalState: GlobalState;
  creatingDataTypeGetSet: (newValue?: CreatingDataType) => CreatingDataType | undefined;
  setAlertInfo: React.Dispatch<React.SetStateAction<AlertInfo | undefined>>;
  isWaitingAsyncGetSet: (newValue?: boolean) => boolean;
};

export default function DashboardTable({
  dataType,
  isAdmin,
  globalState,
  creatingDataTypeGetSet,
  setAlertInfo,
  isWaitingAsyncGetSet,
}: Props) {
  const [photoSrc, setPhotoSrc] = useState("");
  const [seePhotoAnchorRef, setSeePhotoAnchorRef] =
    useState<HTMLTableCellElement | null>(null);

  const isWaitingAsync = isWaitingAsyncGetSet();

  return (
    <TableContainer component={Paper} className="main-table-box">
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

      <Table>
        <TableHead>
          <TableRow>
            {tableCols[dataType].map((attr) => {
              if (dataType === "sales" && attr === "collaborator" && !isAdmin) {
                return null;
              } else if (attr === "photoSrc")
                return (
                  <Tooltip key={attr} title="Foto">
                    <TableCell>
                      <InsertPhotoOutlined />
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
                {dataType !== "paymentMethods" && (
                  <Tooltip title="Editar">
                    <TableCell>
                      <p>Editar</p>
                    </TableCell>
                  </Tooltip>
                )}
                <Tooltip title="Deletar">
                  <TableCell>
                    <p>Deletar</p>
                  </TableCell>
                </Tooltip>
              </>
            )}
          </TableRow>
        </TableHead>

        <TableBody >
          {globalState[dataType].map((el) => {
            return (
              <TableRow key={el.id} className="table-row">
                {tableCols[dataType].map((attr) => {
                  let value = "";
                  let color = "";

                  if (dataType === "clients") {
                    if (attr === "address") value = formatAddress(el as Client);
                    else if (attr === "type")
                      value =
                        clientTypeLabels[(el as Client).type as ClientType];
                  } else if (dataType === "collaborators") {
                    if (attr === "type")
                      value =
                        collaboratorTypeLabels[
                        (el as Collaborator).type as CollaboratorType
                        ];
                  } else if (dataType === "vehicles") {
                    if (attr === "type")
                      value =
                        vehicleTypeLabels[(el as Vehicle).type as VehicleType];
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
                                // photoSrc = product.photoSrc;
                                setPhotoSrc(product.photoSrc);
                                setSeePhotoAnchorRef(e.currentTarget);
                              }
                            }}
                          >
                            {!!product.photoSrc ? (
                              <InsertPhotoOutlined />
                            ) : (
                              <ImageNotSupportedOutlined />
                            )}
                          </TableCell>
                        </Tooltip>
                      );
                    } else if (attr === "price") {
                      value = product.price.toFixed(2).replace(".", ",");
                    }
                  } else if (dataType === "sales") {
                    if (attr === "collaborator" && !isAdmin) {
                      return null;
                    }

                    const sale = el as Sale;
                    if (attr === "collaborator") {
                      const collaboratorId = sale.collaboratorId;
                      const collaborator = globalState.collaborators.find(
                        (c) => c.id === collaboratorId
                      );
                      value = collaborator?.name || "Não encontrado";
                    } else if (attr === "vehicle") {
                      const vehicleId = sale.vehicleId;
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
                      // value = paymentMethodLabels[sale.paymentMethod];
                      const paymentMethodId = sale.paymentMethodId;
                      const paymentMethod = globalState.paymentMethods.find(
                        (p) => p.id === paymentMethodId
                      );
                      value = paymentMethod?.name || "Não encontrado";
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

                {isAdmin && (
                  <>
                    {dataType !== "paymentMethods" && (
                      <Tooltip title="Editar">
                        <TableCell>
                          <Button
                            className="button-icon"
                            color="secondary"
                            disabled={isWaitingAsync}
                            onClick={() =>
                              creatingDataTypeGetSet({
                                dataType,
                                editingData: el,
                              })
                            }
                          >
                            <EditOutlined />
                          </Button>
                        </TableCell>
                      </Tooltip>
                    )}

                    <Tooltip
                      title={
                        dataType === "collaborators" &&
                          el.id === globalState.loggedUser.id
                          ? ""
                          : "Deletar"
                      }
                    >
                      <TableCell>
                        <Button
                          className="button-icon"
                          color="error"
                          disabled={
                            isWaitingAsync ||
                            (dataType === "collaborators" &&
                              el.id === globalState.loggedUser.id)
                          }
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Deseja realmente deletar este item?"
                              )
                            ) {
                              isWaitingAsyncGetSet(true);
                              try {
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
                                isWaitingAsyncGetSet(false);
                              }
                            }
                          }}
                        >
                          <DeleteOutlineOutlined />
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
  );
}
