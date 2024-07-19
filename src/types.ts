import { Timestamp } from "firebase/firestore";

export type UserType = "admin" | "employee";
export type AppUser = {
  id: string;
  email: string;
  name: string;
  type: UserType;
  createdAt: Timestamp;
};

export type Vehicle = {
  id: string;
  type: string;
  brand: string;
  model: string;
  plate: string;
  createdAt: Timestamp;
};
export type Vehicles = Vehicle[];
export const vehicleAttrsTranslator = {
  type: "Tipo",
  brand: "Marca",
  model: "Modelo",
  plate: "Placa",
};

export type ClientType = "Física" | "Jurídica";
export type Client = {
  id: string;
  type: ClientTypes;
  name: string;
  phone: string;
  cpfCnpj: string;
  cep: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
  createdAt: Timestamp;
};
export type Clients = Client[];
export const clientAttrsTranslator = {
  type: "Tipo",
  name: "Nome",
  phone: "Telefone",
  cpfCnpj: "CPF/CNPJ",
  cep: "CEP",
  city: "Cidade",
  neighborhood: "Bairro",
  street: "Rua",
  number: "Número",
  complement: "Complemento",

  address: "Endereço",
};
