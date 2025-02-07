// import * as winston from 'winston';

// export const winstonConfig: winston.LoggerOptions = {
//   level: 'info', // Default log level
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.printf(({ timestamp, level, message, context }) => {
//       return `[${timestamp}] ${level.toUpperCase()}: ${message} ${context ? `(${context})` : ''}`;
//     }),
//   ),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: 'application.log' }), // Logs to file
//   ],
// };
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file'; // Ensure correct import
import * as moment from 'moment-timezone';

import { WinstonModuleOptions } from 'nest-winston';

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: (): string =>
            moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'), // Custom timestamp in Thai time
        }),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message }) =>
            `[${timestamp}] ${level}: ${message}`,
        ),
      ),
    }),
    new (DailyRotateFile as any)({
      dirname: './logs',
      filename: 'Robinson-Backend-log-%DATE%.log',
      datePattern: 'YYYY-MM-DD', // Change to create one log file per day
      zippedArchive: true, // Compress the old logs to save space
      maxSize: '10m', // Optional: limit log file size
      format: winston.format.combine(
        winston.format.timestamp({
          format: (): string =>
            moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'), // Custom timestamp in Thai time
        }),
        winston.format.json(),
      ),
    }),
  ],
};
