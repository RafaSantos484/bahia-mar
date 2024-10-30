import {
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
} from "@mui/material";

import "./select-input.scss";
import { Children } from "react";

type DataType =
  | "vehicles"
  | "clients"
  | "products"
  | "collaborators"
  | "paymentMethods"
  | "sales";

type SelectProps = {
  isWaitingAsync: boolean;
  isAdmin: boolean;
  dataTypes: Array<{ value: DataType; label: string }>;
  selectedDataType: DataType;
  setSelectedDataType: (value: DataType) => void;
};

const Select = ({
  isWaitingAsync,
  isAdmin,
  dataTypes,
  selectedDataType,
  setSelectedDataType,
}: SelectProps) => {
  if (!isAdmin) {
    return null;
  }

  return (
    <FormControl
      className="form-control-select"
      disabled={isWaitingAsync}
      sx={{ borderRadius: "10px" }}
    >
      <InputLabel id="data-type-select-label">Dado da tabela</InputLabel>
      <MuiSelect
        labelId="data-type-select-label"
        label="Dado da tabela"
        value={selectedDataType}
        onChange={(e) => setSelectedDataType(e.target.value as DataType)}
        sx={{ borderRadius: "10px" }}
      >
        {dataTypes.map(({ value, label }) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default Select;
