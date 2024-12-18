import { Timestamp } from "firebase/firestore";

export enum CollaboratorType {
  Admin = "0",
  Employee = "1",
}
export const collaboratorTypeLabels = {
  "0": "Admin",
  "1": "Entregador",
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
  type: ClientType;
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
  photoSrc: string;
  createdAt: Timestamp;
};
export type Products = Product[];
export const productAttrsTranslator = {
  name: "Nome",
  price: "Preço",
};

export type PaymentMethod = { id: string; name: string; createdAt: Timestamp };
export type PaymentMethods = PaymentMethod[];
export const PaymentMethodAttrsTranslator = {
  name: "Nome",
};

export type TempClient = {
  name: string;
  phone: string;
  cep: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
};
export type ProductSale = { price: number; quantity: number };
export type ProductSales = { [productId: string]: ProductSale };
export type Sale = {
  id: string;
  collaboratorId: string;
  vehicleId: string;
  paymentMethodId: string;
  client: string | TempClient;
  products: ProductSales;
  paidValue: number;
  createdAt: Timestamp;
};
export type Sales = Sale[];
export const saleAttrsTranslator = {
  collaborator: "Colaborador",
  vehicle: "Veículo",
  client: "Cliente",
  paymentMethod: "Met. de pagamento",
  createdAt: "Criado em",
  products: "Total (R$)",
  paidValue: "pago (R$)",
  missingValue: "Dívida (R$)",
};
