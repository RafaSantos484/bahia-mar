import { useEffect } from "react";
import { logout } from "../../apis/firebase";
import LoadingScreen from "../../components/loading-screen";
import { useGlobalState } from "../../global-state-context";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const globalState = useGlobalState();

  useEffect(() => {
    if (globalState === null) navigate("/");
  }, [globalState, navigate]);

  if (!globalState) {
    return (
      <div className="global-fullscreen-container">
        <LoadingScreen />
      </div>
    );
  }

  console.log(globalState);

  return (
    <div className="global-fullscreen-container">
      <span>dashboard...</span>
      <span onClick={logout}>Sair</span>
    </div>
  );
}
