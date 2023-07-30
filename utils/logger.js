const winston = require("winston");

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize(),
    winston.format.errors({ stack: true }),
    winston.format.printf(
      (info) =>
        `${info.timestamp} ｜ ${info.level}: ${info.stack || info.message}`
    )
  ),
  transports: new winston.transports.Console({
    handleExceptions: true,
  }),
});

module.exports = logger;
