import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      balance: number;
      // add other properties you need
    } & DefaultSession["user"];
  }
}