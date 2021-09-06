import { addHours, formatISO } from "date-fns";
import { User } from "../entities/User";
import { sendRefreshToken, updateAccessToken } from "../utils/auth.js";

export const addNewUser = async ({
  userId,
  userEmail,
  userUsername,
  hashedPassword,
  connection,
}) => {
  const savedUser = await connection
    .createQueryBuilder()
    .insert()
    .into(User)
    .values([
      {
        id: userId,
        email: userEmail,
        name: userUsername,
        password: hashedPassword,
      },
    ])
    .execute();
  console.log(savedUser);
  return savedUser;
};

export const logUserOut = (res) => {
  sendRefreshToken(res, "");
  return { accessToken: "", user: "" };
};

export const refreshAccessToken = async (req, res, next, connection) => {
  return await updateAccessToken(req, res, next, connection);
};
