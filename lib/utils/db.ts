import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";
import type { UserSnapshot } from "./types";

interface TCAPDB extends DBSchema {
  user: {
    key: string;
    value: UserSnapshot;
  };
}

const DB_NAME = "tcap-db";
const STORE_NAME = "user";
const USER_KEY = "current-user";

export const initDB = async (): Promise<IDBPDatabase<TCAPDB>> => {
  return openDB<TCAPDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const getUserSnapshot = async (): Promise<UserSnapshot | null> => {
  const db = await initDB();
  const val = await db.get(STORE_NAME, USER_KEY);
  return val ?? null;
};

export const saveUserSnapshot = async (
  snapshot: UserSnapshot
): Promise<void> => {
  const db = await initDB();
  await db.put(STORE_NAME, snapshot, USER_KEY);
};

export const DEFAULT_SNAPSHOT: UserSnapshot = {
  grossMonthlyIncome: 50000,
  additionalIncomes: [],
  debts: [],
};
