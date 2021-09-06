import jwt from "jsonwebtoken";
import { fetchUserByAuth } from "../services/user";

export const createAccessToken = ({ userData }) => {
  return jwt.sign(
    {
      id: userData.id,
      name: userData.name,
      jwtVersion: userData.jwtVersion,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const updateAccessToken = async (req, res, next, connection) => {
  const token = req.cookies.jid;
  if (!token) return { ok: false, accessToken: "" };

  let payload = null;
  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    console.log(err);
    return { ok: false, accessToken: "" };
  }

  const foundUser = await fetchUserByAuth({
    userId: payload.userId,
    connection,
  });

  if (!foundUser) {
    return { ok: false, accessToken: "" };
  }

  if (foundUser.jwtVersion !== payload.jwtVersion) {
    return { ok: false, accessToken: "" };
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
    ok: true,
    accessToken: createAccessToken({ userData: tokenPayload }),
    user: userInfo,
  };
};

export const createRefreshToken = ({ userData }) => {
  return jwt.sign(
    { userId: userData.id, jwtVersion: userData.jwtVersion },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const sendRefreshToken = (res, refreshToken) => {
  res.cookie("jid", refreshToken, {
    httpOnly: true,
    path: "api/auth/refresh_token",
  });
};
