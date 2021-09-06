import dotenv from "dotenv";
import path from "path";

// current dir
// const __curdir = path.dirname(new URL(import.meta.url).pathname);

// root dir
const __rootdir = path.resolve();

dotenv.config({
  path: path.resolve(
    __rootdir,
    `.env.${process.env.NODE_ENV || "development"}`
  ),
});

export const postgres = {
  database: process.env.PG_DB_URL,
};

export const mailer = {
  sender: process.env.MAILER_SENDER,
  email: process.env.MAILER_MAIL,
  password: process.env.MAILER_PASS,
};

export const uuid = {
  version: 4,
  import: "v4",
};
