require("dotenv").config();
require("./apps/database");

const app = require("./apps")();
const logger = require("./utils/logger");
const port = process.env.PORT;

app.listen(port, () => {
  logger.info(`API 서버가 ${port}포트에서 활성화되었습니다.`);
});
