if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config();
}

import "./db/mongoose";
import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
