import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

import { DataType, dataTypeTranslator } from "./dashboard";
import "./register-pop-up.scss";
import { sleep } from "../../utils";
import {
  Button,
  createTheme,
  IconButton,
  TextField,
  ThemeProvider,
} from "@mui/material";
import { pushDoc, setDocument } from "../../apis/firebase";
import { AlertInfo } from "../../components/custom-alert";
import { Client, Vehicle, Vehicles } from "../../types";

const themes = createTheme({
  palette: {
    primary: {
      main: "#214f6e",
    },
    secondary: {
      main: "#ffffff",
    },
  },
});

type Props = {
  close: () => void;
  dataType: DataType;
  setAlertInfo: Dispatch<SetStateAction<AlertInfo | undefined>>;
  vehicles: Vehicles;
  editingData?: Vehicle | Client;
  fadeTime?: number;
};

export default function RegisterPopUp({
  close,
  dataType,
  setAlertInfo,
  vehicles,
  editingData,
  fadeTime,
}: Props) {
  const _fadeTime = fadeTime || 200;
  const isEditing = !!editingData;
  const slicedDataType = dataTypeTranslator[dataType].slice(0, -1);

  const [isOpen, setIsOpen] = useState(true);
  const [isWaitingAsync, setIsWaitingAsync] = useState(false);

  const [data, setData] = useState<any>({});

  async function _close() {
    setIsOpen(false);
    await sleep(_fadeTime);
    close();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWaitingAsync) return;

    if (dataType === "vehicles") {
      if (data.plate.length !== 7)
        return setAlertInfo({
          severity: "error",
          message: `A placa deve possuir 7 caracteres`,
        });

      const plateIsRegistered = !!vehicles.find((v) => v.plate === data.plate);
      const _editingData = editingData as Vehicle;
      if (
        plateIsRegistered &&
        (!isEditing || data.plate !== _editingData.plate)
      )
        return setAlertInfo({
          severity: "error",
          message: `A placa ${data.plate} já está cadastrada em outro veículo`,
        });
    }

    setIsWaitingAsync(true);
    let _data;
    try {
      if (dataType === "vehicles") {
        _data = {
          type: data.type.trim(),
          brand: data.brand.trim(),
          model: data.model.trim(),
          plate: data.plate,
        };
      }

      if (isEditing) {
        await setDocument(dataType, editingData.id, _data);
      } else {
        await pushDoc(dataType, _data);
      }
      setAlertInfo({
        severity: "success",
        message: `${slicedDataType} ${isEditing ? "editado" : "cadastrado"}`,
      });
      _close();
    } catch (e) {
      console.log(e);
      setAlertInfo({
        severity: "error",
        message: `Falha ao tentar ${
          isEditing ? "editar" : "cadastrar"
        } ${slicedDataType.toLocaleLowerCase()}`,
      });
    } finally {
      setIsWaitingAsync(false);
    }
  }

  useEffect(() => {
    if (dataType === "vehicles") {
      const _editingData = editingData as Vehicle | undefined;
      setData({
        type: _editingData?.type || "",
        brand: _editingData?.brand || "",
        model: _editingData?.model || "",
        plate: _editingData?.plate,
      });
    } else if (dataType === "clients") {
      // ...
    } else {
      _close();
    }
    // eslint-disable-next-line
  }, [dataType]);

  return (
    <div
      className="global-absolute-fullscreen-container"
      style={{
        animation: `${isOpen ? "fade-in" : "fade-out"} ${_fadeTime + 50}ms`,
      }}
    >
      <ThemeProvider theme={themes}>
        <div className="register-pop-up-container">
          <div className="header-container">
            <span>{`Cadastrar ${slicedDataType}`}</span>
            <IconButton
              color="secondary"
              className="close-btn"
              disabled={isWaitingAsync}
              onClick={_close}
            >
              <HighlightOffOutlinedIcon />
            </IconButton>
          </div>

          <form onSubmit={handleSubmit}>
            {dataType === "vehicles" && (
              <>
                <div className="two-fields-container">
                  <TextField
                    label="Tipo"
                    variant="outlined"
                    type="text"
                    required
                    value={data.type}
                    onChange={(e) => setData({ ...data, type: e.target.value })}
                  />
                  <TextField
                    label="Marca"
                    variant="outlined"
                    type="text"
                    required
                    value={data.brand}
                    onChange={(e) =>
                      setData({ ...data, brand: e.target.value })
                    }
                  />
                </div>
                <div className="two-fields-container">
                  <TextField
                    label="Modelo"
                    variant="outlined"
                    type="text"
                    required
                    value={data.model}
                    onChange={(e) =>
                      setData({ ...data, model: e.target.value })
                    }
                  />
                  <TextField
                    label="Placa"
                    variant="outlined"
                    type="text"
                    inputProps={{
                      pattern: "^[A-Z0-9]{7}$",
                      title:
                        "A placa deve conter 7 caracteres (letras ou dígitos)",
                      maxlength: 7,
                    }}
                    required
                    value={data.plate}
                    onChange={(e) => {
                      let { value } = e.target;
                      value = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                      setData({ ...data, plate: value });
                    }}
                  />
                </div>
              </>
            )}

            <Button
              variant="contained"
              type="submit"
              disabled={isWaitingAsync}
              className="register-btn"
            >
              Cadastrar
            </Button>
          </form>
        </div>
      </ThemeProvider>
    </div>
  );
}
