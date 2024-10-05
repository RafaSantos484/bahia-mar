import { useState } from "react";
import { FormControl, InputLabel, MenuItem, Select as MuiSelect } from "@mui/material";

import "./select-input.scss"

type DataType = "vehicles" | "clients" | "products" | "collaborators" | "paymentMethods" | "sales";

const dataTypeTranslator = {
    sales: { plural: "Vendas", singular: "Venda" },
    clients: { plural: "Clientes", singular: "Cliente" },
    collaborators: { plural: "Colaboradores", singular: "Colaborador" },
    products: { plural: "Produtos", singular: "Produto" },
    vehicles: { plural: "Veículos", singular: "Veículo" },
    paymentMethods: { plural: "Mét. de pagamento", singular: "Mét. de pagamento" },
};

type SelectProps = {
    isWaitingAsync: boolean;
    isAdmin: boolean;
    dataTypes: Array<{ value: DataType; label: string }>;
    selectedDataType: DataType;
    setSelectedDataType: (value: DataType) => void;
};

const Select = ({ isWaitingAsync, isAdmin, dataTypes, selectedDataType, setSelectedDataType }: SelectProps) => {
    if (!isAdmin) {
        return null;
    }

    return (
        <FormControl
            className="form-control-select"
            disabled={isWaitingAsync}
            sx={{ borderRadius: '10px' }}>
            <InputLabel id="data-type-select-label">Dado da tabela</InputLabel>
            <MuiSelect
                labelId="data-type-select-label"
                label="Dado da tabela"
                value={selectedDataType}
                onChange={(e) => setSelectedDataType(e.target.value as DataType)} // Usando a função recebida para atualizar
                sx={{ borderRadius: '10px' }}
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