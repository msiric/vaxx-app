import { isAfter, isBefore, isValid } from "date-fns";
import escapeHTML from "escape-html";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getConnection } from "../config/database";


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
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const isPositiveInteger = (value) =>
  Number.isInteger(value) && value > 0;

export const isValidString = (value) => typeof value === "string";

export const isPastDate = (value) =>
  isValid(new Date(value)) && isBefore(new Date(value), new Date());

export const isFutureDate = (value) =>
  isValid(new Date(value)) && isAfter(new Date(value), new Date());

export const requestHandler = (action, transaction, params) => async (req, res, next) => {
  let runner;
  try {
    const boundParams = params ? params(req, res, next) : {};
    const userId = res.locals.user ? res.locals.user.id : null;
    let connection = getConnection();
    if (transaction) {
      runner = connection.createQueryRunner();
      await runner.connect();
      await runner.startTransaction();
      connection = runner.manager;
      if (userId) await connection.query('SELECT pg_advisory_xact_lock(hashtext($1))', [userId]);
    }
    // Identity and connection always come from the server, never a request body/query.
    const result = await action({ ...boundParams, userId, connection });
    if (runner) await runner.commitTransaction();
    return result && result.redirect ? res.redirect(result.redirect) : res.json(result || { message: 'OK' });
  } catch (error) {
    if (runner?.isTransactionActive) await runner.rollbackTransaction();
    next(error);
  } finally { if (runner) await runner.release(); }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    const match = /^Bearer (.+)$/.exec(req.get('Authorization') || '');
    if (!match) throw createError(401, 'Niste ulogirani');
    const data = jwt.verify(match[1], process.env.ACCESS_TOKEN_SECRET, { algorithms: ['HS256'] });
    const user = await getConnection().getRepository('User').findOneBy({ id: data.id });
    if (!user || user.jwtVersion !== data.jwtVersion ||
        (user.demoExpiresAt && user.demoExpiresAt <= new Date())) throw createError(401, 'Session expired');
    res.locals.user = data;
    return next();
  } catch (err) {
    return next(createError(401, 'Niste ulogirani'));
  }
};

export const isAuthorized = (req, res, next) => {
  if (req.params.userId !== res.locals.user?.id) return next(createError(403, 'Niste autorizirani za ovu operaciju'));
  return next();
};

export const isNotAuthenticated = (req, res, next) => {
  if (req.get('Authorization')) return next(createError(400, 'Već ste ulogirani'));
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
    generatedUuids[item] = crypto.randomUUID();
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
