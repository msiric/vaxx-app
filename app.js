import compression from "compression";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import createError from "http-errors";
import morgan from "morgan";
import path from "path";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { global } from "./common/constants";
import { postgres } from "./config/secret.js";
import api from "./routes/api/index.js";
import { validateParams } from "./utils/helpers.js";

dotenv.config();

const app = express();
const dirname = path.resolve();

app.use(
  cors({
    origin: global.clientDomain,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

(async () => {
  try {
    await createConnection({
      type: "postgres",
      url: postgres.database,
      logging: true,
      synchronize: true,
      migrations: [path.join(__dirname, "./migrations/*")],
      entities: [path.join(__dirname, "./entities/*")],
      ssl: {
        rejectUnauthorized: false,
      },
    });
    console.log("Connected to PostgreSQL");
  } catch (err) {
    console.log(err);
  }
})();

/* app.use(compression());
app.use(helmet()); */

// app.use(rateLimiter);

app.use("/api", api);

app.use(express.static(path.join(dirname, "client/build")));
app.use(express.static(path.join(dirname, "public")));

app.use((req, res, next) => {
  res.sendFile(path.join(dirname, "client/build", "index.html"));
});

app.use((req, res, next) => {
  createError(404);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ status_code: err.status || 500, error: err.message });
});

export default app;
