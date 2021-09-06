import { addHours, formatISO } from "date-fns";
import { User } from "../entities/User";

const USER_ESSENTIAL_INFO = [
  "user.id",
  "user.email",
  "user.name",
  "user.reminders",
  "user.active",
  "user.created",
];

export const fetchUsers = async ({ connection }) => {
  const foundUsers = await connection
    .getRepository(User)
    .createQueryBuilder("user")
    .getMany();
  console.log(foundUsers);
  return foundUsers;
};

export const fetchUserIdByCreds = async ({
  userUsername,
  userEmail,
  connection,
}) => {
  const foundUser = await connection
    .getRepository(User)
    .createQueryBuilder("user")
    .select("user.id")
    .where("user.name = :name OR user.email = :email", {
      name: userUsername,
      email: userEmail,
    })
    .getOne();
  console.log(foundUser);
  return foundUser ? foundUser.id : null;
};

export const fetchUserIdByUsername = async ({ userUsername, connection }) => {
  const foundUser = await connection
    .getRepository(User)
    .createQueryBuilder("user")
    .select("user.id")
    .where("user.name = :name", {
      name: userUsername,
    })
    .getOne();
  console.log(foundUser);
  return foundUser ? foundUser.id : null;
};

export const fetchUserIdByEmail = async ({ userEmail, connection }) => {
  const foundUser = await connection
    .getRepository(User)
    .createQueryBuilder("user")
    .select("user.id")
    .where("user.email = :email", {
      email: userEmail,
    })
    .getOne();
  console.log(foundUser);
  return foundUser ? foundUser.id : null;
};

export const fetchUserById = async ({ userId, connection }) => {
  const foundUser = await connection
    .getRepository(User)
    .createQueryBuilder("user")
    .select([...USER_ESSENTIAL_INFO])
    .where("user.id = :userId", {
      userId,
    })
    .getOne();
  console.log(foundUser);
  return foundUser;
};

export const fetchUserByUsername = async ({ userUsername, connection }) => {
  const foundUser = await connection
    .getRepository(User)
    .createQueryBuilder("user")
    .select([...USER_ESSENTIAL_INFO])
    .where("user.name = :userUsername", {
      userUsername,
    })
    .getOne();
  console.log(foundUser);
  return foundUser;
};

export const fetchUserByEmail = async ({ userEmail, connection }) => {
  const foundUser = await connection
    .getRepository(User)
    .createQueryBuilder("user")
    .select([...USER_ESSENTIAL_INFO])
    .where("user.email = :email", {
      email: userEmail,
    })
    .getOne();
  console.log(foundUser);
  return foundUser;
};

export const fetchUserByAuth = async ({ userId, connection }) => {
  const foundUser = await connection
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id = :userId", { userId })
    .getOne();
  console.log(foundUser);
  return foundUser;
};

export const patchPreferences = async ({
  userId,
  userReminders,
  connection,
}) => {
  const updatedUser = await connection
    .createQueryBuilder()
    .update(User)
    .set({ reminders: userReminders })
    .where("id = :userId", {
      userId,
    })
    .execute();
  console.log(updatedUser);
  return updatedUser;
};

export const deactivateExistingUser = async ({ userId, connection }) => {
  const deletedUser = await connection
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("id = :userId", {
      userId,
    })
    .execute();
  console.log(deletedUser);
  return deletedUser;
};
