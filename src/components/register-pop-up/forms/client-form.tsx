import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { FormEvent } from "react";
import { AlertInfo } from "../../custom-alert";
import { getTrimmed } from "../../../utils";
import { useGlobalState } from "../../../global-state-context";
import Button from "../../button/button";
import { editData, insertData } from "../../../apis/firebase";
import { Client, ClientType } from "../../../types";
import { Divider } from "../register-pop-up";

export type ClientFormData = {
  dataType: "clients";
  data: {
    type: ClientType;
    name: string;
    phone: string;
    cpfCnpj: string;
    cep: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    complement: string;
  };
  editingData?: Client;
};

type Props = {
  formData: ClientFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
  isWaitingAsync: boolean;
  setIsWaitingAsync: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertInfo: React.Dispatch<React.SetStateAction<AlertInfo | undefined>>;
  close: () => void;
};

export default function ClientForm({
  formData,
  setFormData,
  isWaitingAsync,
  setIsWaitingAsync,
  setAlertInfo,
  close,
}: Props) {
  const globalState = useGlobalState();
  const isEditing = !!formData.editingData;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWaitingAsync || !globalState) return;

    try {
      setIsWaitingAsync(true);
      formData = getTrimmed(formData);
      setFormData({ ...formData });

      const { dataType, data, editingData } = formData;
      const isEditing = !!editingData;

      let err = "";
      if (isEditing) {
        err = await editData(dataType, editingData.id, data);
      } else {
        err = await insertData(dataType, data);
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

  const { data } = formData;
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
              formData.data.type = e.target.value as ClientType;
              setFormData({ ...formData });
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
            formData.data.cpfCnpj = value;
            setFormData({ ...formData });
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
            formData.data.phone = value;
            setFormData({ ...formData });
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
          formData.data.name = e.target.value;
          setFormData({ ...formData });
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
            formData.data.cep = value;
            setFormData({ ...formData });
          }}
        />
        <TextField
          label="Cidade"
          variant="outlined"
          type="text"
          required
          value={data.city}
          onChange={(e) => {
            formData.data.city = e.target.value;
            setFormData({ ...formData });
          }}
        />
        <TextField
          label="Bairro"
          variant="outlined"
          type="text"
          required
          value={data.neighborhood}
          onChange={(e) => {
            formData.data.neighborhood = e.target.value;
            setFormData({ ...formData });
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
            formData.data.street = e.target.value;
            setFormData({ ...formData });
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
            formData.data.number = value;
            setFormData({ ...formData });
          }}
        />
        <TextField
          label="Complemento"
          variant="outlined"
          type="text"
          value={data.complement}
          onChange={(e) => {
            formData.data.complement = e.target.value;
            setFormData({ ...formData });
          }}
        />
      </div>

      <Button type="submit" disabled={isWaitingAsync}>
        {isEditing ? "Editar" : "Cadastrar"}
      </Button>
    </form>
  );
}
