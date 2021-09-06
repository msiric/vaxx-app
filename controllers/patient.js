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

export const getPatients = async ({ userId, connection }) => {
  const foundPatients = await fetchPatients({ doctorId: userId, connection });
  return { patients: foundPatients };
};

export const patchPatient = async ({
  patientId,
  patientData,
  userId,
  connection,
}) => {
  await updateExistingPatient({
    patientId,
    patientData,
    doctorId: userId,
    connection,
  });
  return { message: "Patient updated successfully" };
};
