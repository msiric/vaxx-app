import { ax } from "../Interceptor.js";

export const patchPreferences = {
  request: async ({ userId, data }) =>
    await ax.patch(`/api/users/${userId}/preferences`, data),
  success: { message: "Postavke uspješno izmijenjene", variant: "success" },
  error: { message: "Greška prilikom izmjene postavki", variant: "error" },
};
export const deactivateUser = {
  request: async ({ userId }) =>
    await ax.post(`/api/users/${userId}/deactivate`),
  success: {
    message: "Korisnički račun uspješno izbrisan",
    variant: "success",
  },
  error: {
    message: "Greška prilikom deaktivacije korisničkog računa",
    variant: "error",
  },
};
