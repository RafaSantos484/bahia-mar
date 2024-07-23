import { Timestamp } from "firebase/firestore";

// export type UserType = "admin" | "employee";
export enum CollaboratorType {
  Admin = "0",
  Employee = "1",
}
export const collaboratorTypeLabels = {
  "0": "Admin",
  "1": "Motorista",
};
export type Collaborator = {
  id: string;
  email: string;
  name: string;
  cpf: string;
  type: CollaboratorType;
  createdAt: Timestamp;
};
export type Collaborators = Collaborator[];
export const appUserAttrsTranslator = {
  email: "E-mail",
  name: "Nome",
  cpf: "CPF",
  type: "Tipo",
};

export enum VehicleType {
  Car = "0",
  Motorcycle = "1",
}
export const vehicleTypeLabels = {
  "0": "Carro",
  "1": "Moto",
};
export type Vehicle = {
  id: string;
  type: VehicleType;
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

export enum ClientType {
  Individual = "0",
  Entity = "1",
}
export const clientTypeLabels = {
  "0": "Física",
  "1": "Jurídica",
};
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
