import { Dispatch, SetStateAction, useState } from "react";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

import "./register-pop-up.scss";
import { sleep } from "../../utils";
import { createTheme, IconButton, ThemeProvider } from "@mui/material";

import { AlertInfo } from "../custom-alert";
import {
  dataTypeTranslator,
  PopupData,
} from "../../views/dashboard/registrations/registrations";
import PaymentMethodForm from "./forms/payment-method-form";
import VehicleForm from "./forms/vehicle-form";
import ClientForm from "./forms/client-form";
import CollaboratorForm from "./forms/collaborator-form";
import SaleForm from "./forms/sale-form";
import ProductForm from "./forms/product-form";

const themes = createTheme({
  palette: {
    primary: {
      main: "#214f6e",
    },
    secondary: {
      main: "#ffffff",
    },
  },
});

type Props = {
  close: () => void;
  setAlertInfo: Dispatch<SetStateAction<AlertInfo | undefined>>;
  popupData: PopupData;
  fadeTime?: number;
};

export function Divider({ text }: { text: string }) {
  return (
    <div className="divider-container">
      <span>{text}</span>
      <hr />
    </div>
  );
}

export default function RegisterPopUp({
  close,
  popupData,
  setAlertInfo,
  fadeTime,
}: Props) {
  const { dataType, editingData } = popupData;
  const _fadeTime = fadeTime || 200;
  const isEditing = !!editingData;

  const [isOpen, setIsOpen] = useState(true);
  const [isWaitingAsync, setIsWaitingAsync] = useState(false);

  async function _close() {
    setIsOpen(false);
    await sleep(_fadeTime);
    close();
  }

  return (
    <div
      className="global-absolute-fullscreen-container"
      style={{
        animation: `${isOpen ? "fade-in" : "fade-out"} ${_fadeTime + 50}ms`,
      }}
    >
      <ThemeProvider theme={themes}>
        <div className="register-pop-up-container">
          <div className="header-container">
            <span>{`${isEditing ? "Editar" : "Cadastrar"} ${
              dataTypeTranslator[dataType].singular
            }`}</span>
            <IconButton
              color="secondary"
              className="close-btn"
              disabled={isWaitingAsync}
              onClick={_close}
            >
              <HighlightOffOutlinedIcon />
            </IconButton>
          </div>

          {(() => {
            const formsDict = {
              vehicles: VehicleForm,
              clients: ClientForm,
              products: ProductForm,
              collaborators: CollaboratorForm,
              paymentMethods: PaymentMethodForm,
              sales: SaleForm,
            };

            const FormComponent = formsDict[dataType];
            return (
              <FormComponent
                isWaitingAsync={isWaitingAsync}
                setIsWaitingAsync={setIsWaitingAsync}
                setAlertInfo={setAlertInfo}
                close={_close}
                editingData={editingData as any}
              />
            );
          })()}
        </div>
      </ThemeProvider>
    </div>
  );
}
