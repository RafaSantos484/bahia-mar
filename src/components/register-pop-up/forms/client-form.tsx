import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { FormEvent, useState } from "react";
import { AlertInfo } from "../../custom-alert";
import { getTrimmed } from "../../../utils";
import { useGlobalState } from "../../../global-state-context";
import Button from "../../button/button";
import { editData, insertData } from "../../../apis/firebase";
import { Client, ClientType } from "../../../types";
import { Divider } from "../register-pop-up";

type Props = {
  isWaitingAsync: boolean;
  setIsWaitingAsync: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertInfo: React.Dispatch<React.SetStateAction<AlertInfo | undefined>>;
  close: () => void;
  editingData?: Client;
};

export default function ClientForm({
  isWaitingAsync,
  setIsWaitingAsync,
  setAlertInfo,
  close,
  editingData,
}: Props) {
  const globalState = useGlobalState();
  const isEditing = !!editingData;

  const [data, setData] = useState({
    type: editingData?.type || ClientType.Individual,
    name: editingData?.name || "",
    phone: editingData?.phone || "",
    cpfCnpj: editingData?.cpfCnpj || "",
    cep: editingData?.cep || "",
    city: editingData?.city || "",
    neighborhood: editingData?.neighborhood || "",
    street: editingData?.street || "",
    number: editingData?.number || "",
    complement: editingData?.complement || "",
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWaitingAsync || !globalState) return;

    try {
      setIsWaitingAsync(true);
      const trimeedData = getTrimmed(data);
      setData({ ...trimeedData });

      const isEditing = !!editingData;

      let err = "";
      if (isEditing) {
        err = await editData("clients", editingData.id, trimeedData);
      } else {
        err = await insertData("clients", trimeedData);
      }

      if (!err) {
        setAlertInfo({
          severity: "success",
          message: `Cliente ${isEditing ? "editado" : "cadastrado"}`,
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
        message: `Falha ao tentar ${
          isEditing ? "editar" : "cadastrar"
        } cliente`,
      });
    } finally {
      setIsWaitingAsync(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Divider text="Informações pessoais" />

      <div className="three-fields-container">
        <FormControl>
          <InputLabel id="client-type-select-label">Pessoa</InputLabel>
          <Select
            labelId="client-type-select-label"
            label="Pessoa"
            value={data.type}
            onChange={(e) => {
              data.type = e.target.value as ClientType;
              setData({ ...data });
            }}
          >
            <MenuItem value={ClientType.Individual}>Física</MenuItem>
            <MenuItem value={ClientType.Entity}>Jurídica</MenuItem>
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
            data.cpfCnpj = value;
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
          value={data.phone}
          onChange={(e) => {
            let { value } = e.target;
            value = value.replace(/[^0-9]/g, "");
            data.phone = value;
            setData({ ...data });
          }}
        />
      </div>
      <TextField
        label="Nome"
        variant="outlined"
        type="text"
        required
        value={data.name}
        onChange={(e) => {
          data.name = e.target.value;
          setData({ ...data });
        }}
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
            data.cep = value;
            setData({ ...data });
          }}
        />
        <TextField
          label="Cidade"
          variant="outlined"
          type="text"
          required
          value={data.city}
          onChange={(e) => {
            data.city = e.target.value;
            setData({ ...data });
          }}
        />
        <TextField
          label="Bairro"
          variant="outlined"
          type="text"
          required
          value={data.neighborhood}
          onChange={(e) => {
            data.neighborhood = e.target.value;
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
          value={data.street}
          onChange={(e) => {
            data.street = e.target.value;
            setData({ ...data });
          }}
        />
        <TextField
          label="Número"
          variant="outlined"
          type="text"
          value={data.number}
          onChange={(e) => {
            let { value } = e.target;
            value = value.replace(/[^0-9]/g, "");
            data.number = value;
            setData({ ...data });
          }}
        />
        <TextField
          label="Complemento"
          variant="outlined"
          type="text"
          value={data.complement}
          onChange={(e) => {
            data.complement = e.target.value;
            setData({ ...data });
          }}
        />
      </div>

      <Button type="submit" disabled={isWaitingAsync}>
        {isEditing ? "Editar" : "Cadastrar"}
      </Button>
    </form>
  );
}
