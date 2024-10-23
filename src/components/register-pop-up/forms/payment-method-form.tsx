import { TextField } from "@mui/material";
import { FormEvent } from "react";
import { AlertInfo } from "../../custom-alert";
import { getTrimmed } from "../../../utils";
import { useGlobalState } from "../../../global-state-context";
import Button from "../../button/button";
import { editData, insertData } from "../../../apis/firebase";
import { PaymentMethod } from "../../../types";

export type PaymentMethodFormData = {
  dataType: "paymentMethods";
  data: {
    name: string;
  };
  editingData?: PaymentMethod;
};

type Props = {
  formData: PaymentMethodFormData;
  setFormData: React.Dispatch<React.SetStateAction<PaymentMethodFormData>>;
  isWaitingAsync: boolean;
  setIsWaitingAsync: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertInfo: React.Dispatch<React.SetStateAction<AlertInfo | undefined>>;
  close: () => void;
};

export default function PaymentMethodForm({
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

      const sameNamePaymentMethod = globalState.paymentMethods.find(
        (p) => p.name === formData.data.name
      );
      if (!isEditing && !!sameNamePaymentMethod) {
        setAlertInfo({
          severity: "error",
          message: `Já existe um método de pagamento com o nome '${formData.data.name}'`,
        });
        return;
      }

      let err = "";
      if (isEditing) {
        err = await editData(dataType, editingData.id, data);
      } else {
        err = await insertData(dataType, data);
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
        value={formData.data.name}
        onChange={(e) => {
          formData.data.name = e.target.value;
          setFormData({ ...formData });
        }}
      />

      <Button type="submit" disabled={isWaitingAsync}>
        {isEditing ? "Editar" : "Cadastrar"}
      </Button>
    </form>
  );
}
