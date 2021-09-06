import argon2 from "argon2";
import crypto from "crypto";
import createError from "http-errors";
import { global } from "../common/constants";
import { isObjectEmpty } from "../common/helpers";
import {
  emailValidation,
  loginValidation,
  passwordValidation,
  recoveryValidation,
  signupValidation,
} from "../common/validation";
import {
  addNewUser,
  editUserResetToken,
  logUserOut,
  refreshAccessToken,
  resetUserPassword,
  resetVerificationToken,
  revokeAccessToken,
} from "../services/auth.js";
import {
  fetchUserByAuth,
  fetchUserIdByUsername,
  fetchUserIdByCreds,
} from "../services/user.js";
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from "../utils/auth.js";
import { sendEmail } from "../utils/email.js";
import { generateUuids, sanitizeData } from "../utils/helpers.js";

export const postSignUp = async ({
  userEmail,
  userUsername,
  userPassword,
  userConfirm,
  connection,
}) => {
  await signupValidation.validate(
    sanitizeData({ userEmail, userUsername, userPassword, userConfirm })
  );

  const foundId = await fetchUserIdByCreds({
    userUsername,
    userEmail,
    connection,
  });
  if (foundId) {
    throw createError(400, "Korisnički račun s tim podatcima već postoji");
  }
  const hashedPassword = await argon2.hash(userPassword);
  const { userId } = generateUuids({
    userId: null,
  });
  await addNewUser({
    userId,
    userEmail,
    userUsername,
    hashedPassword,
    connection,
  });
  return { message: "Success" };
};

export const postLogIn = async ({
  userUsername,
  userPassword,
  res,
  connection,
}) => {
  await loginValidation.validate(sanitizeData({ userUsername, userPassword }));

  const foundId = await fetchUserIdByUsername({
    userUsername,
    connection,
  });
  const foundUser = await fetchUserByAuth({ userId: foundId, connection });

  if (isObjectEmpty(foundUser)) {
    throw createError(400, "Korisnički račun nije pronađen");
  }
  const isValid = await argon2.verify(foundUser.password, userPassword);

  if (!isValid) {
    throw createError(400, "Korisnički račun nije pronađen");
  }

  const tokenPayload = {
    id: foundUser.id,
    name: foundUser.name,
    jwtVersion: foundUser.jwtVersion,
  };

  const userInfo = {
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
    reminders: foundUser.reminders,
    jwtVersion: foundUser.jwtVersion,
  };

  sendRefreshToken(res, createRefreshToken({ userData: tokenPayload }));

  return {
    accessToken: createAccessToken({ userData: tokenPayload }),
    user: userInfo,
  };
};

export const postLogOut = ({ res, connection }) => {
  return logUserOut(res);
};

export const postRefreshToken = async ({ req, res, next, connection }) => {
  return await refreshAccessToken(req, res, next, connection);
};
