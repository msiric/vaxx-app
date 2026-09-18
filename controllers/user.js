import createError from 'http-errors';
import { deactivateExistingUser, patchPreferences } from '../services/user';

export const editPreferences = async ({
  userId,
  userReminders,
  connection,
}) => {
  if (!['enabled', 'disabled'].includes(userReminders)) throw createError(400, 'Invalid reminder preference');
  await patchPreferences({ userId, userReminders, connection });
  return { message: "Success" };
};

export const deactivateUser = async ({ userId, connection }) => {
  await deactivateExistingUser({ userId, connection });
  return { message: 'Success' };
};
