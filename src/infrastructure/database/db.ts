// do not use path aliases in this file because of this bug: https://github.com/kysely-org/kysely-ctl/issues/109

import {
  CamelCasePlugin,
  Kysely,
  PostgresDialect,
  RawBuilder,
  sql,
} from "kysely";

import type { Database } from "./models/database";
import { serverConfig } from "../config/server.config";
import { pg } from "./pgConfig";

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: serverConfig.database.url,
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
  plugins: [new CamelCasePlugin({ underscoreBeforeDigits: true })],
});

// without default value + not nullable
export const toJson = <T>(value: NonNullable<T>): RawBuilder<T> => {
  return sql`CAST(${JSON.stringify(value)} AS JSONB)`;
};

// without default value + nullable
export const toJsonOrNull = <T>(value: NonNullable<T> | null | undefined) => {
  return value != null ? toJson<NonNullable<T>>(value) : null;
};

// with default value (generated) + not nullable
export const toJsonOrDefault = <T>(value: NonNullable<T> | undefined) => {
  return value !== undefined ? toJson<NonNullable<T>>(value) : undefined;
};

// with default value (generated) + nullable
export const toJsonOrNullOrDefault = <T>(
  value: NonNullable<T> | null | undefined
) => {
  if (value === null) {
    return null;
  }
  if (value === undefined) {
    return undefined;
  }
  return toJson<NonNullable<T>>(value);
};
