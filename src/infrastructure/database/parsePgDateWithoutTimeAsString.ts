// This prevents postgrest driver to convert it into a Date
// For date field types we want it to be returned as string YYYY-MM-DD
export const parsePgDateWithoutTimeAsString = (pgDate: string) => {
  if (!pgDate) {
    return null;
  }

  return pgDate;
};
