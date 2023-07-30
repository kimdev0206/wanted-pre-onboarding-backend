const morgan = require("morgan");
const logger = require("../utils/logger");

const format = `
  :method :url ｜ :status ｜ :response-time ms
`;

const options = {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
};

const colors = {
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  cyan: "\x1B[36m",
  endColor: "\x1B[0m",
};

morgan.token("status", (_, res) => {
  let color;

  switch (true) {
    case res.statusCode < 300:
      color = colors.green;
      break;
    case res.statusCode < 400:
      color = colors.cyan;
      break;
    case res.statusCode < 500:
      color = colors.yellow;
      break;
    case res.statusCode < 600:
      color = colors.red;
      break;
    default:
      color = colors.endColor;
      break;
  }

  return color + res.statusCode + colors.endColor;
});

module.exports = morgan(format, options);
