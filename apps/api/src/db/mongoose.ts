import mongoose from "mongoose";
import { env } from "../config/env";

mongoose.set("strictQuery", true);

mongoose.connect(env.MONGO_URI).then(() => {
  console.log("Mongo connected");
}).catch((e) => {
  console.error("Mongo connection error", e);
});
