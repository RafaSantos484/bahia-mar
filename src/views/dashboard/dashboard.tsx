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
  Client,
  clientAttrsTranslator,
  Product,
  productAttrsTranslator,
  Vehicle,
  vehicleAttrsTranslator,
} from "../../types";
import RegisterPopUp from "./register-pop-up";
import CustomAlert, { AlertInfo } from "../../components/custom-alert";
import { deleteDocument, deleteFile, logout } from "../../apis/firebase";
import { formatAddress } from "../../utils";

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

export type DataType = "vehicles" | "clients" | "products";
export const dataTypeTranslator = {
  vehicles: "Veículos",
  clients: "Clientes",
  products: "Produtos",
};
const attrsTranslator = {
  vehicles: vehicleAttrsTranslator,
  clients: clientAttrsTranslator,
  products: productAttrsTranslator,
};

const tableCols = {
  vehicles: ["type", "brand", "model", "plate"],
  clients: ["type", "name", "phone", "cpfCnpj", "address"],
  products: ["name", "price", "photoSrc"],
};

let photoSrc = "";
export default function Dashboard() {
  const navigate = useNavigate();
  const globalState = useGlobalState();
  const [seePhotoAnchorRef, setSeePhotoAnchorRef] =
    useState<HTMLTableCellElement | null>(null);

  const [isWaitingAsync, setIsWaitingAsync] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo | undefined>();

  const [dataType, setDataType] = useState<DataType>("vehicles");
  const [creatingDataType, setCreatingDataType] = useState<
    { dataType: DataType; editingData?: Vehicle | Client | Product } | undefined
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
                        if (attr === "photoSrc") {
                          return (
                            <>
                              <Tooltip
                                key={`${el.id} ${attr}`}
                                title={
                                  !(el as any)[attr]
                                    ? "Este produto não possui foto"
                                    : ""
                                }
                              >
                                <TableCell
                                  onMouseEnter={(e) => {
                                    photoSrc = (el as any)[attr];
                                    if (!isWaitingAsync && !!(el as any)[attr])
                                      setSeePhotoAnchorRef(e.currentTarget);
                                  }}
                                >
                                  {!!(el as any)[attr] ? (
                                    <InsertPhotoOutlinedIcon />
                                  ) : (
                                    <ImageNotSupportedOutlinedIcon />
                                  )}
                                </TableCell>
                              </Tooltip>
                            </>
                          );
                        }

                        let value: string;

                        if (attr === "address")
                          value = formatAddress(el as Client);
                        else if (attr === "price")
                          value = (el as any)[attr]
                            .toFixed(2)
                            .replace(".", ",");
                        else value = (el as any)[attr];

                        return (
                          <TableCell key={`${el.id} ${attr}`}>
                            {value}
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
                                  if ("photoSrc" in el && !!el.photoSrc) {
                                    await deleteFile(el.id, "photo.png");
                                  }
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
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </ThemeProvider>
    </div>
  );
}
