import argon2 from "argon2";
import crypto from "crypto";
import createError from "http-errors";
import { fetchPatient } from "../services/patient";
import { global } from "../common/constants";
import { isObjectEmpty } from "../common/helpers";
import {
  emailValidation,
  eventValidation,
  loginValidation,
  passwordValidation,
  recoveryValidation,
  signupValidation,
} from "../common/validation";
import {
  fetchEvents,
  addNewEvent,
  removeExistingEvent,
  fetchSpecifiedEvents,
} from "../services/event.js";
import { fetchPatients } from "../services/patient.js";
import {
  addNewPatient,
  editExistingPatient,
  updateExistingPatient,
} from "../services/patient.js";
import {
  editUserEmail,
  fetchUserByAuth,
  fetchUserByEmail,
  fetchUserByResetToken,
  fetchUserIdByCreds,
  fetchUserIdByEmail,
  fetchUserIdByUsername,
  fetchUserIdByVerificationToken,
} from "../services/user.js";
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from "../utils/auth.js";
import { sendEmail } from "../utils/email.js";
import { generateUuids, sanitizeData } from "../utils/helpers.js";
import { format } from "date-fns";

export const getAll = async ({ userId, rangeFrom, rangeTo, connection }) => {
  const foundPatients = await fetchPatients({ doctorId: userId, connection });
  const foundEvents = await fetchSpecifiedEvents({
    doctorId: userId,
    rangeFrom,
    rangeTo,
    connection,
  });
  const result = [];
  for (let patient of foundPatients) {
    const events = foundEvents.filter((event) => event.link === patient.link);
    if (events.length) {
      result.push({ ...patient, events });
    }
  }
  console.log("RESULT", foundPatients, foundEvents);
  const formatted = [];
  result.forEach((item) => {
    formatted.push({
      name: item.name,
      vaxxed: item.vaxxed === "first" ? 1 : 2,
      vaccine: item.vaccine,
      dob: item.dob,
      mbo: item.mbo,
      events: item.events.map((event) => ({
        date: event.date,
        event: event.type === "first" ? "prvi" : "drugi",
        identifier: event.identifier,
      })),
    });
  });
  return formatted;
};
