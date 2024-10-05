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
import RegisterPopUp from "../../../components/register-pop-up/register-pop-up";
import CustomAlert, { AlertInfo } from "../../../components/custom-alert";
import LogoHeader from "../../../components/logo-header";
import DashboardTable from "../../../components/dashboard-table/dashboard-table";
import Button from "../../../components/button/button";
import Select from "../../../components/select-input/select-input";

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
  const [creatingDataType, setCreatingDataType] = useState<CreatingDataType | undefined>(undefined);

  // Dados para o Select
  const dataTypes = Object.entries(dataTypeTranslator).map(([type, translatedType]) => ({
    value: type as DataType,
    label: translatedType.plural,
  }));

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
        <Select
          isWaitingAsync={false}
          isAdmin={true}
          dataTypes={dataTypes}
          selectedDataType={dataType}
          setSelectedDataType={setDataType}
        />

        <Button
          style={{ marginLeft: "auto" }}
          disabled={isWaitingAsync}
          onClick={() => setCreatingDataType({ dataType })}
        >{`Cadastrar ${dataTypeTranslator[dataType].singular}`}</Button>
      </div>
      <div className="DashboardTable-box">
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
    </div>
  );
}