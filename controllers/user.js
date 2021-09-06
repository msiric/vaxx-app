import argon2 from "argon2";
import crypto from "crypto";
import createError from "http-errors";
import { fetchPatient, removeUserPatients } from "../services/patient";
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
  removeUserEvents,
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
  deactivateExistingUser,
  patchPreferences,
} from "../services/user.js";
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from "../utils/auth.js";
import { sendEmail } from "../utils/email.js";
import { generateUuids, sanitizeData } from "../utils/helpers.js";
import { format } from "date-fns";

export const editPreferences = async ({
  userId,
  userReminders,
  connection,
}) => {
  await patchPreferences({ userId, userReminders, connection });
  return { message: "Success" };
};

export const deactivateUser = async ({ userId, connection }) => {
  await Promise.all([
    removeUserEvents({ doctorId: userId, connection }),
    removeUserPatients({ doctorId: userId, connection }),
    deactivateExistingUser({ userId, connection }),
  ]);
  return { message: "Success" };
};
