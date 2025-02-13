import { dayjs } from '../time/dayjs';

export const parsePgDateAsIsoString = (pgTimestamp: string) => {
  if (!pgTimestamp) {
    return null;
  }

  // Regex to extract date, time, fractional seconds, and timezone offset from the timestamp
  const timestampRegex = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(?:\.(\d+))?\d*(\+\d{2})$/;
  const match = pgTimestamp.match(timestampRegex);

  if (!match) {
    throw new Error('Invalid timestamp format');
  }
  const [, date, time, milliseconds, timezoneOffset] = match;

  const ms = milliseconds ? milliseconds.padEnd(3, '0') : '000'; // default milliseconds to '000' if not present

  const isoString = `${date} ${time}${timezoneOffset === '+00' ? 'Z' : timezoneOffset}`;

  const utcString = dayjs(isoString).utc().toISOString();

  const withoutMillisecondsOrZ = utcString.split('.')[0]?.split('Z')[0];
  const withMilliseconds = `${withoutMillisecondsOrZ}.${ms}Z`;
  return withMilliseconds;
};
