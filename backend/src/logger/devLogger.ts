import winston, { format, transports } from 'winston';
const { combine, timestamp, colorize, errors, splat, printf } = format;

const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaKeys = Object.keys(meta);
    const metaText = metaKeys.length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}] ${stack ?? message}${metaText}`;
});
const devLogger = winston.createLogger({
    level: 'debug',
    format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        // printf(({ timestamp, level, message }) => {
        //     return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        // })
        errors({ stack: true }),
        splat(),
        consoleFormat
    ),
    transports: [new transports.Console()]
})

export default devLogger;