import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import { FormEvent, useState } from "react";
import { AlertInfo } from "../../custom-alert";
import { getTrimmed } from "../../../utils";
import { useGlobalState } from "../../../global-state-context";
import Button from "../../button/button";
import { editData, insertData } from "../../../apis/firebase";
import { Collaborator, CollaboratorType } from "../../../types";

type Props = {
  isWaitingAsync: boolean;
  setIsWaitingAsync: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertInfo: React.Dispatch<React.SetStateAction<AlertInfo | undefined>>;
  close: () => void;
  editingData?: Collaborator;
};

export default function CollaboratorForm({
  isWaitingAsync,
  setIsWaitingAsync,
  setAlertInfo,
  close,
  editingData,
}: Props) {
  const globalState = useGlobalState();
  const isEditing = !!editingData;

  const [data, setData] = useState({
    name: editingData?.name || "",
    email: editingData?.email || "",
    cpf: editingData?.cpf || "",
    type: editingData?.type || CollaboratorType.Employee,
    password: "",
    confirmPassword: "",
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWaitingAsync || !globalState) return;

    try {
      setIsWaitingAsync(true);
      const trimmedData = getTrimmed(data);
      setData({ ...trimmedData });

      if (trimmedData.password !== trimmedData.confirmPassword)
        return setAlertInfo({
          severity: "error",
          message: `As senhas não coincidem`,
        });

      const cpfIsRegistered = !!globalState.collaborators.find(
        (c) => c.cpf !== "" && c.cpf === trimmedData.cpf
      );
      if (
        cpfIsRegistered &&
        (!isEditing || trimmedData.cpf !== editingData.cpf)
      )
        return setAlertInfo({
          severity: "error",
          message: `O cpf ${trimmedData.cpf} já está cadastrado em outro colaborador`,
        });

      const emailIsRegistered = !!globalState.collaborators.find(
        (user) => user.email === trimmedData.email
      );
      if (
        emailIsRegistered &&
        (!isEditing || trimmedData.email !== editingData.email)
      )
        return setAlertInfo({
          severity: "error",
          message: `O email ${trimmedData.email} já está cadastrado em outro colaborador`,
        });

      const finalData: any = { ...trimmedData };
      delete finalData.confirmPassword;
      if (isEditing) {
        delete finalData.email;
        delete finalData.password;
        if (editingData.id === globalState.loggedUser.id) {
          delete finalData.type;
        }
        /*
        if (editingData.cpf === finalData.cpf) {
          delete finalData.cpf;
        }
        */
      }

      let err = "";
      if (isEditing) {
        err = await editData("collaborators", editingData.id, finalData);
      } else {
        err = await insertData("collaborators", finalData);
      }

      if (!err) {
        setAlertInfo({
          severity: "success",
          message: `Colaborador ${isEditing ? "editado" : "cadastrado"}`,
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
        } colaborador`,
      });
    } finally {
      setIsWaitingAsync(false);
    }
  }

  if (!globalState) return null;

  return (
    <form onSubmit={handleSubmit}>
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
          onChange={(e) => setData({ ...data, email: e.target.value.trim() })}
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
          <FormControl disabled={editingData?.id === globalState.loggedUser.id}>
            <InputLabel id="client-type-select-label">Tipo</InputLabel>
            <Select
              labelId="client-type-select-label"
              label="Tipo"
              value={data.type}
              onChange={(e) =>
                setData({ ...data, type: e.target.value as CollaboratorType })
              }
            >
              <MenuItem value={CollaboratorType.Employee}>Vendedor</MenuItem>
              <MenuItem value={CollaboratorType.Admin}>Administrador</MenuItem>
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

      <Button type="submit" disabled={isWaitingAsync}>
        {isEditing ? "Editar" : "Cadastrar"}
      </Button>
    </form>
  );
}
