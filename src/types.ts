import { Timestamp } from "firebase/firestore";

// export type UserType = "admin" | "employee";
export enum UserType {
  Admin = "0",
  Employee = "1",
}
export const userTypeLabels = {
  "0": "Admin",
  "1": "Colaborador",
};
export type AppUser = {
  id: string;
  email: string;
  name: string;
  cpf: string;
  type: UserType;
  createdAt: Timestamp;
};
export type AppUsers = AppUser[];
export const appUserAttrsTranslator = {
  email: "E-mail",
  name: "Nome",
  cpf: "CPF",
  type: "Tipo",
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

export type Product = {
  id: string;
  name: string;
  price: number;
  photoSrc?: string;
  createdAt: Timestamp;
};
export type Products = Product[];
export const productAttrsTranslator = {
  name: "Nome",
  price: "Preço",
};
