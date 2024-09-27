import { FormEvent, useEffect, useState } from "react";
import ButtonMUI from "@mui/material/Button";
import { ThemeProvider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login } from "../../apis/firebase";
import LoadingScreen from "../../components/loading-screen";
import CustomAlert, { AlertInfo } from "../../components/custom-alert";
import { useGlobalState } from "../../global-state-context";

import "./login.scss";

import themes from "../../themes/themes";

import Button from "../../components/button/button";
import Input from "../../components/input/input";
import Header from "../../components/header";

export default function Login() {
  const navigate = useNavigate();
  const globalState = useGlobalState();

  const [isWaitingAsync, setIsWaitingAsync] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo | undefined>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFadeOut, setIsFadeOut] = useState(false);

  useEffect(() => {
    if (!!globalState) {
      navigate("/dashboard");
    }
  }, [globalState, navigate]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWaitingAsync) return;

    setIsFadeOut(true);

    setIsWaitingAsync(true);
    try {
      await login(email, password);
    } catch (e: any) {
      const { code } = e;
      console.log(code);
      switch (e.code) {
        case "auth/invalid-credential":
        case "auth/internal-error":
          setAlertInfo({
            severity: "error",
            message: "Usuário não encontrado",
          });
          break;
        default:
          setAlertInfo({
            severity: "error",
            message: `Falha ao tentar realizar login`,
          });
          setIsFadeOut(false);
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
    <div className={`global-fullscreen-container login-container ${isFadeOut ? "fade-out" : ""}`}>
      <CustomAlert alertInfo={alertInfo} setAlertInfo={setAlertInfo} />

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
          <Input
            label="Senha"
            type="password"
            fullWidth
            required
            inputProps={{ minLength: 6, maxLength: 15 }}
            value={password}
            onChange={(e) => setPassword(e.target.value.trim())}
          />

          <Button type="submit" disabled={isWaitingAsync} size="large">
            Entrar
          </Button>
          <ButtonMUI
            style={{ color: "black", textDecoration: "underline" }}
            onClick={() => navigate("/recuperar-senha")}
            variant="text"
          >
            Esqueceu sua senha? Clique aqui para recuperar.
          </ButtonMUI>
        </form>
      </ThemeProvider>
    </div>
  );
}
