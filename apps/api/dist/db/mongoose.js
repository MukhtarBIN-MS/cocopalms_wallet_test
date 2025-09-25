"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
mongoose_1.default.set("strictQuery", true);
mongoose_1.default.connect(env_1.env.MONGO_URI).then(() => {
    console.log("Mongo connected");
}).catch((e) => {
    console.error("Mongo connection error", e);
});
