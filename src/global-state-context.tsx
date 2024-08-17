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
  PaymentMethods,
  PaymentMethod,
} from "./types";
import { User } from "firebase/auth";
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
  paymentMethods: PaymentMethods;
  sales: Sales;
};

const GlobalStateContext = createContext<GlobalState | null | undefined>(
  undefined
);

export const useGlobalState = () => useContext(GlobalStateContext);

type GlobalStateProviderProps = {
  children: ReactNode;
};

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
  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethods | undefined
  >(undefined);
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
    if (!!user) {
      return onDocChange("collaborators", user.uid, (doc) => {
        const data = doc.data() as any;
        setLoggedUser({ ...data, id: user.uid });
      });
    }
  }, [user]);
  useEffect(() => {
    if (!!user) {
      return onCollectionChange("vehicles", (collection) => {
        const data = collection.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Vehicle)
        );
        setVehicles(data);
      });
    }
  }, [user]);
  useEffect(() => {
    if (!!user) {
      return onCollectionChange("clients", (collection) => {
        const data = collection.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Client)
        );
        setClients(data);
      });
    }
  }, [user]);
  useEffect(() => {
    if (!!user) {
      return onCollectionChange("products", (collection) => {
        const data = collection.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Product)
        );
        setProducts(data);
      });
    }
  }, [user]);
  useEffect(() => {
    if (!!user) {
      return onCollectionChange("paymentMethods", (collection) => {
        const data = collection.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as PaymentMethod)
        );
        setPaymentMethods(data);
      });
    }
  }, [user]);
  useEffect(() => {
    if (!!user && !!loggedUser) {
      if (loggedUser.type === CollaboratorType.Admin) {
        return onCollectionChange("collaborators", (collection) => {
          const data = collection.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Collaborator)
          );
          setCollaborators(data);
        });
      } else {
        setCollaborators([]);
      }
    }
  }, [user, loggedUser]);
  useEffect(() => {
    if (!!user) {
      return onCollectionChange("sales", (collection) => {
        const data = collection.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Sale)
        );
        setSales(data);
      });
    }
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
      !paymentMethods ||
      !sales
    ) {
      setGlobalState(undefined);
    } else {
      setGlobalState({
        loggedUser,
        vehicles,
        clients,
        products,
        collaborators,
        paymentMethods,
        sales,
      });
    }
  }, [
    user,
    loggedUser,
    vehicles,
    clients,
    products,
    collaborators,
    paymentMethods,
    sales,
  ]);

  return (
    <GlobalStateContext.Provider value={globalState}>
      {children}
    </GlobalStateContext.Provider>
  );
}
