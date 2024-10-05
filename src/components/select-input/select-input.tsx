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
};

const Select = ({ isWaitingAsync, isAdmin }: SelectProps) => {
    const [dataType, setDataType] = useState<DataType>("sales");

    if (!isAdmin) {
        return null;
    }

    return (
        <FormControl
            className="form-control-select"
            disabled={isWaitingAsync}
            sx={{ borderRadius: '25px' }}>
            <InputLabel id="data-type-select-label">Dado da tabela</InputLabel>
            <MuiSelect
                labelId="data-type-select-label"
                label="Dado da tabela"
                value={dataType}
                onChange={(e) => setDataType(e.target.value as DataType)}
                sx={{ borderRadius: '25px' }}
            >
                {Object.entries(dataTypeTranslator).map(([type, translatedType]) => (
                    <MenuItem key={type} value={type}>
                        {translatedType.plural}
                    </MenuItem>
                ))}
            </MuiSelect>
        </FormControl>
    );
};

export default Select;
