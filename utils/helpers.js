import { isAfter, isBefore, isValid } from "date-fns";
import escapeHTML from "escape-html";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import * as uuidJs from "uuid";
import { global } from "../common/constants";
import { uuid } from "../config/secret";
import fs from "fs";
import path from "path";
import { getConnection } from "typeorm";

const dirname = path.resolve();

// this way of importing allows specifying the uuid version in the config file only once and gets propagated everywhere
const {
  validate: validateUuid,
  version: validateVersion,
  [uuid.import]: genUuid,
} = uuidJs;

const VALID_PARAMS = {
  patientId: { isValid: (value) => isValidUuid(value) },
  eventId: { isValid: (value) => isValidUuid(value) },
  userId: { isValid: (value) => isValidUuid(value) },
  cursor: { isValid: (value) => isValidUuid(value) },
  limit: { isValid: (value) => isPositiveInteger(value) },
  start: { isValid: (value) => isPastDate(value) },
  end: { isValid: (value) => isFutureDate(value) },
};

export const isValidUuid = (value) =>
  validateUuid(value) && validateVersion(value) === uuid.version;

export const isPositiveInteger = (value) =>
  Number.isInteger(value) && value > 0;

export const isValidString = (value) => typeof value === "string";

export const isPastDate = (value) =>
  isValid(new Date(value)) && isBefore(new Date(value), new Date());

export const isFutureDate = (value) =>
  isValid(new Date(value)) && isAfter(new Date(value), new Date());

export const requestHandler =
  (promise, transaction, params) => async (req, res, next) => {
    const boundParams = params ? params(req, res, next) : {};
    const userId = res.locals.user ? res.locals.user.id : null;
    const handleRequest = (result) => {
      if (result) {
        if (result.redirect) {
          return res.redirect(result.redirect);
        } else {
          return res.json(result);
        }
      } else {
        return res.json({ message: "OK" });
      }
    };
    if (transaction) {
      const queryRunner = getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const result = await promise({
          userId,
          connection: queryRunner.manager,
          ...boundParams,
        });
        await queryRunner.commitTransaction();
        return handleRequest(result);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.log(error);
        next(error);
      } finally {
        await queryRunner.release();
      }
    } else {
      try {
        const connection = getConnection();
        const result = await promise({
          userId,
          connection,
          ...boundParams,
        });
        return handleRequest(result);
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  };

export const isAuthenticated = async (req, res, next) => {
  try {
    const authentication = req.headers["authorization"];
    if (!authentication) throw createError(403, "Zabranjen pristup");
    const token = authentication.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
      ignoreExpiration: true,
    });
    const data = jwt.decode(token);
    if (Date.now() >= data.exp * 1000)
      throw createError(401, "Niste ulogirani");
    res.locals.user = data;
  } catch (err) {
    console.log(err);
    next(err);
  }

  return next();
};

export const isAuthorized = async (req, res, next) => {
  if (req.params.userId !== res.locals.user.id) {
    throw createError(400, "Niste autorizirani za ovu operaciju");
  }
  return next();
};

export const isNotAuthenticated = async (req, res, next) => {
  const authentication = req.headers["authorization"];
  if (authentication) throw createError(400, "Već ste ulogirani");

  return next();
};

export const validateParams = (req, res, next) => {
  let isValid = true;
  for (let param in req.params) {
    const value = req.params[param];
    if (!value) isValid = false;
    else if (VALID_PARAMS[param] && !VALID_PARAMS[param].isValid(value))
      isValid = false;
  }
  if (isValid) return next();
  throw createError(400, "Neispravan URL parametar");
};

export const sanitizeData = (body) =>
  Object.keys(body).reduce((obj, key) => {
    if (body[key] === null) return obj;
    if (Array.isArray(body[key])) {
      obj[key] = body[key].map((elem) => {
        if (typeof elem === "object") return sanitizeData(elem);
        return escapeHTML(elem);
      });
    } else if (typeof body[key] === "object") {
      obj[key] = sanitizeData(body[key]);
    } else {
      obj[key] = escapeHTML(body[key]);
    }
    return obj;
  }, {});

export const generateUuids = ({ ...args }) => {
  const generatedUuids = {};
  for (let item in args) {
    generatedUuids[item] = genUuid();
  }
  return generatedUuids;
};

export const targetVaccination = (vaccine) => {
  let target;
  switch (vaccine) {
    case "moderna":
      target = "second";
      break;
    case "astrazeneca":
      target = "second";
      break;
    case "pfizer":
      target = "second";
      break;
    case "johnson":
      target = "first";
      break;
    default:
      target = "second";
  }
  return target;
};
