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
import { Vehicle, VehicleType } from "../../../types";

export type VehicleFormData = {
  dataType: "vehicles";
  data: {
    type: VehicleType;
    brand: string;
    model: string;
    plate: string;
  };
  editingData?: Vehicle;
};

type Props = {
  formData: VehicleFormData;
  setFormData: React.Dispatch<React.SetStateAction<VehicleFormData>>;
  isWaitingAsync: boolean;
  setIsWaitingAsync: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertInfo: React.Dispatch<React.SetStateAction<AlertInfo | undefined>>;
  close: () => void;
};

export default function VehicleForm({
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

      const plateIsRegistered = !!globalState.vehicles.find(
        (v) => v.plate === data.plate
      );
      if (plateIsRegistered && (!isEditing || data.plate !== editingData.plate))
        return setAlertInfo({
          severity: "error",
          message: `A placa ${data.plate} já está cadastrada em outro veículo`,
        });
      /*
      if (isEditing && data.plate === editingData.plate) {
        delete data.plate;
      */

      let err = "";
      if (isEditing) {
        err = await editData(dataType, editingData.id, data);
      } else {
        err = await insertData(dataType, data);
      }

      if (!err) {
        setAlertInfo({
          severity: "success",
          message: `Veículo ${isEditing ? "editado" : "cadastrado"}`,
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
        } veículo`,
      });
    } finally {
      setIsWaitingAsync(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="two-fields-container">
        <FormControl>
          <InputLabel id="vehicle-type-select-label">Tipo</InputLabel>
          <Select
            labelId="vehicle-type-select-label"
            label="Tipo"
            value={formData.data.type}
            onChange={(e) => {
              formData.data.type = e.target.value as VehicleType;
              setFormData({ ...formData });
            }}
          >
            <MenuItem value={VehicleType.Motorcycle}>Moto</MenuItem>
            <MenuItem value={VehicleType.Car}>Carro</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Marca"
          variant="outlined"
          type="text"
          required
          value={formData.data.brand}
          onChange={(e) => {
            formData.data.brand = e.target.value;
            setFormData({ ...formData });
          }}
        />
      </div>
      <div className="two-fields-container">
        <TextField
          label="Modelo"
          variant="outlined"
          type="text"
          required
          value={formData.data.model}
          onChange={(e) => {
            formData.data.model = e.target.value;
            setFormData({ ...formData });
          }}
        />
        <TextField
          label="Placa"
          variant="outlined"
          type="text"
          inputProps={{
            pattern: "^[A-Z0-9]{7}$",
            title: "A placa deve conter 7 caracteres (letras ou dígitos)",
            maxLength: 7,
          }}
          required
          value={formData.data.plate}
          onChange={(e) => {
            let value = e.target.value.toUpperCase();
            value = value.replace(/[^A-Z0-9]/g, "");
            formData.data.plate = value;
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
