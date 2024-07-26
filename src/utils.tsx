import Resizer from "react-image-file-resizer";

import { Client, ProductSales, Vehicle } from "./types";
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

export function getSaleValue(products: ProductSales, convertToString = false) {
  let total = 0;
  Object.values(products).forEach((prod) => {
    total += prod.price * prod.quantity;
  });

  return convertToString ? total.toFixed(2).replace(".", ",") : total;
}

export function roundNumber(num: number, decimalHouses: number = 2): number {
  const powerOf10 = Number(`1e${decimalHouses}`);
  return Math.round((num + Number.EPSILON) * powerOf10) / powerOf10;
}
