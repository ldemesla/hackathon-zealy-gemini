import pg from "pg";
import pgArray from "postgres-array";

import { parsePgDateAsIsoString } from "./parsePgDateAsIsoString";
import { parsePgDateWithoutTimeAsString } from "./parsePgDateWithoutTimeAsString";

const parseDateArray = (value: string) => {
  if (!value) {
    return null;
  }
  return pgArray.parse(value, parsePgDateAsIsoString);
};

pg.types.setTypeParser(1082, parsePgDateWithoutTimeAsString);
pg.types.setTypeParser(1114, parsePgDateAsIsoString);
pg.types.setTypeParser(1184, parsePgDateAsIsoString);
pg.types.setTypeParser(1115, parseDateArray);
pg.types.setTypeParser(1182, parseDateArray);
pg.types.setTypeParser(1185, parseDateArray);
pg.types.setTypeParser(20, "text", parseInt);

export { pg };
