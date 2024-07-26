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
  photoSrc: string;
  createdAt: Timestamp;
};
export type Products = Product[];
export const productAttrsTranslator = {
  name: "Nome",
  price: "Preço",
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
export enum PaymentMethod {
  Money = "0",
  Pix = "1",
  CreditCard = "2",
  DebitCard = "3",
}
export const paymentMethodLabels = {
  "0": "Dinheiro",
  "1": "Pix",
  "2": "Cartão de crédito",
  "3": "Cartão de débito",
};
export type ProductSale = { price: number; quantity: number };
export type ProductSales = { [productId: string]: ProductSale };
export type Sale = {
  id: string;
  collaborator: string;
  vehicle: string;
  paymentMethod: PaymentMethod;
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
  createdAt: "Data/Hora",
  products: "Total (R$)",
  paidValue: "Valor pago (R$)",
  missingValue: "Dívida (R$)",
};
