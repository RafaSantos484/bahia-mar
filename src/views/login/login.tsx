import { FormEvent, useEffect, useState } from "react";

import "./login.scss";
import Logo from "../../assets/logo.png";
import { Button, createTheme, TextField, ThemeProvider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login } from "../../apis/firebase";
import LoadingScreen from "../../components/loading-screen";
import CustomAlert, { AlertInfo } from "../../components/custom-alert";
import { useGlobalState } from "../../global-state-context";

const themes = createTheme({
  palette: {
    primary: {
      main: "#214f6e",
    },
  },
});

export default function Login() {
  const navigate = useNavigate();
  const globalState = useGlobalState();

  const [isWaitingAsync, setIsWaitingAsync] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo | undefined>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      <CustomAlert alertInfo={alertInfo} setAlertInfo={setAlertInfo} />

      <ThemeProvider theme={themes}>
        <img
          src={Logo}
          className="logo"
          draggable={false}
          alt="Bahia Mar Distribuidora de Água"
        />

        <form onSubmit={handleSubmit} className="form">
          <TextField
            className="textfield"
            label="E-mail"
            type="email"
            variant="outlined"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
          />
          <TextField
            className="textfield"
            label="Senha"
            type="password"
            variant="outlined"
            fullWidth
            required
            inputProps={{ minLength: 6, maxLength: 15 }}
            value={password}
            onChange={(e) => setPassword(e.target.value.trim())}
          />

          <Button
            type="submit"
            variant="contained"
            className="login-btn"
            disabled={isWaitingAsync}
          >
            Entrar
          </Button>
        </form>
      </ThemeProvider>
    </div>
  );
}
