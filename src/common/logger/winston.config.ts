import { format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, json, colorize, printf, splat, errors } = format;

// Formato legible en consola
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp(),
  splat(),
  errors({ stack: true }),
  printf(({ level, message, timestamp, context, stack }: any) => {
    const ctx = context ? ` [${String(context)}]` : '';
    const msg = stack
      ? `${String(message)}\n${String(stack)}`
      : String(message);
    return `${String(timestamp)} ${String(level)}${ctx}: ${msg}`;
  }),
);

// Formato JSON para archivos
const fileFormat = combine(
  timestamp(),
  splat(),
  errors({ stack: true }),
  json(),
);

export function buildTransports() {
  const isDev = process.env.NODE_ENV !== 'production';
  return [
    new transports.Console({
      level: isDev ? 'debug' : 'info',
      format: consoleFormat,
    }),
    new DailyRotateFile({
      level: 'info',
      dirname: 'logs',
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: '30d',
      format: fileFormat,
    }),
    new DailyRotateFile({
      level: 'error',
      dirname: 'logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: '60d',
      format: fileFormat,
    }),
  ];
}

export const winstonOptions = {
  transports: buildTransports(),
  handleExceptions: true,
};
