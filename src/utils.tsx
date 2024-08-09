import Resizer from "react-image-file-resizer";

import { Client, ProductSales, Sales, Vehicle } from "./types";
import { Timestamp } from "firebase/firestore";
import dayjs from "dayjs";

/** A promise that resolves after 'ms' milliseconds */
export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns only the digit chars of a string */
export function getOnlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/** Reduces client address info into one string */
export function formatAddress(client: Client) {
  return `${client.street}${!!client.number ? ` ${client.number}` : ""}, ${
    client.neighborhood
  }, ${client.city}`;
}
/** Reduces vehicle info into one string */
export function formatVehicle(vehicle: Vehicle) {
  return `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`;
}
export function formatDate(
  date: string | number | Date | Timestamp,
  withHours = false
) {
  if (date instanceof Timestamp) date = date.toDate();

  const dayjsDate = dayjs(date);
  return dayjsDate.format(`DD/MM/YYYY${withHours ? "[, às ]HH:mm:ss" : ""}`);
}
export function formatIsoDate(
  date: string | number | Date | Timestamp,
  format = "YYYY-MM-DD"
) {
  if (date instanceof Timestamp) date = date.toDate();

  const dayjsDate = dayjs(date);
  return dayjsDate.format(format);
}

/** Resizes image file */
export function resizeImage(
  image: File,
  width: number,
  height: number
): Promise<File> {
  return new Promise((resolve) => {
    Resizer.imageFileResizer(
      image,
      width,
      height,
      "PNG",
      100,
      0,
      (uri) => resolve(uri as File),
      "file"
    );
  });
}

/** Converts blob into Base64 string */
export async function blobToString(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
}

export function getTrimmed<T>(obj: T): T {
  if (typeof obj === "string") {
    return obj.trim() as T;
  } else if (obj instanceof Array) {
    return obj.map(getTrimmed) as T;
  } else if (typeof obj === "object" && obj !== null) {
    const trimmedObj: any = {};
    for (const key in obj) {
      trimmedObj[key] = getTrimmed(obj[key]);
    }
    return trimmedObj;
  }

  return obj;
}

export function roundNumber(num: number, decimalPlaces = 2): number {
  const powerOf10 = Number(`1e${decimalPlaces}`);
  return Math.round((num + Number.EPSILON) * powerOf10) / powerOf10;
}

export function getSaleValue(products: ProductSales): number;
export function getSaleValue(
  products: ProductSales,
  convertToString: true
): string;
export function getSaleValue(
  products: ProductSales,
  convertToString: false
): number;
export function getSaleValue(products: ProductSales, convertToString = false) {
  let total = 0;
  Object.values(products).forEach((prod) => {
    total += prod.price * prod.quantity;
  });
  total = roundNumber(total);

  return convertToString ? total.toFixed(2).replace(".", ",") : total;
}

export function getClientDebt(sales: Sales, clientId: string): number;
export function getClientDebt(
  sales: Sales,
  clientId: string,
  convertToString: true
): string;
export function getClientDebt(
  sales: Sales,
  clientId: string,
  convertToString: false
): number;
export function getClientDebt(
  sales: Sales,
  clientId: string,
  convertToString = false
) {
  let total = 0;
  for (const sale of sales) {
    if (sale.client !== clientId) continue;

    total += getSaleValue(sale.products) - sale.paidValue;
  }
  total = roundNumber(total);

  return convertToString ? total.toFixed(2).replace(".", ",") : total;
}
