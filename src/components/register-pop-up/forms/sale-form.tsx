import {
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { FormEvent, useState } from "react";
import { AlertInfo } from "../../custom-alert";
import {
  formatVehicle,
  getSaleValue,
  getTrimmed,
  roundNumber,
} from "../../../utils";
import { useGlobalState } from "../../../global-state-context";
import Button from "../../button/button";
import { editData, insertData } from "../../../apis/firebase";
import { CollaboratorType, Sale } from "../../../types";
import { Divider } from "../register-pop-up";
import Logo from "../../../assets/logo.png";
import {
  AddOutlined,
  ImageNotSupportedOutlined,
  RemoveOutlined,
} from "@mui/icons-material";

type Props = {
  isWaitingAsync: boolean;
  setIsWaitingAsync: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertInfo: React.Dispatch<React.SetStateAction<AlertInfo | undefined>>;
  close: () => void;
  editingData?: Sale;
};

export default function SaleForm({
  isWaitingAsync,
  setIsWaitingAsync,
  setAlertInfo,
  close,
  editingData,
}: Props) {
  const globalState = useGlobalState();
  const isEditing = !!editingData;

  const isAdmin = globalState?.loggedUser.type === CollaboratorType.Admin;

  const [data, setData] = useState({
    collaboratorId: isAdmin ? "" : globalState?.loggedUser.id || "",
    vehicleId: "",
    paymentMethodId: "",
    client: isEditing
      ? {
        name: "",
        phone: "",
        cep: "",
        city: "",
        neighborhood: "",
        street: "",
        number: "",
        complement: "",
      }
      : "",
    products: editingData?.products || {},
    paidFullPrice: !isEditing,
    paidValue: editingData?.paidValue.toFixed(2).replace(".", ",") || "",
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWaitingAsync || !globalState) return;

    try {
      setIsWaitingAsync(true);
      const trimmedData = getTrimmed(data);
      setData({ ...trimmedData });

      let finalData: any = { ...trimmedData };
      if (Object.keys(finalData.products).length === 0) {
        return setAlertInfo({
          severity: "error",
          message: "Nenhum produto selecionado",
        });
      }

      const saleValue = getSaleValue(finalData.products);
      if (finalData.paidFullPrice) {
        finalData.paidValue = saleValue;
      } else {
        finalData.paidValue = roundNumber(
          Number(finalData.paidValue.replace(",", "."))
        );
        if (
          isNaN(finalData.paidValue) ||
          finalData.paidValue < 0 ||
          finalData.paidValue > saleValue
        ) {
          return setAlertInfo({
            severity: "error",
            message: "Valor pago inválido",
          });
        }
      }

      delete finalData.paidFullPrice;
      if (isEditing) {
        finalData = { paidValue: finalData.paidValue };
      }

      let err = "";
      if (isEditing) {
        err = await editData("sales", editingData.id, finalData);
      } else {
        err = await insertData("sales", finalData);
      }

      if (!err) {
        setAlertInfo({
          severity: "success",
          message: `Venda ${isEditing ? "editada" : "cadastrada"}`,
        });
        close();
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
        message: `Falha ao tentar ${isEditing ? "editar" : "cadastrar"} venda`,
      });
    } finally {
      setIsWaitingAsync(false);
    }
  }

  if (!globalState) return null;

  return (
    <form onSubmit={handleSubmit}>
      {!isEditing && (
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
            <FormControl disabled={typeof data.client !== "string"} required>
              <InputLabel id="client-select-label">Cliente</InputLabel>
              <Select
                labelId="client-select-label"
                label="Cliente"
                value={typeof data.client === "string" ? data.client : ""}
                onChange={(e) => setData({ ...data, client: e.target.value })}
              >
                {globalState.clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{`${c.name}${!!c.cpfCnpj ? ` - ${c.cpfCnpj}` : ""
                    }`}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormGroup className="formgroup-checkbox">
              <FormControlLabel
                className="formcontrol-checkbox"
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
                    (data.client as any).name = e.target.value;
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
                    (data.client as any).phone = value;
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
                    (data.client as any).cep = value;
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
                    (data.client as any).city = e.target.value;
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
                    (data.client as any).neighborhood = e.target.value;
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
                    (data.client as any).street = e.target.value;
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
                    (data.client as any).number = value;
                    setData({ ...data });
                  }}
                />
                <TextField
                  label="Complemento"
                  variant="outlined"
                  type="text"
                  value={data.client.complement}
                  onChange={(e) => {
                    (data.client as any).complement = e.target.value;
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
                    <ImageNotSupportedOutlined fontSize="large" />
                  </div>
                )}

                <span>{p.name}</span>
                <span>{`R$ ${p.price.toFixed(2).replace(".", ",")}`}</span>

                <div className="set-quantity-container">
                  <IconButton
                    color="primary"
                    disabled={isWaitingAsync || !data.products[p.id]?.quantity}
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
                    <RemoveOutlined />
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
                    <AddOutlined />
                  </IconButton>
                </div>
              </Card>
            ))}
          </div>

          <Divider
            text={`Pagamento (Total: R$ ${getSaleValue(data.products, true)})`}
          />

          <div className="two-fields-container">
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
            <FormGroup className="formgroup-checkbox">
              <FormControlLabel
                className="formcontrol-checkbox"
                control={
                  <Checkbox
                    className="checkbox"
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
          </div>
        </>
      )}
      {isEditing && (
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

      <Button type="submit" disabled={isWaitingAsync}>
        {isEditing ? "Editar" : "Cadastrar"}
      </Button>
    </form>
  );
}
