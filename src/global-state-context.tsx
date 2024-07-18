import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppUser, Client, Clients, Vehicle, Vehicles } from "./types";
import { Unsubscribe, User } from "firebase/auth";
import {
  onAuthStateChange,
  onCollectionChange,
  onDocChange,
} from "./apis/firebase";

type GlobalState = {
  loggedUser: AppUser;
  vehicles: Vehicles;
  clients: Clients;
};

const GlobalStateContext = createContext<GlobalState | null | undefined>(
  undefined
);

export const useGlobalState = () => useContext(GlobalStateContext);

type GlobalStateProviderProps = {
  children: ReactNode;
};

let appUserUnsubscriber: Unsubscribe | undefined = undefined;
let vehiclesUnsubscriber: Unsubscribe | undefined = undefined;
let clientsUnsubscriber: Unsubscribe | undefined = undefined;
export function GlobalStateProvider({ children }: GlobalStateProviderProps) {
  const [globalState, setGlobalState] = useState<
    GlobalState | null | undefined
  >(undefined);

  const [user, setUser] = useState<User | null | undefined>(undefined);

  const [loggedUser, setLoggedUser] = useState<AppUser | undefined>(undefined);
  const [vehicles, setVehicles] = useState<Vehicles | undefined>(undefined);
  const [clients, setClients] = useState<Clients | undefined>(undefined);

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
    if (!!vehiclesUnsubscriber) {
      vehiclesUnsubscriber();
      vehiclesUnsubscriber = undefined;
    }

    if (!!user) {
      vehiclesUnsubscriber = onCollectionChange("vehicles", (collection) => {
        const data = collection.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Vehicle)
        );
        setVehicles(data);
      });
    }

    return () => {
      if (!!vehiclesUnsubscriber) {
        vehiclesUnsubscriber();
        vehiclesUnsubscriber = undefined;
      }
    };
  }, [user]);
  useEffect(() => {
    if (!!clientsUnsubscriber) {
      clientsUnsubscriber();
      clientsUnsubscriber = undefined;
    }

    if (!!user) {
      clientsUnsubscriber = onCollectionChange("clients", (collection) => {
        const data = collection.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Client)
        );
        setClients(data);
      });
    }

    return () => {
      if (!!clientsUnsubscriber) {
        clientsUnsubscriber();
        clientsUnsubscriber = undefined;
      }
    };
  }, [user]);

  useEffect(() => {
    if (user === null) setGlobalState(null);
    else if (user === undefined || !loggedUser || !vehicles || !clients)
      setGlobalState(undefined);
    else setGlobalState({ loggedUser, vehicles, clients });
  }, [user, loggedUser, vehicles, clients]);

  return (
    <GlobalStateContext.Provider value={globalState}>
      {children}
    </GlobalStateContext.Provider>
  );
}
