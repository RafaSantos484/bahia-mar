import { Timestamp } from "firebase/firestore";

export type UserType = "admin" | "employee";
export type AppUser = {
  id: string;
  email: string;
  name: string;
  type: UserType;
  createdAt: Timestamp;
};
