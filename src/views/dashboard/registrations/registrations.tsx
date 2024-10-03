import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useState } from "react";

import "./registrations.scss";
import { GlobalState } from "../../../global-state-context";
import {
  Client,
  Collaborator,
  CollaboratorType,
  PaymentMethod,
  Product,
  Sale,
  Vehicle,
} from "../../../types";
import RegisterPopUp from "./register-pop-up";
import CustomAlert, { AlertInfo } from "../../../components/custom-alert";
import LogoHeader from "../../../components/logo-header";
import DashboardTable from "../../../components/dashboard-table";

export type DataType =
  | "vehicles"
  | "clients"
  | "products"
  | "collaborators"
  | "paymentMethods"
  | "sales";
export const dataTypeTranslator = {
  sales: { plural: "Vendas", singular: "Venda" },
  clients: { plural: "Clientes", singular: "Cliente" },
  collaborators: { plural: "Colaboradores", singular: "Colaborador" },
  products: { plural: "Produtos", singular: "Produto" },
  vehicles: { plural: "Veículos", singular: "Veículo" },
  paymentMethods: {
    plural: "Mét. de pagamento",
    singular: "Mét. de pagamento",
  },
};

type Props = {
  globalState: GlobalState;
};

export type CreatingDataType = {
  dataType: DataType;
  editingData?:
    | Vehicle
    | Client
    | Product
    | Collaborator
    | PaymentMethod
    | Sale;
};

export function Registrations({ globalState }: Props) {
  const isAdmin = globalState.loggedUser.type === CollaboratorType.Admin;
  const [isWaitingAsync, setIsWaitingAsync] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo | undefined>();

  const [dataType, setDataType] = useState<DataType>("sales");
  const [creatingDataType, setCreatingDataType] = useState<
    CreatingDataType | undefined
  >(undefined);

  return (
    <div className="global-table-container table-container">
      <LogoHeader />
      <CustomAlert alertInfo={alertInfo} setAlertInfo={setAlertInfo} />

      {!!creatingDataType && (
        <RegisterPopUp
          close={() => setCreatingDataType(undefined)}
          globalState={globalState}
          dataType={creatingDataType.dataType}
          setAlertInfo={setAlertInfo}
          editingData={creatingDataType.editingData}
        />
      )}

      <div className="upper-table-menu-container">
        {isAdmin && (
          <FormControl
            className="data-type-select-container"
            disabled={isWaitingAsync}
          >
            <InputLabel id="data-type-select-label">Dado da tabela</InputLabel>
            <Select
              labelId="data-type-select-label"
              label="Dado da tabela"
              value={dataType}
              onChange={(e) => setDataType(e.target.value as DataType)}
            >
              {Object.entries(dataTypeTranslator).map(
                ([type, translatedType]) => (
                  <MenuItem key={type} value={type}>
                    {translatedType.plural}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        )}

        <Button
          variant="contained"
          color="primary"
          style={{ marginLeft: "auto" }}
          disabled={isWaitingAsync}
          onClick={() => setCreatingDataType({ dataType })}
        >{`Cadastrar ${dataTypeTranslator[dataType].singular}`}</Button>
      </div>

      <DashboardTable
        dataType={dataType}
        isAdmin={isAdmin}
        globalState={globalState}
        creatingDataTypeGetSet={(newValue?: CreatingDataType) => {
          if (!!newValue) {
            setCreatingDataType(newValue);
            return newValue;
          }

          return creatingDataType;
        }}
        setAlertInfo={setAlertInfo}
        isWaitingAsyncGetSet={(newValue?: boolean) => {
          if (newValue !== undefined) {
            setIsWaitingAsync(newValue);
            return newValue;
          }

          return isWaitingAsync;
        }}
      />
    </div>
  );
}
