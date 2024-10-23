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
import { Vehicle, VehicleType } from "../../../types";

type Props = {
  isWaitingAsync: boolean;
  setIsWaitingAsync: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertInfo: React.Dispatch<React.SetStateAction<AlertInfo | undefined>>;
  close: () => void;
  editingData?: Vehicle;
};

export default function VehicleForm({
  isWaitingAsync,
  setIsWaitingAsync,
  setAlertInfo,
  close,
  editingData,
}: Props) {
  const globalState = useGlobalState();
  const isEditing = !!editingData;

  const [data, setData] = useState({
    type: editingData?.type || VehicleType.Motorcycle,
    brand: editingData?.brand || "",
    model: editingData?.model || "",
    plate: editingData?.plate,
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWaitingAsync || !globalState) return;

    try {
      setIsWaitingAsync(true);
      const trimmedData = getTrimmed(data);
      setData({ ...trimmedData });

      const plateIsRegistered = !!globalState.vehicles.find(
        (v) => v.plate === trimmedData.plate
      );
      if (
        plateIsRegistered &&
        (!isEditing || trimmedData.plate !== editingData.plate)
      )
        return setAlertInfo({
          severity: "error",
          message: `A placa ${trimmedData.plate} já está cadastrada em outro veículo`,
        });
      /*
      if (isEditing && data.plate === editingData.plate) {
        delete data.plate;
      */

      let err = "";
      if (isEditing) {
        err = await editData("vehicles", editingData.id, data);
      } else {
        err = await insertData("vehicles", data);
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
            value={data.type}
            onChange={(e) => {
              data.type = e.target.value as VehicleType;
              setData({ ...data });
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
          value={data.brand}
          onChange={(e) => {
            data.brand = e.target.value;
            setData({ ...data });
          }}
        />
      </div>
      <div className="two-fields-container">
        <TextField
          label="Modelo"
          variant="outlined"
          type="text"
          required
          value={data.model}
          onChange={(e) => {
            data.model = e.target.value;
            setData({ ...data });
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
          value={data.plate}
          onChange={(e) => {
            let value = e.target.value.toUpperCase();
            value = value.replace(/[^A-Z0-9]/g, "");
            data.plate = value;
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
