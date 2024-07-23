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
import { AppUser, Client, Product, Vehicle } from "../../types";
import { useGlobalState } from "../../global-state-context";
import { deleteField } from "firebase/firestore";

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
  editingData?: Vehicle | Client | Product | AppUser;
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

    const { vehicles, clients, products, appUsers } = globalState;

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
            message: `O nome ${data.name} já está cadastrada em outro produto`,
          });

        let numPrice = Number(data.price.replace(",", "."));
        if (isNaN(numPrice) || numPrice <= 0)
          return setAlertInfo({
            severity: "error",
            message: `Preço inválido`,
          });

        if (isEditing && !!_editingData.photoSrc && !data.photoSrc) {
          await deleteFile(_editingData.id, "photo.png");
          data.photoSrc = deleteField();
        }
      } else if (dataType === "appUsers") {
        if (data.password !== data.confirmPassword)
          return setAlertInfo({
            severity: "error",
            message: `As senhas não coincidem`,
          });

        const cpfIsRegistered = !!appUsers.find(
          (user) => user.cpf === data.cpf
        );
        const _editingData = editingData as AppUser;
        if (cpfIsRegistered && (!isEditing || data.cpf !== _editingData.cpf))
          return setAlertInfo({
            severity: "error",
            message: `O cpf ${data.cpf} já está cadastrado em outro usuário`,
          });

        const emailIsRegistered = !!appUsers.find(
          (user) => user.email === data.email
        );
        if (
          emailIsRegistered &&
          (!isEditing || data.email !== _editingData.email)
        )
          return setAlertInfo({
            severity: "error",
            message: `O email ${data.email} já está cadastrado em outro usuário`,
          });
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
      delete _data.photoSrc;
      if (isEditing) {
        await updateDocument(dataType, editingData.id, _data);
        id = editingData.id;
      } else {
        id = await pushDocument(dataType, _data);
      }
      if (photoSrc !== undefined) {
        if (
          typeof photoSrc === "string" &&
          !!photoSrc &&
          (!isEditing || (editingData as any).photoSrc !== photoSrc)
        ) {
          const response = await fetch(photoSrc);
          const blob = await response.blob();
          photoSrc = await uploadFile(id, "photo.png", blob);
        }

        await updateDocument(dataType, id, { photoSrc });
      }

      setAlertInfo({
        severity: "success",
        message: `${dataTypeTranslator[dataType].singular} ${
          isEditing ? "editado" : "cadastrado"
        }`,
      });
      _close();
    } catch (e) {
      console.log(e);
      setAlertInfo({
        severity: "error",
        message: `Falha ao tentar ${
          isEditing ? "editar" : "cadastrar"
        } ${dataTypeTranslator[dataType].singular.toLocaleLowerCase()}`,
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
      const newData: any = {
        name: _editingData?.name || "",
        price: _editingData?.price.toFixed(2).replace(".", ",") || "",
      };
      if (!!_editingData?.photoSrc) newData.photoSrc = _editingData.photoSrc;

      setData(newData);
    } else if (dataType === "appUsers") {
      const _editingData = editingData as AppUser | undefined;
      setData({
        name: _editingData?.name || "",
        email: _editingData?.email || "",
        cpf: _editingData?.cpf || "",
        type: _editingData?.type || "1",
        password: "",
        confirmPassword: "",
      });
    } else {
      _close();
    }
    // eslint-disable-next-line
  }, [dataType]);

  if (!data || !globalState) return <></>;

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
            <span>{`Cadastrar ${dataTypeTranslator[dataType].singular}`}</span>
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
                      maxLength: 7,
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
                      pattern: `^[0-9A-Z]{${
                        data.type === "Física" ? 11 : 14
                      }}$`,
                      title: `O ${
                        data.type === "Física" ? "CPF" : "CNPJ"
                      } deve conter ${
                        data.type === "Física" ? "11" : "14"
                      } caracteres`,
                      maxLength: data.type === "Física" ? 11 : 14,
                    }}
                    value={data.cpfCnpj}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase();
                      value = value.replace(/[^A-Z0-9]/g, "");
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
                      maxLength: 11,
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
                      maxLength: 8,
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
                    label="Logradouro"
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
            {dataType === "appUsers" && (
              <>
                <div className="two-fields-container">
                  <TextField
                    className="textfield"
                    label="E-mail"
                    type="email"
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isEditing}
                    value={data.email}
                    onChange={(e) =>
                      setData({ ...data, email: e.target.value.trim() })
                    }
                  />
                  <TextField
                    label="Nome"
                    variant="outlined"
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                  />
                </div>

                <div className="two-fields-container">
                  <Tooltip
                    title={
                      editingData?.id === globalState.loggedUser.id
                        ? "Você não pode alterar seu próprio tipo de usuário"
                        : ""
                    }
                  >
                    <FormControl
                      disabled={editingData?.id === globalState.loggedUser.id}
                    >
                      <InputLabel id="client-type-select-label">
                        Tipo
                      </InputLabel>
                      <Select
                        labelId="client-type-select-label"
                        label="Colaborador"
                        value={data.type}
                        onChange={(e) =>
                          setData({ ...data, type: e.target.value })
                        }
                      >
                        <MenuItem value="1">Colaborador</MenuItem>
                        <MenuItem value="0">Administrador</MenuItem>
                      </Select>
                    </FormControl>
                  </Tooltip>
                  <TextField
                    label="CPF"
                    variant="outlined"
                    type="text"
                    inputProps={{
                      pattern: `^[0-9A-Z]{11}$`,
                      title: `O CPF deve conter 11 caracteres`,
                      maxLength: 11,
                    }}
                    value={data.cpf}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase();
                      value = value.replace(/[^A-Z0-9]/g, "");
                      setData({ ...data, cpf: value });
                    }}
                  />
                </div>

                {!isEditing && (
                  <div className="two-fields-container">
                    <TextField
                      className="textfield"
                      label="Senha"
                      type="password"
                      variant="outlined"
                      fullWidth
                      required
                      inputProps={{ minLength: 6, maxLength: 15 }}
                      value={data.password}
                      onChange={(e) =>
                        setData({ ...data, password: e.target.value.trim() })
                      }
                    />
                    <TextField
                      className="textfield"
                      label="Confirmar senha"
                      type="password"
                      variant="outlined"
                      fullWidth
                      required
                      inputProps={{ minLength: 6, maxLength: 15 }}
                      value={data.confirmPassword}
                      onChange={(e) =>
                        setData({
                          ...data,
                          confirmPassword: e.target.value.trim(),
                        })
                      }
                    />
                  </div>
                )}
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
