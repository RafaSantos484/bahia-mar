import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import CancelIcon from "@mui/icons-material/Cancel";

import { DataType, dataTypeTranslator } from "./dashboard";
import "./register-pop-up.scss";
import { blobToString, resizeImage, sleep } from "../../utils";
import {
  Button,
  createTheme,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import {
  deleteFile,
  pushDocument,
  updateDocument,
  uploadFile,
} from "../../apis/firebase";
import { AlertInfo } from "../../components/custom-alert";
import { Client, Product, Vehicle } from "../../types";
import { useGlobalState } from "../../global-state-context";

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
  editingData?: Vehicle | Client | Product;
  fadeTime?: number;
};

function Divider({ text }: { text: string }) {
  return (
    <div className="divider-container">
      <span>{text}</span>
      <hr />
    </div>
  );
}

export default function RegisterPopUp({
  close,
  dataType,
  setAlertInfo,
  editingData,
  fadeTime,
}: Props) {
  const _fadeTime = fadeTime || 200;
  const isEditing = !!editingData;
  const slicedDataType = dataTypeTranslator[dataType].slice(0, -1);
  const globalState = useGlobalState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(true);
  const [isWaitingAsync, setIsWaitingAsync] = useState(false);

  const [data, setData] = useState<any>(undefined);

  async function _close() {
    setIsOpen(false);
    await sleep(_fadeTime);
    close();
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isWaitingAsync) return;

    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];
      setIsWaitingAsync(true);
      try {
        const resizedImage = await resizeImage(image, 300, 300);
        setData({ ...data, photoSrc: await blobToString(resizedImage) });
      } catch (e) {
        console.log(e);
        setAlertInfo({
          severity: "error",
          message: "Falha ao tentar carregar imagem",
        });
      } finally {
        setIsWaitingAsync(false);
        e.target.value = "";
      }
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWaitingAsync || !globalState) return;

    const { vehicles, clients, products } = globalState;

    try {
      if (dataType === "vehicles") {
        const plateIsRegistered = !!vehicles.find(
          (v) => v.plate === data.plate
        );
        const _editingData = editingData as Vehicle;
        if (
          plateIsRegistered &&
          (!isEditing || data.plate !== _editingData.plate)
        )
          return setAlertInfo({
            severity: "error",
            message: `A placa ${data.plate} já está cadastrada em outro veículo`,
          });
      } else if (dataType === "clients") {
        const cpfCnpjIsRegistered = !!clients.find(
          (c) => c.cpfCnpj === data.cpfCnpj
        );
        const _editingData = editingData as Client;
        if (
          cpfCnpjIsRegistered &&
          (!isEditing || data.cpfCnpj !== _editingData.cpfCnpj)
        )
          return setAlertInfo({
            severity: "error",
            message: `O ${data.type === "Física" ? "CPF" : "CNPJ"} ${
              data.cpfCnpj
            } já está cadastrado em outro cliente`,
          });
      } else if (dataType === "products") {
        const nameIsRegistered = !!products.find((p) => p.name === data.name);
        const _editingData = editingData as Product;
        if (nameIsRegistered && (!isEditing || data.name !== _editingData.name))
          return setAlertInfo({
            severity: "error",
            message: `O nome ${data.plate} já está cadastrada em outro produto`,
          });

        let numPrice = Number(data.price.replace(",", "."));
        if (isNaN(numPrice) || numPrice <= 0)
          return setAlertInfo({
            severity: "error",
            message: `Preço inválido`,
          });

        if (isEditing && !!_editingData.photoSrc && !data.photoSrc)
          await deleteFile(_editingData.id, "photo.png");
      }

      setIsWaitingAsync(true);

      const _data: any = {};
      for (const key in data) {
        if (typeof data[key] === "string") data[key] = data[key].trim();

        if (key === "price") {
          _data[key] = Number(data[key].replace(",", "."));
        } else {
          _data[key] = data[key];
        }
      }
      setData({ ...data });

      let id = "";
      let { photoSrc } = _data;
      _data.photoSrc = "";
      if (isEditing) {
        if (photoSrc === (editingData as any).photoSrc) photoSrc = "";

        await updateDocument(dataType, editingData.id, _data);
        id = editingData.id;
      } else {
        id = await pushDocument(dataType, _data);
      }
      if (!!photoSrc) {
        const response = await fetch(photoSrc);
        const blob = await response.blob();
        photoSrc = await uploadFile(id, "photo.png", blob);
        await updateDocument("products", id, { photoSrc });
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
      const _editingData = editingData as Client | undefined;
      setData({
        type: _editingData?.type || "Física",
        name: _editingData?.name || "",
        phone: _editingData?.phone || "",
        cpfCnpj: _editingData?.cpfCnpj || "",
        city: _editingData?.city || "",
        neighborhood: _editingData?.neighborhood || "",
        street: _editingData?.street || "",
        number: _editingData?.number || "",
        complement: _editingData?.complement || "",
      });
    } else if (dataType === "products") {
      const _editingData = editingData as Product | undefined;
      setData({
        name: _editingData?.name || "",
        price: _editingData?.price.toFixed(2).replace(".", ",") || "",
        photoSrc: _editingData?.photoSrc || "",
      });
    } else {
      _close();
    }
    // eslint-disable-next-line
  }, [dataType]);

  if (!data) return <></>;

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
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

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
            {dataType === "clients" && (
              <>
                <Divider text="Informações pessoais" />

                <div className="three-fields-container">
                  <FormControl>
                    <InputLabel id="client-type-select-label">
                      Pessoa
                    </InputLabel>
                    <Select
                      labelId="client-type-select-label"
                      label="Pessoa"
                      value={data.type}
                      onChange={(e) =>
                        setData({ ...data, type: e.target.value })
                      }
                    >
                      <MenuItem value="Física">Física</MenuItem>
                      <MenuItem value="Jurídica">Jurídica</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label={data.type === "Física" ? "CPF" : "CNPJ"}
                    variant="outlined"
                    type="text"
                    inputProps={{
                      pattern: `^[0-9]{${data.type === "Física" ? 11 : 14}}$`,
                      title: `O ${
                        data.type === "Física" ? "CPF" : "CNPJ"
                      } deve conter ${
                        data.type === "Física" ? "11" : "14"
                      } dígitos`,
                      maxlength: data.type === "Física" ? 11 : 14,
                    }}
                    required
                    value={data.cpfCnpj}
                    onChange={(e) => {
                      let { value } = e.target;
                      value = value.replace(/[^0-9]/g, "");
                      setData({ ...data, cpfCnpj: value });
                    }}
                  />
                  <TextField
                    label="Telefone"
                    variant="outlined"
                    type="text"
                    inputProps={{
                      pattern: "^[0-9]{10,11}$",
                      title: "O telefone deve conter 10 ou 11 dígitos",
                      maxlength: 11,
                    }}
                    required
                    value={data.phone}
                    onChange={(e) => {
                      let { value } = e.target;
                      value = value.replace(/[^0-9]/g, "");
                      setData({ ...data, phone: value });
                    }}
                  />
                </div>
                <TextField
                  label="Nome"
                  variant="outlined"
                  type="text"
                  required
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />

                <Divider text="Endereço" />

                <div className="three-fields-container">
                  <TextField
                    label="CEP"
                    variant="outlined"
                    type="text"
                    inputProps={{
                      pattern: "^[0-9]{8}$",
                      title: "O CEP deve possuir 8 dígitos",
                      maxlength: 8,
                    }}
                    value={data.cep}
                    onChange={(e) => {
                      let { value } = e.target;
                      value = value.replace(/[^0-9]/g, "");
                      setData({ ...data, cep: value });
                    }}
                  />
                  <TextField
                    label="Cidade"
                    variant="outlined"
                    type="text"
                    required
                    value={data.city}
                    onChange={(e) => setData({ ...data, city: e.target.value })}
                  />
                  <TextField
                    label="Bairro"
                    variant="outlined"
                    type="text"
                    required
                    value={data.neighborhood}
                    onChange={(e) =>
                      setData({ ...data, neighborhood: e.target.value })
                    }
                  />
                </div>
                <div className="three-fields-container">
                  <TextField
                    label="Rua"
                    variant="outlined"
                    type="text"
                    required
                    value={data.street}
                    onChange={(e) =>
                      setData({ ...data, street: e.target.value })
                    }
                  />
                  <TextField
                    label="Número"
                    variant="outlined"
                    type="text"
                    value={data.number}
                    onChange={(e) => {
                      let { value } = e.target;
                      value = value.replace(/[^0-9]/g, "");
                      setData({ ...data, number: value });
                    }}
                  />
                  <TextField
                    label="Complemento"
                    variant="outlined"
                    type="text"
                    value={data.complement}
                    onChange={(e) =>
                      setData({ ...data, complement: e.target.value })
                    }
                  />
                </div>
              </>
            )}
            {dataType === "products" && (
              <>
                <div className="two-fields-container">
                  <TextField
                    label="Nome"
                    variant="outlined"
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                  />
                  <TextField
                    label="Preço"
                    variant="outlined"
                    type="text"
                    inputProps={{
                      pattern: "^[0-9]+(,[0-9]{1,2})?$",
                      title: "O CEP deve possuir 8 dígitos",
                    }}
                    required
                    value={data.price}
                    onChange={(e) => {
                      const value = e.target.value.trim().replace(".", ",");
                      const priceRegex = /^\d+(,\d{0,2})?$/;
                      if (value === "" || priceRegex.test(value))
                        setData({ ...data, price: value });
                    }}
                  />
                </div>

                <div className="file-input-container">
                  <IconButton
                    className="clear-btn"
                    color="error"
                    disabled={isWaitingAsync || !data.photoSrc}
                    onClick={() => setData({ ...data, photoSrc: "" })}
                  >
                    <CancelIcon />
                  </IconButton>
                  {!!data.photoSrc ? (
                    <img
                      src={data.photoSrc}
                      draggable={false}
                      alt="Foto do produto"
                    />
                  ) : (
                    <Tooltip title="Fazer upload de foto">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="upload-btn"
                        disabled={isWaitingAsync}
                      >
                        <FileUploadOutlinedIcon />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </>
            )}

            <Button
              variant="contained"
              type="submit"
              disabled={isWaitingAsync}
              className="register-btn"
            >
              {isEditing ? "Editar" : "Cadastrar"}
            </Button>
          </form>
        </div>
      </ThemeProvider>
    </div>
  );
}
