import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppUser } from "./types";
import { Unsubscribe, User } from "firebase/auth";
import { onAuthStateChange, onDocChange } from "./apis/firebase";

type GlobalState = {
  loggedUser: AppUser;
};

const GlobalStateContext = createContext<GlobalState | null | undefined>(
  undefined
);

export const useGlobalState = () => useContext(GlobalStateContext);

type GlobalStateProviderProps = {
  children: ReactNode;
};

let appUserUnsubscriber: Unsubscribe | undefined = undefined;
export function GlobalStateProvider({ children }: GlobalStateProviderProps) {
  const [globalState, setGlobalState] = useState<
    GlobalState | null | undefined
  >(undefined);

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loggedUser, setLoggedUser] = useState<AppUser | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChange((_user) => {
      setUser(_user);
    });
  }, []);

  useEffect(() => {
    if (!!appUserUnsubscriber) {
      appUserUnsubscriber();
      appUserUnsubscriber = undefined;
    }

    if (!!user) {
      appUserUnsubscriber = onDocChange("users", user.uid, (doc) => {
        const data = doc.data() as any;
        setLoggedUser({ ...data, id: user.uid, email: user.email });
      });
    }

    return () => {
      if (!!appUserUnsubscriber) {
        appUserUnsubscriber();
        appUserUnsubscriber = undefined;
      }
    };
  }, [user]);

  useEffect(() => {
    if (user === null) setGlobalState(null);
    else if (user === undefined || !loggedUser) setGlobalState(undefined);
    else setGlobalState({ loggedUser });
  }, [user, loggedUser]);

  return (
    <GlobalStateContext.Provider value={globalState}>
      {children}
    </GlobalStateContext.Provider>
  );
}
