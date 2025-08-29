import pino from "pino";

export const logger = pino(
    {
        level: process.env.LOG_LEVEL || 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
            level: (label) => ({ level: label}),
            log: (object) => object,
        },
        base: {
            service: 'hezaerd-web',
            version: process.env.npm_package_version,
            environment: process.env.NODE_ENV || 'development'
        },
    },
    pino.transport({
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    })
)