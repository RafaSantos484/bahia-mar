import { TextField } from "@mui/material";
import { FormEvent, useState } from "react";
import { AlertInfo } from "../../custom-alert";
import { getTrimmed } from "../../../utils";
import { useGlobalState } from "../../../global-state-context";
import Button from "../../button/button";
import { editData, insertData } from "../../../apis/firebase";
import { PaymentMethod } from "../../../types";

type Props = {
  isWaitingAsync: boolean;
  setIsWaitingAsync: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertInfo: React.Dispatch<React.SetStateAction<AlertInfo | undefined>>;
  close: () => void;
  editingData?: PaymentMethod;
};

export default function PaymentMethodForm({
  isWaitingAsync,
  setIsWaitingAsync,
  setAlertInfo,
  close,
  editingData,
}: Props) {
  const globalState = useGlobalState();
  const isEditing = !!editingData;

  const [data, setData] = useState({ name: editingData?.name || "" });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWaitingAsync || !globalState) return;

    try {
      setIsWaitingAsync(true);
      const trimmedData = getTrimmed(data);
      setData({ ...trimmedData });

      const sameNamePaymentMethod = globalState.paymentMethods.find(
        (p) => p.name === trimmedData.name
      );
      if (!isEditing && !!sameNamePaymentMethod) {
        setAlertInfo({
          severity: "error",
          message: `Já existe um método de pagamento com o nome '${trimmedData.name}'`,
        });
        return;
      }

      let err = "";
      if (isEditing) {
        err = await editData("paymentMethods", editingData.id, trimmedData);
      } else {
        err = await insertData("paymentMethods", trimmedData);
      }

      if (!err) {
        setAlertInfo({
          severity: "success",
          message: `Mét. de pagamento ${isEditing ? "editado" : "cadastrado"}`,
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
        } mét. de pagamento`,
      });
    } finally {
      setIsWaitingAsync(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <Button type="submit" disabled={isWaitingAsync}>
        {isEditing ? "Editar" : "Cadastrar"}
      </Button>
    </form>
  );
}
