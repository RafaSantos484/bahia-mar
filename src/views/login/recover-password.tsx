import { FormEvent, useEffect, useState } from "react";
import ButtonMUI from "@mui/material/Button";
import { ThemeProvider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { sendRecoverPasswordEmail } from "../../apis/firebase";
import LoadingScreen from "../../components/loading-screen";
import { useGlobalState } from "../../global-state-context";

import "./login.scss";
import themes from "../../themes/themes";

import Button from "../../components/button/button";
import Input from "../../components/input/input";
import Header from "../../components/header";
import ConfirmPopUp, {
  ConfirmPopUpInfo,
} from "../../components/confirm-pop-up";

export default function RecoverPassword() {
  const navigate = useNavigate();
  const globalState = useGlobalState();

  const [isWaitingAsync, setIsWaitingAsync] = useState(false);
  /// const [alertInfo, setAlertInfo] = useState<AlertInfo | undefined>();
  const [confirmPopUpInfo, setConfirmPopUpInfo] =
    useState<ConfirmPopUpInfo | null>(null);

  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!!globalState) {
      navigate("/dashboard");
    }
  }, [globalState, navigate]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWaitingAsync) return;

    setIsWaitingAsync(true);
    try {
      await sendRecoverPasswordEmail(email);
      setConfirmPopUpInfo({
        type: "success",
        text: "Foi enviado um e-mail para sua caixa de entrada",
        close: () => {
          setConfirmPopUpInfo(null);
          navigate("/");
        },
      });
    } catch (e: any) {
      const { code } = e;
      console.log(code);
      switch (e.code) {
        case "auth/invalid-email":
          setConfirmPopUpInfo({
            type: "error",
            text: "E-mail inválido",
            close: () => setConfirmPopUpInfo(null),
          });
          break;
        default:
          /*setAlertInfo({
            severity: "error",
            message: `Falha ao tentar realizar login`,
          });*/
          setConfirmPopUpInfo({
            type: "error",
            text: "Falha ao tentar enviar e-mail de recuperação de senha",
            close: () => setConfirmPopUpInfo(null),
          });
          break;
      }
    } finally {
      setIsWaitingAsync(false);
    }
  }

  if (globalState === undefined) {
    return (
      <div className="global-fullscreen-container">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="global-fullscreen-container login-container">
      {/*<CustomAlert alertInfo={alertInfo} setAlertInfo={setAlertInfo} /> */}
      {confirmPopUpInfo && <ConfirmPopUp {...confirmPopUpInfo} />}

      <ThemeProvider theme={themes}>
        <Header />
        <form onSubmit={handleSubmit} className="form">
          <Input
            label="E-mail"
            required
            type="email"
            value={email}
            fullWidth
            onChange={(e) => setEmail(e.target.value.trim())}
          />

          <h3 style={{ margin: "0 0 20px 0" }}>
            Um código será enviado para seu e-mail. Por favor, cheque sua caixa
            de entrada
          </h3>

          <Button type="submit" disabled={isWaitingAsync} size="large">
            Enviar
          </Button>

          <ButtonMUI
            style={{ color: "black", textDecoration: "underline" }}
            onClick={() => navigate("/")}
            variant="text"
          >
            Voltar para o login
          </ButtonMUI>
        </form>
      </ThemeProvider>
    </div>
  );
}
