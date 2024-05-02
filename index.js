const App = require("./src/app");
const database = require("./src/database");

const app = new App();

app.listen(3000, () => console.log("Listening on 3000"));
database.connect();
