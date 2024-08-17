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
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";

import "./register-pop-up.scss";
import {
  blobToString,
  formatVehicle,
  getSaleValue,
  getTrimmed,
  resizeImage,
  roundNumber,
  sleep,
} from "../../../utils";
import {
  Button,
  Card,
  Checkbox,
  createTheme,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import {
  editData,
  generateDocId,
  insertData,
  uploadFile,
} from "../../../apis/firebase";
import { AlertInfo } from "../../../components/custom-alert";
import {
  Collaborator,
  Client,
  Product,
  Vehicle,
  VehicleType,
  CollaboratorType,
  ClientType,
  Sale,
  PaymentMethod,
} from "../../../types";
import { GlobalState } from "../../../global-state-context";
import Logo from "../../../assets/logo.png";
import { dataTypeTranslator, DataType } from "./registrations";

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
  globalState: GlobalState;
  dataType: DataType;
  setAlertInfo: Dispatch<SetStateAction<AlertInfo | undefined>>;
  editingData?:
    | Vehicle
    | Client
    | Product
    | Collaborator
    | PaymentMethod
    | Sale;
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
  globalState,
  dataType,
  setAlertInfo,
  editingData,
  fadeTime,
}: Props) {
  const _fadeTime = fadeTime || 200;
  const isEditing = !!editingData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(true);
  const [isWaitingAsync, setIsWaitingAsync] = useState(false);

  const [data, setData] = useState<any>(undefined);

  const isAdmin = globalState.loggedUser.type === CollaboratorType.Admin;

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
    if (isWaitingAsync) return;

    const { vehicles, collaborators } = globalState;

    try {
      setIsWaitingAsync(true);
      const trimmedData = getTrimmed(data);
      let _data: any = { ...trimmedData };
      setData(trimmedData);

      let id: string | undefined = undefined;
      if (dataType === "vehicles") {
        const plateIsRegistered = !!vehicles.find(
          (v) => v.plate === _data.plate
        );
        const _editingData = editingData as Vehicle;
        if (
          plateIsRegistered &&
          (!isEditing || _data.plate !== _editingData.plate)
        )
          return setAlertInfo({
            severity: "error",
            message: `A placa ${_data.plate} já está cadastrada em outro veículo`,
          });

        if (isEditing && _data.plate === _editingData.plate) {
          delete _data.plate;
        }
      } else if (dataType === "clients") {
      } else if (dataType === "products") {
        _data.price = Number(_data.price.replace(",", "."));
        const _editingData = editingData as Product;

        if (isNaN(_data.price) || _data.price <= 0)
          return setAlertInfo({
            severity: "error",
            message: `Preço inválido`,
          });

        _data.photoSrc = _data.photoSrc || "";
        if (isEditing) {
          if (_editingData.photoSrc === _data.photoSrc) {
            delete _data.photoSrc;
          } else if (!!_data.photoSrc) {
            const response = await fetch(_data.photoSrc);
            const blob = await response.blob();
            _data.photoSrc = await uploadFile(
              editingData.id,
              "photo.png",
              blob
            );
          }
        } else if (!!_data.photoSrc) {
          id = generateDocId(dataType);
          const response = await fetch(_data.photoSrc);
          const blob = await response.blob();
          _data.photoSrc = await uploadFile(id, "photo.png", blob);
        }
      } else if (dataType === "collaborators") {
        if (_data.password !== _data.confirmPassword)
          return setAlertInfo({
            severity: "error",
            message: `As senhas não coincidem`,
          });

        const cpfIsRegistered = !!collaborators.find(
          (c) => c.cpf !== "" && c.cpf === _data.cpf
        );
        const _editingData = editingData as Collaborator;
        if (cpfIsRegistered && (!isEditing || _data.cpf !== _editingData.cpf))
          return setAlertInfo({
            severity: "error",
            message: `O cpf ${_data.cpf} já está cadastrado em outro colaborador`,
          });

        const emailIsRegistered = !!collaborators.find(
          (user) => user.email === _data.email
        );
        if (
          emailIsRegistered &&
          (!isEditing || _data.email !== _editingData.email)
        )
          return setAlertInfo({
            severity: "error",
            message: `O email ${_data.email} já está cadastrado em outro colaborador`,
          });

        delete _data.confirmPassword;
        if (isEditing) {
          delete _data.email;
          delete _data.password;
          if (_editingData.id === globalState.loggedUser.id) {
            delete _data.type;
          }
          if (_editingData.cpf === _data.cpf) {
            delete _data.cpf;
          }
        }
      } else if (dataType === "sales") {
        if (Object.keys(_data.products).length === 0) {
          return setAlertInfo({
            severity: "error",
            message: "Nenhum produto selecionado",
          });
        }

        const saleValue = getSaleValue(_data.products);
        if (_data.paidFullPrice) {
          _data.paidValue = saleValue;
        } else {
          _data.paidValue = roundNumber(
            Number(_data.paidValue.replace(",", "."))
          );
          if (
            isNaN(_data.paidValue) ||
            _data.paidValue < 0 ||
            _data.paidValue > saleValue
          ) {
            return setAlertInfo({
              severity: "error",
              message: "Valor pago inválido",
            });
          }
        }

        delete _data.paidFullPrice;
        if (isEditing) {
          _data = { paidValue: _data.paidValue };
        }
      }

      let err = "";
      if (isEditing) {
        err = await editData(dataType, editingData.id, _data);
      } else {
        err = await insertData(dataType, _data, id);
      }

      if (!err) {
        setAlertInfo({
          severity: "success",
          message: `${dataTypeTranslator[dataType].singular} ${
            isEditing ? "editado" : "cadastrado"
          }`,
        });
        _close();
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
        type: _editingData?.type || VehicleType.Motorcycle,
        brand: _editingData?.brand || "",
        model: _editingData?.model || "",
        plate: _editingData?.plate,
      });
    } else if (dataType === "clients") {
      const _editingData = editingData as Client | undefined;
      setData({
        type: _editingData?.type || ClientType.Individual,
        name: _editingData?.name || "",
        phone: _editingData?.phone || "",
        cpfCnpj: _editingData?.cpfCnpj || "",
        cep: _editingData?.cep || "",
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
    } else if (dataType === "collaborators") {
      const _editingData = editingData as Collaborator | undefined;
      setData({
        name: _editingData?.name || "",
        email: _editingData?.email || "",
        cpf: _editingData?.cpf || "",
        type: _editingData?.type || CollaboratorType.Employee,
        password: "",
        confirmPassword: "",
      });
    } else if (dataType === "paymentMethods") {
      setData({ name: "" });
    } else if (dataType === "sales") {
      const _editingData = editingData as Sale | undefined;
      setData({
        collaboratorId: isAdmin ? "" : globalState.loggedUser.id,
        vehicleId: "",
        paymentMethodId: "",
        client: "",
        products: _editingData?.products || {},
        paidFullPrice: !isEditing,
        paidValue: _editingData?.paidValue.toFixed(2).replace(".", ",") || "",
      });
    } else {
      _close();
    }
    // eslint-disable-next-line
  }, [dataType]);

  if (!data) return <></>;

  console.log(data);
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
            <span>{`${isEditing ? "Editar" : "Cadastrar"} ${
              dataTypeTranslator[dataType].singular
            }`}</span>
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
                  <FormControl>
                    <InputLabel id="vehicle-type-select-label">Tipo</InputLabel>
                    <Select
                      labelId="vehicle-type-select-label"
                      label="Tipo"
                      value={data.type}
                      onChange={(e) =>
                        setData({ ...data, type: e.target.value })
                      }
                    >
                      <MenuItem value="1">Moto</MenuItem>
                      <MenuItem value="0">Carro</MenuItem>
                    </Select>
                  </FormControl>
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
                      <MenuItem value="0">Física</MenuItem>
                      <MenuItem value="1">Jurídica</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label={data.type === ClientType.Individual ? "CPF" : "CNPJ"}
                    variant="outlined"
                    type="text"
                    inputProps={{
                      pattern: `^[0-9A-Z]{${
                        data.type === ClientType.Individual ? 11 : 14
                      }}$`,
                      title: `O ${
                        data.type === ClientType.Individual ? "CPF" : "CNPJ"
                      } deve conter ${
                        data.type === ClientType.Individual ? "11" : "14"
                      } caracteres`,
                      maxLength: data.type === ClientType.Individual ? 11 : 14,
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
                    onClick={() => {
                      delete data.photoSrc;
                      setData({ ...data });
                    }}
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
            {dataType === "collaborators" && (
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
                        label="Tipo"
                        value={data.type}
                        onChange={(e) =>
                          setData({ ...data, type: e.target.value })
                        }
                      >
                        <MenuItem value="1">Vendedor</MenuItem>
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

            {dataType === "paymentMethods" && (
              <TextField
                label="Nome"
                variant="outlined"
                type="text"
                required
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            )}

            {dataType === "sales" && !isEditing && (
              <>
                <Divider text="Informações da venda" />

                <div
                  className={
                    isAdmin ? "three-fields-container" : "two-fields-container"
                  }
                >
                  {isAdmin && (
                    <FormControl required>
                      <InputLabel id="collaborator-select-label">
                        Funcionário
                      </InputLabel>
                      <Select
                        labelId="collaborator-select-label"
                        label="Funcionário"
                        value={data.collaboratorId}
                        onChange={(e) =>
                          setData({ ...data, collaboratorId: e.target.value })
                        }
                      >
                        {globalState.collaborators.map((c) => (
                          <MenuItem
                            key={c.id}
                            value={c.id}
                          >{`${c.name} - ${c.email}`}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <FormControl required>
                    <InputLabel id="vehicle-select-label">Veículo</InputLabel>
                    <Select
                      labelId="vehicle-select-label"
                      label="Veículo"
                      value={data.vehicleId}
                      onChange={(e) =>
                        setData({ ...data, vehicleId: e.target.value })
                      }
                    >
                      {globalState.vehicles.map((v) => (
                        <MenuItem key={v.id} value={v.id}>
                          {formatVehicle(v)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl required>
                    <InputLabel id="payment-method-select-label">
                      Mét. de pagamento
                    </InputLabel>
                    <Select
                      labelId="payment-method-select-label"
                      label="Mét. de pagamento"
                      value={data.paymentMethodId}
                      onChange={(e) =>
                        setData({ ...data, paymentMethodId: e.target.value })
                      }
                    >
                      {globalState.paymentMethods.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <Divider text="Cliente" />

                <div className="two-fields-container">
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={typeof data.client === "string"}
                          onChange={(e) => {
                            const { checked } = e.target;
                            setData({
                              ...data,
                              client: checked
                                ? ""
                                : {
                                    name: "",
                                    phone: "",
                                    cep: "",
                                    city: "",
                                    neighborhood: "",
                                    street: "",
                                    number: "",
                                    complement: "",
                                  },
                            });
                          }}
                        />
                      }
                      label="Usar cliente cadastrado"
                      labelPlacement="start"
                    />
                  </FormGroup>
                  <FormControl
                    disabled={typeof data.client !== "string"}
                    required
                  >
                    <InputLabel id="client-select-label">Cliente</InputLabel>
                    <Select
                      labelId="client-select-label"
                      label="Cliente"
                      value={typeof data.client === "string" ? data.client : ""}
                      onChange={(e) =>
                        setData({ ...data, client: e.target.value })
                      }
                    >
                      {globalState.clients.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{`${c.name}${
                          !!c.cpfCnpj ? ` - ${c.cpfCnpj}` : ""
                        }`}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {typeof data.client === "object" && (
                  <>
                    <div className="two-fields-container">
                      <TextField
                        label="Nome"
                        variant="outlined"
                        type="text"
                        required
                        value={data.client.name}
                        onChange={(e) => {
                          data.client.name = e.target.value;
                          setData({ ...data });
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
                        value={data.client.phone}
                        onChange={(e) => {
                          let { value } = e.target;
                          value = value.replace(/[^0-9]/g, "");
                          data.client.phone = value;
                          setData({ ...data });
                        }}
                      />
                    </div>
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
                        value={data.client.cep}
                        onChange={(e) => {
                          let { value } = e.target;
                          value = value.replace(/[^0-9]/g, "");
                          data.client.cep = value;
                          setData({ ...data });
                        }}
                      />
                      <TextField
                        label="Cidade"
                        variant="outlined"
                        type="text"
                        required
                        value={data.client.city}
                        onChange={(e) => {
                          data.client.city = e.target.value;
                          setData({ ...data });
                        }}
                      />
                      <TextField
                        label="Bairro"
                        variant="outlined"
                        type="text"
                        required
                        value={data.client.neighborhood}
                        onChange={(e) => {
                          data.client.neighborhood = e.target.value;
                          setData({ ...data });
                        }}
                      />
                    </div>
                    <div className="three-fields-container">
                      <TextField
                        label="Logradouro"
                        variant="outlined"
                        type="text"
                        required
                        value={data.client.street}
                        onChange={(e) => {
                          data.client.street = e.target.value;
                          setData({ ...data });
                        }}
                      />
                      <TextField
                        label="Número"
                        variant="outlined"
                        type="text"
                        value={data.client.number}
                        onChange={(e) => {
                          let { value } = e.target;
                          value = value.replace(/[^0-9]/g, "");
                          data.client.number = value;
                          setData({ ...data });
                        }}
                      />
                      <TextField
                        label="Complemento"
                        variant="outlined"
                        type="text"
                        value={data.client.complement}
                        onChange={(e) => {
                          data.client.complement = e.target.value;
                          setData({ ...data });
                        }}
                      />
                    </div>
                  </>
                )}

                <Divider text="Produtos" />

                <div className="products-container">
                  {globalState.products.map((p) => (
                    <Card key={p.id}>
                      {!!p.photoSrc ? (
                        <img
                          className="product-img"
                          src={p.photoSrc || Logo}
                          alt={p.name}
                          draggable={false}
                        />
                      ) : (
                        <div className="product-img">
                          <ImageNotSupportedOutlinedIcon fontSize="large" />
                        </div>
                      )}

                      <span>{p.name}</span>
                      <span>{`R$ ${p.price
                        .toFixed(2)
                        .replace(".", ",")}`}</span>

                      <div className="set-quantity-container">
                        <IconButton
                          color="primary"
                          disabled={
                            isWaitingAsync || !data.products[p.id]?.quantity
                          }
                          onClick={() => {
                            if (p.id in data.products) {
                              data.products[p.id].quantity--;
                              if (data.products[p.id].quantity === 0) {
                                delete data.products[p.id];
                              }

                              setData({ ...data });
                            }
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <span>{data.products[p.id]?.quantity || "0"}</span>
                        <IconButton
                          color="primary"
                          onClick={() => {
                            if (p.id in data.products) {
                              data.products[p.id].quantity++;
                            } else {
                              data.products[p.id] = {
                                price: p.price,
                                quantity: 1,
                              };
                            }

                            setData({ ...data });
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </div>
                    </Card>
                  ))}
                </div>

                <Divider
                  text={`Pagamento (Total: R$ ${getSaleValue(
                    data.products,
                    true
                  )})`}
                />

                <div className="two-fields-container">
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={data.paidFullPrice}
                          onChange={(e) => {
                            const { checked } = e.target;
                            let paidValue = checked ? "" : "0";

                            setData({
                              ...data,
                              paidFullPrice: checked,
                              paidValue,
                            });
                          }}
                        />
                      }
                      label="Pagou valor total"
                      labelPlacement="start"
                    />
                  </FormGroup>
                  <TextField
                    label="Valor pago"
                    variant="outlined"
                    type="text"
                    required
                    disabled={data.paidFullPrice}
                    value={data.paidValue}
                    onChange={(e) => {
                      const { value } = e.target;
                      if (/^(\d+(,\d{0,2})?)?$/.test(value)) {
                        setData({ ...data, paidValue: value });
                      }
                    }}
                  />
                </div>
              </>
            )}
            {dataType === "sales" && isEditing && (
              <div className="two-fields-container">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.paidFullPrice}
                        onChange={(e) => {
                          const { checked } = e.target;
                          let paidValue = checked ? "" : "0";

                          setData({
                            ...data,
                            paidFullPrice: checked,
                            paidValue,
                          });
                        }}
                      />
                    }
                    label="Pagou valor total"
                    labelPlacement="start"
                  />
                </FormGroup>
                <TextField
                  label="Valor pago"
                  variant="outlined"
                  type="text"
                  required
                  disabled={data.paidFullPrice}
                  value={data.paidValue}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (/^(\d+(,\d{0,2})?)?$/.test(value)) {
                      setData({ ...data, paidValue: value });
                    }
                  }}
                />
              </div>
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
