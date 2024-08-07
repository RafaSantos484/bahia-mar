import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Collaborator,
  Client,
  Clients,
  Product,
  Products,
  Collaborators,
  Vehicle,
  Vehicles,
  Sales,
  Sale,
  CollaboratorType,
} from "./types";
import { Unsubscribe, User } from "firebase/auth";
import {
  onAuthStateChange,
  onCollectionChange,
  onDocChange,
} from "./apis/firebase";

export type GlobalState = {
  loggedUser: Collaborator;
  vehicles: Vehicles;
  clients: Clients;
  products: Products;
  collaborators: Collaborators;
  sales: Sales;
};

const GlobalStateContext = createContext<GlobalState | null | undefined>(
  undefined
);

export const useGlobalState = () => useContext(GlobalStateContext);

type GlobalStateProviderProps = {
  children: ReactNode;
};

let loggedUserUnsubscriber: Unsubscribe | undefined = undefined;
let vehiclesUnsubscriber: Unsubscribe | undefined = undefined;
let clientsUnsubscriber: Unsubscribe | undefined = undefined;
let productsUnsubscriber: Unsubscribe | undefined = undefined;
let collaboratorsUnsubscriber: Unsubscribe | undefined = undefined;
let salesUnsubscriber: Unsubscribe | undefined = undefined;
export function GlobalStateProvider({ children }: GlobalStateProviderProps) {
  const [globalState, setGlobalState] = useState<
    GlobalState | null | undefined
  >(undefined);

  const [user, setUser] = useState<User | null | undefined>(undefined);

  const [loggedUser, setLoggedUser] = useState<Collaborator | undefined>(
    undefined
  );
  const [vehicles, setVehicles] = useState<Vehicles | undefined>(undefined);
  const [clients, setClients] = useState<Clients | undefined>(undefined);
  const [products, setProducts] = useState<Products | undefined>(undefined);
  const [collaborators, setCollaborators] = useState<Collaborators | undefined>(
    undefined
  );
  const [sales, setSales] = useState<Sales | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChange((_user) => {
      setUser(_user);
    });
  }, []);

  useEffect(() => {
    if (!!loggedUserUnsubscriber) {
      loggedUserUnsubscriber();
      loggedUserUnsubscriber = undefined;
    }

    if (!!user) {
      loggedUserUnsubscriber = onDocChange("collaborators", user.uid, (doc) => {
        const data = doc.data() as any;
        setLoggedUser({ ...data, id: user.uid });
      });
    }

    return () => {
      if (!!loggedUserUnsubscriber) {
        loggedUserUnsubscriber();
        loggedUserUnsubscriber = undefined;
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
    if (!!productsUnsubscriber) {
      productsUnsubscriber();
      productsUnsubscriber = undefined;
    }

    if (!!user) {
      productsUnsubscriber = onCollectionChange("products", (collection) => {
        const data = collection.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Product)
        );
        setProducts(data);
      });
    }

    return () => {
      if (!!productsUnsubscriber) {
        productsUnsubscriber();
        productsUnsubscriber = undefined;
      }
    };
  }, [user]);
  useEffect(() => {
    if (!!collaboratorsUnsubscriber) {
      collaboratorsUnsubscriber();
      collaboratorsUnsubscriber = undefined;
    }

    if (!!user && !!loggedUser) {
      if (loggedUser.type === CollaboratorType.Admin) {
        collaboratorsUnsubscriber = onCollectionChange(
          "collaborators",
          (collection) => {
            const data = collection.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as Collaborator)
            );
            setCollaborators(data);
          }
        );
      } else {
        setCollaborators([]);
      }
    }

    return () => {
      if (!!collaboratorsUnsubscriber) {
        collaboratorsUnsubscriber();
        collaboratorsUnsubscriber = undefined;
      }
    };
  }, [user, loggedUser]);
  useEffect(() => {
    if (!!salesUnsubscriber) {
      salesUnsubscriber();
      salesUnsubscriber = undefined;
    }

    if (!!user) {
      salesUnsubscriber = onCollectionChange("sales", (collection) => {
        const data = collection.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Sale)
        );
        setSales(data);
      });
    }

    return () => {
      if (!!salesUnsubscriber) {
        salesUnsubscriber();
        salesUnsubscriber = undefined;
      }
    };
  }, [user]);

  useEffect(() => {
    if (user === null) setGlobalState(null);
    else if (
      user === undefined ||
      !loggedUser ||
      !vehicles ||
      !clients ||
      !products ||
      !collaborators ||
      !sales
    )
      setGlobalState(undefined);
    else
      setGlobalState({
        loggedUser,
        vehicles,
        clients,
        products,
        collaborators,
        sales,
      });
  }, [user, loggedUser, vehicles, clients, products, collaborators, sales]);

  return (
    <GlobalStateContext.Provider value={globalState}>
      {children}
    </GlobalStateContext.Provider>
  );
}
