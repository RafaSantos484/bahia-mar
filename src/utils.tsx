import { Client } from "./types";

/** A promise that resolves after 'ms' milliseconds */
export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns only the digit chars of a string */
export function getOnlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/** Reduce client address info into one string */
export function formatAddress(client: Client) {
  return `${client.street}${!!client.number ? ` ${client.number}` : ""}, ${
    client.neighborhood
  }, ${client.city}`;
}
